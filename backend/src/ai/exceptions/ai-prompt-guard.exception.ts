import { BadRequestException } from '@nestjs/common';

export class AiPromptGuardException extends BadRequestException {
  constructor(message: string) {
    super({
      statusCode: 400,
      error: 'AiPromptGuardError',
      message,
    });
  }
}
