import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller handling hardware device routing.
 */
@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
    /**
     * Initializes the DevicesController.
     * @param devicesService - Injected DevicesService.
     */
    constructor(private readonly devicesService: DevicesService) { }

    /**
     * Registers a new device.
     * @param createDeviceDto - Payload for device creation.
     * @returns The registered device details.
     */
    @Post()
    @ApiOperation({ summary: 'Register a new hardware device' })
    @ApiResponse({ status: 201, description: 'The device has been successfully registered.' })
    create(@Body() createDeviceDto: CreateDeviceDto) {
        return this.devicesService.create(createDeviceDto);
    }

    /**
     * Retrieves all devices.
     * @returns Array of devices.
     */
    @Get()
    @ApiOperation({ summary: 'Get all devices' })
    findAll() {
        return this.devicesService.findAll();
    }

    /**
     * Retrieves a single device by its MAC address.
     * @param mac - MAC address of the device.
     * @returns The device details.
     */
    @Get(':mac')
    @ApiOperation({ summary: 'Get a device by MAC address' })
    @ApiResponse({ status: 200, description: 'Return device details including slaves and recent readings.' })
    @ApiResponse({ status: 404, description: 'Device not found.' })
    findOne(@Param('mac') mac: string) {
        return this.devicesService.findOne(mac);
    }

    /**
     * Updates an existing device's settings.
     * @param mac - MAC address of the device.
     * @param updateDeviceDto - The updated data.
     * @returns The updated device.
     */
    @Patch(':mac')
    @ApiOperation({ summary: 'Update device settings' })
    update(@Param('mac') mac: string, @Body() updateDeviceDto: UpdateDeviceDto) {
        return this.devicesService.update(mac, updateDeviceDto);
    }

    /**
     * Deletes a record of a device.
     * @param mac - MAC address of the device.
     * @returns Deletion confirmation.
     */
    @Delete(':mac')
    @ApiOperation({ summary: 'Delete a device record' })
    remove(@Param('mac') mac: string) {
        return this.devicesService.remove(mac);
    }
}
