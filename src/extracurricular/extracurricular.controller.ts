import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ExtracurricularService } from './extracurricular.service';
import { CreateExtracurricularDto } from './dto/create-extracurricular.dto';
import { UpdateExtracurricularDto } from './dto/update-extracurricular.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from 'src/minio/minio.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Extracurricular')
@Controller('extracurricular')
export class ExtracurricularController {
  constructor(
    private readonly extracurricularService: ExtracurricularService,
    private readonly minioService: MinioService
  ) {}
// ==========================================
  // JALUR 1: UPLOAD GAMBAR EKSKUL (Otomatis WebP)
  // ==========================================
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto/logo ekskul (Otomatis dikompres ke WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEkskulImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024, message: 'Ukuran gambar maksimal 2MB bro!' }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    // Kita panggil fungsi uploadImage yang udah ada sharp (kompresi) di dalamnya
    const imageUrl = await this.minioService.uploadImage(file, 'extracurricular');
    
    return {
      message: 'Gambar ekskul berhasil di-upload bro!',
      url: imageUrl,
    };
  }

  // ==========================================
  // JALUR 2: CREATE DATA EKSKUL (JSON)
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data ekstrakurikuler baru' })
  create(@Body() createExtracurricularDto: CreateExtracurricularDto, @Req() req: any) {
    const createdById = req.user.id;
    return this.extracurricularService.create(createExtracurricularDto, createdById);
  }

  // ==========================================
  // JALUR 3: READ DATA EKSKUL (PUBLIC, PAGINATION, SEARCH)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data ekskul (Public + Pagination + Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari nama ekskul atau pelatih' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.extracurricularService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // JALUR 4: READ DETAIL DATA EKSKUL (PUBLIC)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail ekskul berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Ekskul (UUID)' })
  findOne(@Param('id') id: string) {
    return this.extracurricularService.findOne(id);
  }

  // ==========================================
  // JALUR 5: UPDATE DATA EKSKUL (PEMILIK & ADMIN)
  // ==========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data ekskul (Pemilik & Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Ekskul (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updateExtracurricularDto: UpdateExtracurricularDto, 
    @Req() req: any
  ) {
    const loggedInUserId = req.user.id; 
    const userRole = req.user.role; 
    
    return this.extracurricularService.update(id, updateExtracurricularDto, loggedInUserId, userRole);
  }

  // ==========================================
  // JALUR 6: DELETE DATA EKSKUL (PEMILIK & ADMIN)
  // ==========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data ekskul (Pemilik & Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Ekskul (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const loggedInUserId = req.user.id;
    const userRole = req.user.role;
    
    // Lempar id ekskul, id user yang request, dan role-nya ke service
    return this.extracurricularService.remove(id, loggedInUserId, userRole);
  }
}
