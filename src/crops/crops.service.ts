import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';

/**
 * Service to manage agricultural crops.
 */
@Injectable()
export class CropsService {
    /**
     * Initializes the CropsService.
     * @param prisma - The PrismaService for database operations.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Records a newly planted crop in the database.
     * @param createCropDto - Data representing the newly planted crop.
     * @returns The newly created crop with relationships.
     */
    create(createCropDto: CreateCropDto) {
        return this.prisma.crop.create({
            data: createCropDto,
            include: { variety: { include: { species: true } }, field: true, current_bloom_stage: true }
        });
    }

    /**
     * Retrieves all crops recorded in the system.
     * @returns Array of crops with associated details.
     */
    findAll() {
        return this.prisma.crop.findMany({
            include: { variety: { include: { species: true } }, field: true, current_bloom_stage: true }
        });
    }

    /**
     * Retrieves a single crop by its given ID.
     * @param id - The ID of the crop.
     * @returns Details of the requested crop.
     */
    async findOne(id: string) {
        const crop = await this.prisma.crop.findUnique({
            where: { id },
            include: { variety: { include: { species: true } }, field: true, current_bloom_stage: true }
        });
        if (!crop) throw new NotFoundException('Crop not found');
        return crop;
    }

    /**
     * Updates an existing crop record.
     * @param id - The ID of the crop to update.
     * @param updateCropDto - The payload containing modifiable fields.
     * @returns The updated crop record.
     */
    async update(id: string, updateCropDto: UpdateCropDto) {
        await this.findOne(id);
        return this.prisma.crop.update({
            where: { id },
            data: updateCropDto,
            include: { variety: { include: { species: true } }, field: true, current_bloom_stage: true }
        });
    }

    /**
     * Deletes a crop record permanently.
     * @param id - The ID of the crop to remove.
     * @returns Object representing the deleted crop.
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.crop.delete({ where: { id } });
    }
}

