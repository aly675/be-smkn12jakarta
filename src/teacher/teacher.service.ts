import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from '../common/helper/auth.helper';

@Injectable()
export class TeacherService {
  constructor( private prisma: PrismaService ) {} 

async create(dto: CreateTeacherDto, createdById: string, userRole: string) {
    // VALIDASI MUTLAK: Cuma Admin yang boleh lewat!
    AuthHelper.checkIsAdmin(userRole, 'data guru');

    // Tembak ke database
    const newTeacher = await this.prisma.guru.create({
      data: {
        name: dto.name,
        nip: dto.nip,
        position: dto.position,
        subject: dto.subject,
        education: dto.education,
        email: dto.email,
        photo: dto.photo,
        createdById: createdById,
      },
    });

    return {
      message: 'Mantap bro, data guru berhasil ditambahkan!',
      data: newTeacher,
    };
  }

  findAll() {
    return `This action returns all teacher`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
