import { IsString, IsEnum, IsArray, IsOptional, IsNumber, Min } from 'class-validator';
import { LogicType, ConditionType } from '../entities/policy.entity';

export class CreatePolicyDto {
  @IsString() creator: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(LogicType) logicType: LogicType;
  @IsArray() conditions: ConditionDto[];
  @IsOptional() @IsNumber() @Min(60) expirationSeconds?: number = 3600;
  @IsOptional() @IsString() metadataUri?: string;
}

export class UpdatePolicyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(LogicType) logicType?: LogicType;
  @IsOptional() @IsArray() conditions?: ConditionDto[];
  @IsOptional() @IsNumber() @Min(60) expirationSeconds?: number;
}

export class ConditionDto {
  @IsEnum(ConditionType) type: ConditionType;
  @IsOptional() @IsString() asset?: string;
  @IsOptional() @IsString() collectionId?: string;
  @IsOptional() @IsString() operator?: string;
  @IsOptional() @IsNumber() value?: number;
}