/*
  Warnings:

  - Added the required column `created_by_id` to the `guru` table without a default value. This is not possible if the table is not empty.
  - Made the column `nip` on table `guru` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subject` on table `guru` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "guru" ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "email" TEXT,
ALTER COLUMN "nip" SET NOT NULL,
ALTER COLUMN "subject" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
