import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Budi Santoso Baru' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MaxLength(100, { message: 'Nama maksimal 100 karakter bro!' })
  name?: string;

  @ApiPropertyOptional({ example: 'budibaru' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @MinLength(3, { message: 'Username minimal 3 karakter bro!' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter!' })
  username?: string;

  @ApiPropertyOptional({ example: 'budibaru@smkn12jakarta.sch.id' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEmail({}, { message: 'Format email salah, wajib pakai @' })
  @MinLength(5, { message: 'Email minimal 5 karakter bro!' })
  email?: string;

  @ApiPropertyOptional({ example: 'passwordBaru123' })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Password baru minimal 5 karakter bro!' })
  password?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.GURU })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(Role, { message: 'Role tidak terdaftar di sistem!' })
  role?: Role;
}