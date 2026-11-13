import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const BAN_DURATION_PRESETS = [
  '1h',
  '24h',
  '48h',
  '7d',
  '1m',
  '1y',
  'Permanent',
  'permanent',
] as const;

export type BanDurationPreset = (typeof BAN_DURATION_PRESETS)[number];

export class BanUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Duration is required' })
  @IsIn(BAN_DURATION_PRESETS, {
    message: 'duration must be one of: 1h, 24h, 48h, 7d, 1m, 1y, Permanent',
  })
  duration!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
