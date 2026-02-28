import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';

/**
 * Service to manage crop harvests.
 */
@Injectable()
export class HarvestsService {
    /**
     * Initializes the HarvestsService.
     * @param prisma - Database access service.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a new harvest record.
     * @param createHarvestDto - Payload with harvest data.
     * @returns The created harvest.
     */
    create(createHarvestDto: CreateHarvestDto) {
        return this.prisma.harvest.create({
            data: createHarvestDto,
            include: { crop: { include: { variety: true } }, field: true }
        });
    }

    /**
     * Retrieves all recorded harvests.
     * @returns A list of all harvest records ordered by date.
     */
    findAll() {
        return this.prisma.harvest.findMany({
            include: { crop: { include: { variety: true } }, field: true },
            orderBy: { harvested_at: 'desc' }
        });
    }

    /**
     * Retrieves a single harvest by ID.
     * @param id - The harvest recording ID.
     * @returns The detailed harvest record.
     */
    async findOne(id: string) {
        const harvest = await this.prisma.harvest.findUnique({
            where: { id },
            include: { crop: { include: { variety: true } }, field: true }
        });
        if (!harvest) throw new NotFoundException('Harvest not found');
        return harvest;
    }

    /**
     * Updates an existing harvest.
     * @param id - ID of the harvest to update.
     * @param updateHarvestDto - The new harvest data.
     * @returns The updated harvest record.
     */
    async update(id: string, updateHarvestDto: UpdateHarvestDto) {
        await this.findOne(id);
        return this.prisma.harvest.update({
            where: { id },
            data: updateHarvestDto,
            include: { crop: { include: { variety: true } }, field: true }
        });
    }

    /**
     * Removes a harvest from the database.
     * @param id - ID of the harvest to remove.
     * @returns Details of the deleted harvest.
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.harvest.delete({ where: { id } });
    }
}
