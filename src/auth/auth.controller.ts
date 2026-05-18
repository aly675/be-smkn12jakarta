import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth') // Biar rapi ngelompok di Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Standarnya Post itu 201 Created, kita ubah jadi 200 OK karena cuma baca data
  @ApiOperation({ summary: 'Login User/Admin untuk dapat token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin', description: 'Bisa diisi username atau email' },
        password: { type: 'string', example: 'rahasia123' },
      },
    },
  })
  login(@Body() body: Record<string, any>) {
    // Panggil fungsi login di service dengan data dari body request
    return this.authService.login(body.username, body.password);
  }
}