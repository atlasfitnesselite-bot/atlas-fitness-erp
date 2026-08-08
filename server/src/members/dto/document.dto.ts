import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class DocumentDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
