import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, id?: string) => void): void {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: (err: Error | null, user?: User | null) => void): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return done(null, null);
      }

      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
