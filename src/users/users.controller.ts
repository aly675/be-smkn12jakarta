import { UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users') 
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==========================================
  // JALUR 1: CREATE USER BARU (Data JSON)
  // ==========================================
 @Post()
  @ApiOperation({ summary: 'Bikin user baru' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ==========================================
  // JALUR 2: AMBIL DATA USER (JSON)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua daftar pengguna (Pagination & Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari berdasarkan email/username/nama/role' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.usersService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // JALUR 3: AMBIL DATA USER BERDASARKAN ID (Data JSON)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil data user berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ==========================================
  // JALUR 4: UPDATE DATA USER BERDASARKAN ID (Data JSON)
  // ==========================================
  @Patch(':id')
  @ApiOperation({ summary: 'Update data user berdasarkan ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // ==========================================
  // JALUR 5: HAPUS USER BERDASARKAN ID (Data JSON)
  // ==========================================
  @Delete(':id')
  @ApiOperation({ summary: 'Hapus user berdasarkan ID' })
  remove(@Param('id') id: string, @Req() req: any) {
    // req.user.id ini dapet dari hasil scan tiket JWT oleh jwt.strategy.ts
    const currentUserId = req.user.id; 
    
    // Kita lempar id target dan id kita sendiri ke service
    return this.usersService.remove(id as any, currentUserId);
  }

  // ==========================================
  // JALUR 6: UPLOAD AVATAR USER (File Binary)
  // ==========================================
  @Post(':id/avatar')
  @ApiOperation({ summary: 'Upload atau ganti avatar user (Maks 500KB)' })
  @ApiConsumes('multipart/form-data') // Ngasih tau Swagger ini form upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary', // Biar muncul tombol "Choose File" di Swagger
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar')) // Nangkep file dari field bernama 'avatar'
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Satpam Ukuran: Maksimal 500 KB (500 * 1024 bytes)
          new MaxFileSizeValidator({ maxSize: 500 * 1024, message: 'File kebesaran bro! Maksimal 500KB aja.' }),
          // Satpam Format: Cuma nerima jpeg, jpg, png
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: true, 
      }),
    ) file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(id, file);
  }

  
}
