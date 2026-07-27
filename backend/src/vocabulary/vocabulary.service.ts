import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async getAllWords() {
    return this.prisma.word.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchWords(query: string) {
    return this.prisma.word.findMany({
      where: {
        OR: [
          { korean: { contains: query } },
          { english: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWord(data: {
    korean: string;
    english: string;
    pronunciation?: string;
    partOfSpeech?: string;
    notes?: string;
  }) {
    return this.prisma.word.create({ data });
  }

  async updateWord(
    id: string,
    data: {
      korean?: string;
      english?: string;
      pronunciation?: string;
      partOfSpeech?: string;
      notes?: string;
    },
  ) {
    return this.prisma.word.update({
      where: { id },
      data,
    });
  }

  async deleteWord(id: string) {
    return this.prisma.word.delete({ where: { id } });
  }
}
