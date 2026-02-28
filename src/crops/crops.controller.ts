import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller handling crop-related routing.
 */
@ApiTags('Crops')
@Controller('crops')
export class CropsController {
    /**
     * Initializes the CropsController.
     * @param cropsService - Injected CropsService.
     */
    constructor(private readonly cropsService: CropsService) { }

    /**
     * Records a new crop planting.
     * @param createCropDto - Payload of crop to plant.
     * @returns The created crop data.
     */
    @Post()
    @ApiOperation({ summary: 'Record a new crop planting' })
    @ApiResponse({ status: 201, description: 'The crop has been successfully recorded.' })
    create(@Body() createCropDto: CreateCropDto) {
        return this.cropsService.create(createCropDto);
    }

    /**
     * Retrieves all stored crops.
     * @returns List of crops.
     */
    @Get()
    @ApiOperation({ summary: 'Get all crops' })
    findAll() {
        return this.cropsService.findAll();
    }

    /**
     * Retrieves a single crop by ID.
     * @param id - ID of the crop.
     * @returns The requested crop.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a crop by ID' })
    @ApiResponse({ status: 200, description: 'Return crop details including variety and associated field.' })
    @ApiResponse({ status: 404, description: 'Crop not found.' })
    findOne(@Param('id') id: string) {
        return this.cropsService.findOne(id);
    }

    /**
     * Updates details for an existing crop.
     * @param id - ID of the crop.
     * @param updateCropDto - Changes to apply.
     * @returns The updated crop details.
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update crop details' })
    update(@Param('id') id: string, @Body() updateCropDto: UpdateCropDto) {
        return this.cropsService.update(id, updateCropDto);
    }

    /**
     * Removes a crop entirely.
     * @param id - ID of the crop to delete.
     * @returns Deletion outcome.
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a crop record' })
    remove(@Param('id') id: string) {
        return this.cropsService.remove(id);
    }
}
