import { Controller, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
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
}