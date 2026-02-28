import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller handling harvest-related routes.
 */
@ApiTags('Harvests')
@Controller('harvests')
export class HarvestsController {
    /**
     * Initializes the HarvestsController.
     * @param harvestsService - Injected HarvestsService.
     */
    constructor(private readonly harvestsService: HarvestsService) { }

    /**
     * Logs a new crop harvest.
     * @param createHarvestDto - Payload detailing the harvest.
     * @returns The recorded harvest.
     */
    @Post()
    @ApiOperation({ summary: 'Log a new crop harvest' })
    @ApiResponse({ status: 201, description: 'Harvest record created.' })
    create(@Body() createHarvestDto: CreateHarvestDto) {
        return this.harvestsService.create(createHarvestDto);
    }

    /**
     * Retrieves all harvest records.
     * @returns An array of harvests.
     */
    @Get()
    @ApiOperation({ summary: 'Get all harvest records' })
    findAll() {
        return this.harvestsService.findAll();
    }

    /**
     * Retrieves a single harvest record by ID.
     * @param id - The ID of the harvest.
     * @returns Formatted details of the harvest.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a specific harvest record' })
    @ApiResponse({ status: 200, description: 'Return harvest record.' })
    @ApiResponse({ status: 404, description: 'Record not found.' })
    findOne(@Param('id') id: string) {
        return this.harvestsService.findOne(id);
    }

    /**
     * Updates a harvest record.
     * @param id - ID of the harvest to update.
     * @param updateHarvestDto - Updated payload data.
     * @returns The updated harvest.
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a harvest' })
    update(@Param('id') id: string, @Body() updateHarvestDto: UpdateHarvestDto) {
        return this.harvestsService.update(id, updateHarvestDto);
    }

    /**
     * Completely deletes a harvest record.
     * @param id - ID of the harvest to remove.
     * @returns Deletion status.
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a harvest record' })
    remove(@Param('id') id: string) {
        return this.harvestsService.remove(id);
    }
}
