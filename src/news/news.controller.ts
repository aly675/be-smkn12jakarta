import { Controller, Get, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('News')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly minioService: MinioService 
  ) {}

  // ==========================================
  // JALUR 1: UPLOAD GAMBAR BERITA (File Binary)
  // ==========================================
  @Post('upload-image')
  @ApiOperation({ summary: 'Upload gambar untuk thumbnail/isi berita (Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadNewsImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024, message: 'Maksimal 2MB bro!' }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    const imageUrl = await this.minioService.uploadFile(file, 'news');
    
    return {
      message: 'Gambar berhasil di-upload!',
      imageUrl: imageUrl,
    };
  }

  // ==========================================
  // JALUR 2: CREATE BERITA UTAMA (Data JSON)
  // ==========================================
  @Post()
  @ApiOperation({ summary: 'Terbitkan berita baru (JSON)' })
  create(@Body() createNewsDto: CreateNewsDto, @Req() req: any) {
    const authorId = req.user.id; 
    return this.newsService.create(createNewsDto, authorId);
  }

  // ==========================================
  // JALUR 3: BACA SEMUA BERITA (PAGINATION & SEARCH)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua berita (Public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari judul/konten' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter kategori' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    // Convert string dari URL jadi angka (pakai tanda +)
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;

    return this.newsService.findAll(pageNumber, limitNumber, search, category);
  }
}