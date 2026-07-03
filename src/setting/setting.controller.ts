import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Site Settings')
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua data pengaturan website (Public)' })
  findAll() {
    return this.settingService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update atau Buat Pengaturan Website (Upsert - Khusus Admin)' })
  upsert(@Body() createSettingDto: CreateSettingDto, @Req() req: any) {
    const createdById = req.user.id;
    const userRole = req.user.role; 
    
    return this.settingService.upsert(createSettingDto, createdById, userRole);
  }
}