import { Injectable, BadRequestException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const SECRET_PREFIX = 'enc:v1:';

@Injectable()
export class SettingsCryptoService {
  private getEncryptionKey(): Buffer {
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      throw new BadRequestException('Missing SESSION_SECRET: encrypted API keys require SESSION_SECRET to be set.');
    }

    return createHash('sha256').update(sessionSecret).digest();
  }

  encryptSecret(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${SECRET_PREFIX}${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
  }

  decryptSecret(value: string): string {
    if (!value.startsWith(SECRET_PREFIX)) {
      return value;
    }

    const payload = value.slice(SECRET_PREFIX.length);
    const [ivText, authTagText, encryptedText] = payload.split('.');
    if (!ivText || !authTagText || !encryptedText) {
      throw new BadRequestException('Stored API key is corrupted. Please save a new API key.');
    }

    const iv = Buffer.from(ivText, 'base64');
    const authTag = Buffer.from(authTagText, 'base64');
    const encrypted = Buffer.from(encryptedText, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
