import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'passwordBaru123', description: 'Password baru untuk user' })
  @IsNotEmpty({ message: 'Password baru nggak boleh kosong bro!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter ya!' })
  newPassword!: string;
}