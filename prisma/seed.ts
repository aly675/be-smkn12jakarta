import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Setup driver adapter PostgreSQL aslinya bro
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prisma v7 WAJIB disuapin adapter ini, udah nggak nerima URL langsung
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('🌱 Mulai proses seeding....');

    // ==========================================
    // 1. SEEDING SITE SETTINGS
    // ==========================================
    const defaultSettings = [
      { key: 'site_name', value: 'SMKN 12 Jakarta' },
      { key: 'site_tagline', value: 'Sekolah Menengah Kejuruan Negeri 12 Jakarta' },
      {
        key: 'visi',
        value:
          'Menjadi sekolah kejuruan unggulan yang menghasilkan lulusan berkompeten, berkarakter, dan berdaya saing global.',
      },
      {
        key: 'misi',
        value:
          'Menyelenggarakan pendidikan berkualitas berbasis teknologi;Mengembangkan kompetensi siswa sesuai kebutuhan industri;Membangun karakter siswa yang berakhlak mulia;Menjalin kerjasama dengan dunia usaha dan industri;Menciptakan lingkungan belajar yang kondusif dan inovatif',
      },
      { key: 'alamat', value: 'Jl. Kebon Bawang XV, Tanjung Priok, Jakarta Utara' },
      { key: 'telepon', value: '(021) 4302938' },
      { key: 'email', value: 'smkn12jkt@jakarta.go.id' },
    ];

    for (const setting of defaultSettings) {
      const result = await prisma.siteSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });
      console.log(`✓ Seeding Pengaturan: ${result.key}`);
    }

    // ==========================================
    // 2. SEEDING SUPER ADMIN
    // ==========================================
    console.log('⏳ Menyiapkan akun Super Admin...');
    
    const hashedPassword = await bcrypt.hash('rahasia123', 10);

    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' }, 
      update: {}, 
      create: {
        name: 'Administrator IT',
        username: 'admin',
        email: 'admin@smkn12jakarta.sch.id', 
        password: hashedPassword,
        role: 'ADMIN', 
      },
    });
    console.log(`✓ Seeding Admin sukses: ${adminUser.username} (Role: ${adminUser.role})`);

    console.log('✅ Seeding selesai semuanya bro!');
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();