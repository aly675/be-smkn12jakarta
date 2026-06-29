import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { MinioService } from 'src/minio/minio.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthHelper } from '../common/helper/auth.helper';

@ApiTags('teacher')
@Controller('teacher')
export class TeacherController {
  constructor(
    private readonly teacherService: TeacherService,
    private readonly minioService: MinioService
  ) {}

// ==========================================
  // JALUR 1: UPLOAD FOTO GURU (Otomatis WebP)
  // ==========================================
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto profil guru (Otomatis WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadTeacherImage(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024, message: 'Ukuran foto maksimal 2MB bro!' }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    // Validasi: Cuma Admin yang boleh upload foto guru
    AuthHelper.checkIsAdmin(req.user.role, 'upload foto guru');

    const imageUrl = await this.minioService.uploadImage(file, 'teacher');
    
    return {
      message: 'Foto guru berhasil di-upload bro!',
      url: imageUrl,
    };
  }

  // ==========================================
  // JALUR 2: CREATE DATA GURU (JSON)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data guru baru (Khusus Admin)' })
  create(@Body() createTeacherDto: CreateTeacherDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    
    return this.teacherService.create(createTeacherDto, createdById, userRole);
  }

  // ==========================================
  // JALUR 3: AMBIL SEMUA DATA GURU (PAGINATION + SEARCH)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data guru (Public + Pagination + Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari berdasarkan nama, nip, mapel, posisi, atau pendidikan' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.teacherService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // JALUR 4: AMBIL DETAIL DATA GURU BERDASARKAN ID
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail guru berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Guru (UUID)' })
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data guru (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Guru (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updateTeacherDto: UpdateTeacherDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.teacherService.update(id, updateTeacherDto, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data guru (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Guru (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    
    return this.teacherService.remove(id, userRole);
  }
}
