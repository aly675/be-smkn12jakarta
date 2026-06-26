import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, PrismaService],
})
export class AnnouncementModule {}
