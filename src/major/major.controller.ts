import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query, UseInterceptors, UploadedFile, UploadedFiles,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { AuthHelper } from '../common/helper/auth.helper';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Major (Jurusan)')
@Controller('major')
export class MajorController {
  constructor(
    private readonly majorService: MajorService,
    private readonly minioService: MinioService
  ) {}

  // ==========================================
  // JALUR 1: UPLOAD FOTO UTAMA JURUSAN (File Binary)
  // ==========================================
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto utama jurusan (Khusus Admin, Otomatis WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMajorImage(
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
    AuthHelper.checkIsAdmin(req.user.role, 'upload foto jurusan');
    const imageUrl = await this.minioService.uploadImage(file, 'major');
    return { message: 'Foto utama jurusan berhasil di-upload bro!', url: imageUrl };
  }

  // ==========================================
  // JALUR 2: UPLOAD FOTO PRAKTIK JURUSAN (Beberapa File Binary)
  // ==========================================
  @Post('upload-practice-images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload beberapa foto praktik sekaligus (Khusus Admin, Maks 5 File, Per File Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Pilih beberapa foto praktik sekaligus'
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 5)) 
  async uploadPracticeImages(
    @Req() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    AuthHelper.checkIsAdmin(req.user.role, 'upload foto praktik jurusan');

    if (!files || files.length === 0) {
      return { message: 'Nggak ada file yang di-upload bro!', urls: [] };
    }

    // Looping & upload semua foto ke MinIO pake Promise.all biar sekejap kelar
    const uploadPromises = files.map(file => this.minioService.uploadImage(file, 'major/practice'));
    const imageUrls = await Promise.all(uploadPromises);

    return {
      message: `Mantap bro, ${files.length} foto praktik berhasil di-upload!`,
      urls: imageUrls,
    };
  }

  // ==========================================
  // JALUR 3: TAMBAH DATA JURUSAN BARU (Khusus Admin, Data JSON)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data jurusan baru (Khusus Admin)' })
  create(@Body() createMajorDto: CreateMajorDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    return this.majorService.create(createMajorDto, createdById, userRole);
  }

  // ==========================================
  // JALUR 4: AMBIL SEMUA DATA JURUSAN (Public + Pagination + Search)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data jurusan (Public + Pagination + Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari berdasarkan nama atau deskripsi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    return this.majorService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // JALUR 5: AMBIL DETAIL JURUSAN BERDASARKAN SLUG (Public untuk Frontend)
  // ==========================================
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Ambil detail jurusan berdasarkan Slug (Public untuk Frontend)' })
  @ApiParam({ name: 'slug', type: 'string', example: 'rekayasa-perangkat-lunak' })
  findBySlug(@Param('slug') slug: string) {
    return this.majorService.findBySlug(slug);
  }

  // ==========================================
  // JALUR 6: AMBIL DETAIL JURUSAN BERDASARKAN ID (Public)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail jurusan berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Jurusan (UUID)' })
  findOne(@Param('id') id: string) {
    return this.majorService.findOne(id);
  }

  // ==========================================
  // JALUR 7: UPDATE DATA JURUSAN (Khusus Admin, Data JSON)
  // ==========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data jurusan (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Jurusan (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updateMajorDto: UpdateMajorDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.majorService.update(id, updateMajorDto, userRole);
  }

  // ==========================================
  // JALUR 8: HAPUS DATA JURUSAN (Khusus Admin)
  // ==========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data jurusan (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Jurusan (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    return this.majorService.remove(id, userRole);
  }
}