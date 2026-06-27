import { Module } from '@nestjs/common';
import { ExtracurricularService } from './extracurricular.service';
import { ExtracurricularController } from './extracurricular.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [ExtracurricularController],
  providers: [ExtracurricularService, PrismaService],
})
export class ExtracurricularModule {}
