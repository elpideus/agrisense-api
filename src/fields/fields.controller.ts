import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller handling field-related routing.
 */
@ApiTags('Fields')
@Controller('fields')
export class FieldsController {
    /**
     * Instantiates the FieldsController.
     * @param fieldsService - Injected FieldsService instance.
     */
    constructor(private readonly fieldsService: FieldsService) { }

    /**
     * Creates a new agricultural field.
     * @param createFieldDto - Field creation payload.
     * @returns The created field.
     */
    @Post()
    @ApiOperation({ summary: 'Create a new field with GPS coordinates' })
    @ApiResponse({ status: 201, description: 'The field has been successfully created.' })
    create(@Body() createFieldDto: CreateFieldDto) {
        return this.fieldsService.create(createFieldDto);
    }

    /**
     * Retrieves all agricultural fields.
     * @returns An array of fields.
     */
    @Get()
    @ApiOperation({ summary: 'Get all fields' })
    findAll() {
        return this.fieldsService.findAll();
    }

    /**
     * Retrieves a single field by ID.
     * @param id - The ID of the field to retrieve.
     * @returns The field record.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a field by ID' })
    @ApiResponse({ status: 200, description: 'Return the field details.' })
    @ApiResponse({ status: 404, description: 'Field not found.' })
    findOne(@Param('id') id: string) {
        return this.fieldsService.findOne(id);
    }

    /**
     * Updates a specific field by ID.
     * @param id - The ID of the field.
     * @param updateFieldDto - The new field data.
     * @returns The updated field record.
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a field' })
    update(@Param('id') id: string, @Body() updateFieldDto: UpdateFieldDto) {
        return this.fieldsService.update(id, updateFieldDto);
    }

    /**
     * Deletes a field by ID.
     * @param id - The ID of the field.
     * @returns Confirmation of deletion.
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a field' })
    remove(@Param('id') id: string) {
        return this.fieldsService.remove(id);
    }
}

