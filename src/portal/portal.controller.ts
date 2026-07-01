import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, Query 
} from '@nestjs/common';
import { PortalService } from './portal.service';
import { CreatePortalDto } from './dto/create-portal.dto';
import { UpdatePortalDto } from './dto/update-portal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Portal (Layanan)')
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // ==========================================
  // TAMBAH DATA LAYANAN BARU (Khusus Admin)
  // ========================================== 
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data layanan baru (Khusus Admin)' })
  create(@Body() createPortalDto: CreatePortalDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    
    return this.portalService.create(createPortalDto, createdById, userRole);
  }

  // ==========================================
  // Ambil semua data layanan (Public + Pagination + Search)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Ambil semua data layanan (Public + Pagination + Search)' })
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
    
    return this.portalService.findAll(pageNumber, limitNumber, search);
  }

  // ==========================================
  // Ambil detail layanan berdasarkan ID (Public)
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail layanan berdasarkan ID (Public)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Layanan (UUID)' })
  findOne(@Param('id') id: string) {
    return this.portalService.findOne(id);
  }

  // ==========================================
  // Update data layanan berdasarkan ID (Khusus Admin)
  // ==========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data layanan (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Layanan (UUID)' })
  update(
    @Param('id') id: string, 
    @Body() updatePortalDto: UpdatePortalDto, 
    @Req() req: any
  ) {
    const userRole = req.user.role; 
    return this.portalService.update(id, updatePortalDto, userRole);
  }

  // ==========================================
  // Hapus data layanan berdasarkan ID (Khusus Admin)
  // ==========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus data layanan (Khusus Admin)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID Layanan (UUID)' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userRole = req.user.role; 
    return this.portalService.remove(id, userRole);
  }
}