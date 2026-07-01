import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, UseInterceptors, UploadedFile, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  Query 
} from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { CreatePrincipalDto } from './dto/create-principal.dto';
import { UpdatePrincipalDto } from './dto/update-principal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { AuthHelper } from 'src/common/helper/auth.helper';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Principal (Kepala Sekolah)')
@Controller('principal')
export class PrincipalController {
  constructor(
    private readonly principalService: PrincipalService,
    private readonly minioService: MinioService
  ) {}

  // ==========================================
  // UPLOAD FOTO KEPALA SEKOLAH
  // ==========================================
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto Kepala Sekolah (Khusus Admin, Otomatis WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPrincipalImage(
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
    AuthHelper.checkIsAdmin(req.user.role, 'upload foto kepala sekolah');

    // Upload ke bucket MinIO folder 'principal'
    const imageUrl = await this.minioService.uploadImage(file, 'principal');
    
    return {
      message: 'Foto Kepala Sekolah berhasil di-upload bro!',
      url: imageUrl,
    };
  }

  // ==========================================
  // Tambah data Kepala Sekolah baru (Khusus Admin)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data Kepala Sekolah baru (Khusus Admin)' })
  create(@Body() createPrincipalDto: CreatePrincipalDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    
    return this.principalService.create(createPrincipalDto, createdById, userRole);
  }

  // ==========================================
  // Ambil data Kepala Sekolah yang sedang menjabat (Tampil di Frontend)
  // ==========================================
  @Get('active')
  @ApiOperation({ summary: 'Ambil data Kepala Sekolah yang sedang menjabat (Tampil di Frontend)' })
  findActive() {
    return this.principalService.findActive();
  }

  // ==========================================
  // Ambil riwayat semua Kepala Sekolah (Public + Pagination)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil riwayat semua Kepala Sekolah (Public + Pagination)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.principalService.findAll(pageNumber, limitNumber);
  }

  // ==========================================
  // Ambil detail Kepala Sekolah berdasarkan ID (Public)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail Kepala Sekolah berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Kepala Sekolah (UUID)' })
  findOne(@Param('id') id: string) {
    return this.principalService.findOne(id);
  }

  // ==========================================
  // Update data Kepala Sekolah (Khusus Admin)
  // ==========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data Kepala Sekolah (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Kepala Sekolah (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updatePrincipalDto: UpdatePrincipalDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.principalService.update(id, updatePrincipalDto, userRole);
  }

  // ==========================================
  // Hapus data Kepala Sekolah (Khusus Admin)
  // ==========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data Kepala Sekolah (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Kepala Sekolah (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    return this.principalService.remove(id, userRole);
  }
}