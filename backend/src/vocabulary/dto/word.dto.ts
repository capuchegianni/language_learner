import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty({ message: 'Target language word/phrase cannot be empty' })
  targetLanguage!: string;

  @IsString()
  @IsNotEmpty({ message: 'Native language translation cannot be empty' })
  nativeLanguage!: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'Notes must not exceed 80 characters' })
  notes?: string;
}

export class UpdateWordDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nativeLanguage?: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'Notes must not exceed 80 characters' })
  notes?: string;
}

export class WordQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
