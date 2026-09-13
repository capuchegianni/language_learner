import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty({ message: 'Rule title cannot be empty' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Rule explanation cannot be empty' })
  explanation!: string;

  @IsString()
  @IsNotEmpty({ message: 'Rule examples cannot be empty' })
  examples!: string; // JSON string or text

  @IsOptional()
  @IsString()
  exceptions?: string;
}

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  explanation?: string;

  @IsOptional()
  @IsString()
  examples?: string;

  @IsOptional()
  @IsString()
  exceptions?: string;
}

export class RuleQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
