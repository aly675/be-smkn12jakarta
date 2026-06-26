import { Controller, Post, Body, Get, Patch, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query, Param } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam  } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PengumumanType, PengumumanTarget } from '@prisma/client';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@ApiTags('Announcement')
@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly minioService: MinioService
  ) {}

  // ==========================================
  // JALUR 1: UPLOAD DOKUMEN PENGUMUMAN
  // ==========================================
  @Post('upload-file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file lampiran pengumuman (PDF/Word/Excel, Maks 5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAnnouncementFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: 'Ukuran file maksimal 5MB bro!' }),
          // Izinin PDF, Word, Excel, dan gambar basic
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|xls|xlsx|png|jpeg|jpg)' }), 
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    // Panggil fungsi BARU kita yang gak pake kompresi sharp!
    const fileUrl = await this.minioService.uploadDocument(file, 'announcements');
    
    return {
      message: 'Dokumen berhasil di-upload!',
      url: fileUrl,
      originalName: file.originalname // Balikin nama aslinya biar FE bisa naruh di kolom 'name'
    };
  }

 // ==========================================
  // JALUR 2: CREATE PENGUMUMAN (JSON)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terbitkan pengumuman baru' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Req() req: any) {
    // Ambil ID user dari JWT (yang bikin pengumuman)
    const createdById = req.user.id;
    return this.announcementService.create(createAnnouncementDto, createdById);
  }

  // ==========================================
  // JALUR 3: AMBIL SEMUA PENGUMUMAN (PUBLIC + PAGINATION + FILTER)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua pengumuman (Public + Pagination + Filter)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari judul/konten' })
  @ApiQuery({ name: 'type', required: false, enum: PengumumanType, description: 'Filter jenis pengumuman' })
  @ApiQuery({ name: 'target', required: false, enum: PengumumanTarget, description: 'Filter target' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: PengumumanType,
    @Query('target') target?: PengumumanTarget,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.announcementService.findAll(pageNumber, limitNumber, search, type, target);
  }

  // ===========================================
  // JALUR 4: AMBIL DETAIL PENGUMUMAN BERDASARKAN ID
  // ===========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail pengumuman berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Pengumuman (UUID)' })
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  // ===========================================
  // JALUR 5: UPDATE PENGUMUMAN BERDASARKAN ID
  // ===========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pengumuman berdasarkan ID (Pemilik & Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Pengumuman (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updateAnnouncementDto: UpdateAnnouncementDto, 
    @Req() req: any
  ) {
    const loggedInUserId = req.user.id; 
    const userRole = req.user.role; 
    
    return this.announcementService.update(id, updateAnnouncementDto, loggedInUserId, userRole);
  }

  // ===========================================
  // JALUR 6: HAPUS PENGUMUMAN BERDASARKAN ID
  // ===========================================
 @Delete(':id')
  @UseGuards(JwtAuthGuard) // Wajib login pastinya
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus pengumuman berdasarkan ID (Pemilik & Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Pengumuman (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const loggedInUserId = req.user.id;
    const userRole = req.user.role;
    
    // Lempar id, user login, dan role-nya ke service
    return this.announcementService.remove(id, loggedInUserId, userRole);
  }

}
