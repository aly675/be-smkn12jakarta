import { Module } from '@nestjs/common';
import { MajorService } from './major.service';
import { MajorController } from './major.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [MajorController],
  providers: [MajorService, PrismaService],
})
export class MajorModule {}
