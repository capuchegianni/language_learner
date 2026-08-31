import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordDto, UpdateWordDto } from './dto/word.dto';

@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllWords(userId: string) {
    return this.prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchWords(userId: string, query: string) {
    const trimmed = query.trim();
    return this.prisma.word.findMany({
      where: {
        userId,
        OR: [
          { targetLanguage: { contains: trimmed } },
          { nativeLanguage: { contains: trimmed } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWord(userId: string, data: CreateWordDto) {
    let notes = data.notes;
    if (notes && notes.length > 80) {
      notes = notes.substring(0, 80);
    }
    return this.prisma.word.create({
      data: {
        targetLanguage: data.targetLanguage,
        nativeLanguage: data.nativeLanguage,
        pronunciation: data.pronunciation || null,
        partOfSpeech: data.partOfSpeech || null,
        notes: notes || null,
        userId,
      },
    });
  }

  async updateWord(userId: string, id: string, data: UpdateWordDto) {
    const existing = await this.prisma.word.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Word with ID '${id}' not found`);
    }

    let notes = data.notes !== undefined ? data.notes : existing.notes;
    if (notes && notes.length > 80) {
      notes = notes.substring(0, 80);
    }

    return this.prisma.word.update({
      where: { id },
      data: {
        ...(data.targetLanguage ? { targetLanguage: data.targetLanguage } : {}),
        ...(data.nativeLanguage ? { nativeLanguage: data.nativeLanguage } : {}),
        ...(data.pronunciation !== undefined ? { pronunciation: data.pronunciation || null } : {}),
        ...(data.partOfSpeech !== undefined ? { partOfSpeech: data.partOfSpeech || null } : {}),
        notes: notes || null,
      },
    });
  }

  async deleteWord(userId: string, id: string) {
    const existing = await this.prisma.word.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Word with ID '${id}' not found`);
    }

    return this.prisma.word.delete({ where: { id } });
  }
}
