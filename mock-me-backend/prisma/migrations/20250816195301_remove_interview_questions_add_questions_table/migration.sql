/*
  Warnings:

  - You are about to drop the column `interview_questions` on the `interviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."interviews" DROP COLUMN "interview_questions";

-- CreateTable
CREATE TABLE "public"."interview_questions" (
    "id" SERIAL NOT NULL,
    "interview_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "question_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."interview_questions" ADD CONSTRAINT "interview_questions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
