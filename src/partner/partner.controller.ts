import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query, UseInterceptors, UploadedFile, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { AuthHelper } from '../common/helper/auth.helper';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Partner (Mitra Industri)')
@Controller('partner')
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly minioService: MinioService
  ) {}

  //===============================
  //upload logo mitra industri (Khusus Admin, maksimal 1MB)
  //===============================
  @Post('upload-logo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload logo perusahaan mitra (Khusus Admin, Otomatis WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPartnerLogo(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024, message: 'Ukuran logo maksimal 2MB bro!' }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    AuthHelper.checkIsAdmin(req.user.role, 'upload logo mitra');
    const imageUrl = await this.minioService.uploadImage(file, 'partner');
    return { message: 'Logo perusahaan berhasil di-upload bro!', url: imageUrl };
  }

  //===============================
  // Tambah Mitra Baru (Khusus Admin)
  //===============================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data mitra baru (Khusus Admin)' })
  create(@Body() createPartnerDto: CreatePartnerDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    return this.partnerService.create(createPartnerDto, createdById, userRole);
  }

  //===============================
  // Ambil Semua Data Mitra Industri (Public + Pagination + Search)
  //===============================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data mitra industri (Public + Pagination + Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari berdasarkan nama, deskripsi, atau tipe kerja sama' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    return this.partnerService.findAll(pageNumber, limitNumber, search);
  }

  //===============================
  // Ambil Detail Mitra Industri Berdasarkan ID (Public)
  //===============================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail mitra industri berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Partner (UUID)' })
  findOne(@Param('id') id: string) {
    return this.partnerService.findOne(id);
  }

  //===============================
  // Update Data Mitra Industri (Khusus Admin)
  //=============================== 
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data mitra industri (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Partner (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updatePartnerDto: UpdatePartnerDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.partnerService.update(id, updatePartnerDto, userRole);
  }

  //===============================
  // Hapus Data Mitra Industri (Khusus Admin)
  //===============================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data mitra industri (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Partner (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    return this.partnerService.remove(id, userRole);
  }
}