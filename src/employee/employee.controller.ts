import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query, UseInterceptors, UploadedFile, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../minio/minio.service';
import { AuthHelper } from 'src/common/helper/auth.helper';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly minioService: MinioService
  ) {}

  // ==========================================
  // UPLOAD FOTO PEGAWAI
  // ==========================================
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto profil pegawai (Otomatis WebP, Maks 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEmployeeImage(
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
    // 1. Validasi Mutlak: Cuma Admin yang boleh upload foto
    AuthHelper.checkIsAdmin(req.user.role, 'upload foto pegawai');

    // 2. Upload ke bucket MinIO folder 'employee'
    const imageUrl = await this.minioService.uploadImage(file, 'employee');
    
    return {
      message: 'Foto pegawai berhasil di-upload bro!',
      url: imageUrl,
    };
  }

  // ==========================================
  // CREATE PEGAWAI
  // ==========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data pegawai baru (Khusus Admin)' })
  create(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    
    return this.employeeService.create(createEmployeeDto, createdById, userRole);
  }

  // ==========================================
  // FIND ALL PEGAWAI (Public + Search + Pagination)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data pegawai (Public + Pagination + Search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Cari berdasarkan nama, nip, posisi, atau divisi' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? +page : 1;
    const limitNumber = limit ? +limit : 10;
    
    return this.employeeService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // FIND ONE PEGAWAI (Public)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail pegawai berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Pegawai (UUID)' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  // ==========================================
  // UPDATE DATA PEGAWAI
  // ==========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data pegawai (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Pegawai (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updateEmployeeDto: UpdateEmployeeDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.employeeService.update(id, updateEmployeeDto, userRole);
  }

  // ==========================================
  // DELETE DATA PEGAWAI
  // ==========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data pegawai (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Pegawai (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    return this.employeeService.remove(id, userRole);
  }
}