-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('1', '2', '3', '4', '5');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nominee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "positionId" INTEGER NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "evidence" TEXT,

    CONSTRAINT "Nominee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NomineeRating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nomineeId" INTEGER NOT NULL,
    "ratingCategoryId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "evidence" TEXT NOT NULL,
    "ratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NomineeRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionRating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "ratingCategoryId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "evidence" TEXT NOT NULL,
    "ratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ImpactArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingCategory" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "examples" TEXT[],

    CONSTRAINT "RatingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionRatingCategory" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "examples" TEXT[],

    CONSTRAINT "InstitutionRatingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepartmentToRatingCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DepartmentToInstitutionRatingCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ImpactAreaToRatingCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ImpactAreaToInstitutionRatingCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RatingCategory_keyword_key" ON "RatingCategory"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionRatingCategory_keyword_key" ON "InstitutionRatingCategory"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentToRatingCategory_AB_unique" ON "_DepartmentToRatingCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentToRatingCategory_B_index" ON "_DepartmentToRatingCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentToInstitutionRatingCategory_AB_unique" ON "_DepartmentToInstitutionRatingCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentToInstitutionRatingCategory_B_index" ON "_DepartmentToInstitutionRatingCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImpactAreaToRatingCategory_AB_unique" ON "_ImpactAreaToRatingCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ImpactAreaToRatingCategory_B_index" ON "_ImpactAreaToRatingCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImpactAreaToInstitutionRatingCategory_AB_unique" ON "_ImpactAreaToInstitutionRatingCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ImpactAreaToInstitutionRatingCategory_B_index" ON "_ImpactAreaToInstitutionRatingCategory"("B");

-- AddForeignKey
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomineeRating" ADD CONSTRAINT "NomineeRating_nomineeId_fkey" FOREIGN KEY ("nomineeId") REFERENCES "Nominee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomineeRating" ADD CONSTRAINT "NomineeRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NomineeRating" ADD CONSTRAINT "NomineeRating_ratingCategoryId_fkey" FOREIGN KEY ("ratingCategoryId") REFERENCES "RatingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionRating" ADD CONSTRAINT "InstitutionRating_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionRating" ADD CONSTRAINT "InstitutionRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionRating" ADD CONSTRAINT "InstitutionRating_ratingCategoryId_fkey" FOREIGN KEY ("ratingCategoryId") REFERENCES "RatingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToRatingCategory" ADD CONSTRAINT "_DepartmentToRatingCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToRatingCategory" ADD CONSTRAINT "_DepartmentToRatingCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "RatingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToInstitutionRatingCategory" ADD CONSTRAINT "_DepartmentToInstitutionRatingCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentToInstitutionRatingCategory" ADD CONSTRAINT "_DepartmentToInstitutionRatingCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "InstitutionRatingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImpactAreaToRatingCategory" ADD CONSTRAINT "_ImpactAreaToRatingCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "ImpactArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImpactAreaToRatingCategory" ADD CONSTRAINT "_ImpactAreaToRatingCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "RatingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImpactAreaToInstitutionRatingCategory" ADD CONSTRAINT "_ImpactAreaToInstitutionRatingCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "ImpactArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImpactAreaToInstitutionRatingCategory" ADD CONSTRAINT "_ImpactAreaToInstitutionRatingCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "InstitutionRatingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
