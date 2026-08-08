import { IsString, IsNotEmpty } from 'class-validator';

export class NoteDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
