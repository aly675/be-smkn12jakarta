/*
  Warnings:

  - You are about to drop the column `author` on the `berita` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `berita` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'Osis';

-- AlterTable
ALTER TABLE "berita" DROP COLUMN "author",
ADD COLUMN     "author_id" UUID NOT NULL,
ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "tags" TEXT[];

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
