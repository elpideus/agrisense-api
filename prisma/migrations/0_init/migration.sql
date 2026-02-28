-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- CreateExtension
-- CREATE EXTENSION IF NOT EXISTS "uuid_ossp";

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MASTER', 'SLAVE');

-- CreateEnum
CREATE TYPE "UpdateInterval" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProblemCategory" AS ENUM ('DISEASE', 'PEST', 'ABIOTIC', 'OTHER');

-- CreateEnum
CREATE TYPE "Progression" AS ENUM ('IMPROVING', 'STABLE', 'WORSENING');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "report_id" UUID,
    "note_id" UUID,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "gps_coords" geography(Point, 4326) NOT NULL,
    "is_bio" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variety" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "species_id" UUID NOT NULL,

    CONSTRAINT "Variety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloomStage" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "crit_temp_10" DOUBLE PRECISION NOT NULL,
    "crit_temp_90" DOUBLE PRECISION NOT NULL,
    "variety_id" UUID NOT NULL,

    CONSTRAINT "BloomStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planted_at" TIMESTAMP(3),
    "field_id" UUID NOT NULL,
    "variety_id" UUID NOT NULL,
    "current_bloom_stage_id" UUID,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "category" "ProblemCategory" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "mac" CHAR(17) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "update_interval" "UpdateInterval" NOT NULL DEFAULT 'NORMAL',
    "is_sold" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,
    "field_id" UUID,
    "master_mac" CHAR(17),

    CONSTRAINT "Device_pkey" PRIMARY KEY ("mac")
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_mac" CHAR(17) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "battery_value" INTEGER NOT NULL,
    "tbu" DOUBLE PRECISION NOT NULL,
    "state" "UpdateInterval" NOT NULL,
    "error_code" INTEGER NOT NULL DEFAULT 0,
    "rssi" INTEGER NOT NULL,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "problem_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportNote" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "progression" "Progression",
    "product_applied" TEXT,
    "dosage" TEXT,
    "report_id" UUID NOT NULL,

    CONSTRAINT "ReportNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvested_at" TIMESTAMP(3) NOT NULL,
    "crop_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "total" INTEGER NOT NULL,
    "first_quality" INTEGER NOT NULL DEFAULT 0,
    "second_quality" INTEGER NOT NULL DEFAULT 0,
    "garbage" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCrop" (
    "report_id" UUID NOT NULL,
    "crop_id" UUID NOT NULL,

    CONSTRAINT "ReportCrop_pkey" PRIMARY KEY ("report_id","crop_id")
);

-- CreateTable
CREATE TABLE "ProblemSpecies" (
    "problem_id" UUID NOT NULL,
    "species_id" UUID NOT NULL,

    CONSTRAINT "ProblemSpecies_pkey" PRIMARY KEY ("problem_id","species_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Image_storage_key_key" ON "Image"("storage_key");

-- CreateIndex
CREATE INDEX "Image_user_id_idx" ON "Image"("user_id");

-- CreateIndex
CREATE INDEX "Field_user_id_idx" ON "Field"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Species_scientific_name_key" ON "Species"("scientific_name");

-- CreateIndex
CREATE INDEX "Crop_field_id_idx" ON "Crop"("field_id");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_name_key" ON "Problem"("name");

-- CreateIndex
CREATE INDEX "Device_field_id_idx" ON "Device"("field_id");

-- CreateIndex
CREATE INDEX "Reading_device_mac_idx" ON "Reading"("device_mac");

-- CreateIndex
CREATE INDEX "Reading_created_at_idx" ON "Reading"("created_at");

-- CreateIndex
CREATE INDEX "Report_field_id_idx" ON "Report"("field_id");

-- CreateIndex
CREATE INDEX "Report_created_at_idx" ON "Report"("created_at");

-- CreateIndex
CREATE INDEX "Report_field_id_created_at_idx" ON "Report"("field_id", "created_at");

-- CreateIndex
CREATE INDEX "ReportNote_report_id_idx" ON "ReportNote"("report_id");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "ReportNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variety" ADD CONSTRAINT "Variety_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloomStage" ADD CONSTRAINT "BloomStage_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "Variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "Variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_current_bloom_stage_id_fkey" FOREIGN KEY ("current_bloom_stage_id") REFERENCES "BloomStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_master_mac_fkey" FOREIGN KEY ("master_mac") REFERENCES "Device"("mac") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_device_mac_fkey" FOREIGN KEY ("device_mac") REFERENCES "Device"("mac") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportNote" ADD CONSTRAINT "ReportNote_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCrop" ADD CONSTRAINT "ReportCrop_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCrop" ADD CONSTRAINT "ReportCrop_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemSpecies" ADD CONSTRAINT "ProblemSpecies_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemSpecies" ADD CONSTRAINT "ProblemSpecies_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

