import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

/**
 * Service handling operations related to hardware devices.
 */
@Injectable()
export class DevicesService {
    /**
     * Initializes the DevicesService.
     * @param prisma - Prisma database service.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Registers a new device in the system.
     * @param createDeviceDto - Data containing device details.
     * @returns The newly created device.
     */
    create(createDeviceDto: CreateDeviceDto) {
        return this.prisma.device.create({
            data: createDeviceDto,
            include: { user: true, field: true }
        });
    }

    /**
     * Retrieves all registered devices.
     * @returns Array of devices.
     */
    findAll() {
        return this.prisma.device.findMany({
            include: { field: true }
        });
    }

    /**
     * Retrieves a single device by its MAC address.
     * @param mac - The MAC address of the device.
     * @returns The device details, including recent readings.
     */
    async findOne(mac: string) {
        const device = await this.prisma.device.findUnique({
            where: { mac },
            include: { field: true, slaves: true, readings: { take: 10, orderBy: { created_at: 'desc' } } }
        });
        if (!device) throw new NotFoundException('Device not found');
        return device;
    }

    /**
     * Updates an existing device.
     * @param mac - The MAC address of the device.
     * @param updateDeviceDto - The updated configuration data.
     * @returns The updated device.
     */
    async update(mac: string, updateDeviceDto: UpdateDeviceDto) {
        await this.findOne(mac);
        return this.prisma.device.update({
            where: { mac },
            data: updateDeviceDto,
            include: { field: true }
        });
    }

    /**
     * Deletes a device from the database.
     * @param mac - The MAC address of the device to remove.
     * @returns Confirmation of the deletion.
     */
    async remove(mac: string) {
        await this.findOne(mac);
        return this.prisma.device.delete({ where: { mac } });
    }
}
