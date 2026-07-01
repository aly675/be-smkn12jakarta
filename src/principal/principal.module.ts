import { Module } from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { PrincipalController } from './principal.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [PrincipalController],
  providers: [PrincipalService, PrismaService],
})
export class PrincipalModule {}
