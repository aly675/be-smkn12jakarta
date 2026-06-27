/*
  Warnings:

  - Added the required column `created_by_id` to the `ekskul` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `ekskul` required. This step will fail if there are existing NULL values in that column.
  - Made the column `schedule` on table `ekskul` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coach` on table `ekskul` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ekskul" ADD COLUMN     "created_by_id" UUID NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "schedule" SET NOT NULL,
ALTER COLUMN "coach" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ekskul" ADD CONSTRAINT "ekskul_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
