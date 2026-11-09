import { IsEnum } from 'class-validator';
import { Plan } from '../../generated/prisma/client';

export class UpdateUserPlanDto {
  @IsEnum(Plan)
  plan!: Plan;
}

