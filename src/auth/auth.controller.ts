import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

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
  // ==========================================
  // RUTE BARU BUAT NGETES SATPAM
  // ==========================================
  // @Get('profile')
  // @UseGuards(JwtAuthGuard) // <-- Pak Satpam jaga pintu di sini!
  // @ApiBearerAuth() // <-- Kasih tahu Swagger kalau butuh token
  // @ApiOperation({ summary: 'Tes akses area VVIP (Wajib bawa token)' })
  // getProfile(@Req() req) {
  //   // Kalau lolos satpam, req.user bakal berisi data dari jwt.strategy
  //   return {
  //     message: 'Berhasil nembus penjagaan satpam bro!',
  //     data_lu: req.user, 
  //   };
  // }
}