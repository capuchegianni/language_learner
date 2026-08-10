import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async getAllWords(userId: string) {
    return this.prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchWords(userId: string, query: string) {
    return this.prisma.word.findMany({
      where: {
        userId,
        OR: [
          { targetLanguage: { contains: query } },
          { nativeLanguage: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWord(
    userId: string,
    data: {
      targetLanguage: string;
      nativeLanguage: string;
      pronunciation?: string;
      partOfSpeech?: string;
      notes?: string;
    },
  ) {
    return this.prisma.word.create({ data: { ...data, userId } });
  }

  async updateWord(
    userId: string,
    id: string,
    data: {
      targetLanguage?: string;
      nativeLanguage?: string;
      pronunciation?: string;
      partOfSpeech?: string;
      notes?: string;
    },
  ) {
    return this.prisma.word.update({
      where: { id, userId },
      data,
    });
  }

  async deleteWord(userId: string, id: string) {
    return this.prisma.word.delete({ where: { id, userId } });
  }
}
