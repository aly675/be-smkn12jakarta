import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query, UseInterceptors, UploadedFile, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { AuthHelper } from '../common/helper/auth.helper';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Achievement')
@Controller('achievement')
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly minioService: MinioService
  ) {}

  // ==========================================
  // UPLOAD FOTO DOKUMENTASI PRESTASI (Khusus Admin, Otomatis WebP, Maks 2MB)
  // ==========================================
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto dokumentasi prestasi (Khusus Admin, Otomatis WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAchievementImage(
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
    // 1. Validasi Mutlak: Cuma Admin yang boleh upload foto prestasi
    AuthHelper.checkIsAdmin(req.user.role, 'upload foto prestasi');

    // 2. Upload ke bucket MinIO folder 'achievement' (nanti url-nya otomatis di-generate)
    const imageUrl = await this.minioService.uploadImage(file, 'achievement');
    
    return {
      message: 'Foto dokumentasi prestasi berhasil di-upload bro!',
      url: imageUrl,
    };
  }

  // ==========================================
  // Membuat data prestasi baru (Khusus Admin)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data prestasi baru (Khusus Admin)' })
  create(@Body() createAchievementDto: CreateAchievementDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    
    return this.achievementService.create(createAchievementDto, createdById, userRole);
  }

  // ==========================================
  // Ambil semua data prestasi (Public + Pagination + Search)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data prestasi (Public + Pagination + Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari berdasarkan judul, tingkat, kategori, atau nama peserta' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.achievementService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // Ambil detail prestasi berdasarkan ID (Public)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail prestasi berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Prestasi (UUID)' })
  findOne(@Param('id') id: string) {
    return this.achievementService.findOne(id);
  }

  // ==========================================
  // Update data prestasi berdasarkan ID (Khusus Admin)
  // ==========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data prestasi (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Prestasi (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updateAchievementDto: UpdateAchievementDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.achievementService.update(id, updateAchievementDto, userRole);
  }

  // ==========================================
  // Hapus data prestasi berdasarkan ID (Khusus Admin)
  // ==========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data prestasi (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Prestasi (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    return this.achievementService.remove(id, userRole);
  }
}