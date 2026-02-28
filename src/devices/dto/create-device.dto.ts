import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType, UpdateInterval } from '@prisma/client';

/**
 * Data transfer object for creating a physical device record.
 */
export class CreateDeviceDto {
    @ApiProperty({ example: 'AA:BB:CC:DD:EE:FF', description: 'MAC Address of the device (17 chars)' })
    @IsString()
    @Length(17, 17)
    mac: string;

    @ApiProperty({ example: 'Sensor Node A', description: 'Friendly name of the device' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: DeviceType, example: 'SLAVE', description: 'Device role (MASTER or SLAVE)' })
    @IsEnum(DeviceType)
    device_type: DeviceType;

    @ApiPropertyOptional({ enum: UpdateInterval, example: 'NORMAL', description: 'Polling frequency' })
    @IsEnum(UpdateInterval)
    @IsOptional()
    update_interval?: UpdateInterval;

    @ApiPropertyOptional({ example: false, description: 'Has the device been sold to a user?' })
    @IsBoolean()
    @IsOptional()
    is_sold?: boolean;

    @ApiProperty({ example: 'uuid-string', description: 'User ID owner' })
    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @ApiPropertyOptional({ example: 'uuid-string', description: 'Assigned field ID' })
    @IsUUID()
    @IsOptional()
    field_id?: string;

    @ApiPropertyOptional({ example: 'AA:BB:CC:DD:EE:00', description: 'Master MAC address if SLAVE' })
    @IsString()
    @Length(17, 17)
    @IsOptional()
    master_mac?: string;
}
