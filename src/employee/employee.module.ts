import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [ MinioModule ],
  controllers: [ EmployeeController ],
  providers: [ EmployeeService, PrismaService ],
})
export class EmployeeModule {}
