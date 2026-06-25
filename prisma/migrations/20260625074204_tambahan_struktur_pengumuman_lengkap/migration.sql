/*
  Warnings:

  - Added the required column `created_by_id` to the `pengumuman` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PengumumanType" AS ENUM ('teks', 'link', 'file');

-- CreateEnum
CREATE TYPE "PengumumanTarget" AS ENUM ('semua', 'siswa', 'orangtua', 'guru', 'pegawai', 'siswa_tertentu');

-- AlterTable
ALTER TABLE "pengumuman" ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "end_date" TIMESTAMPTZ,
ADD COLUMN     "files" JSONB DEFAULT '[]',
ADD COLUMN     "link_url" TEXT,
ADD COLUMN     "start_date" TIMESTAMPTZ,
ADD COLUMN     "target" "PengumumanTarget" NOT NULL DEFAULT 'semua',
ADD COLUMN     "target_details" TEXT[],
ADD COLUMN     "type" "PengumumanType" NOT NULL DEFAULT 'teks';

-- AddForeignKey
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
