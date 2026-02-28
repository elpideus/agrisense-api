import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Service handling user-related business logic.
 */
@Injectable()
export class UsersService {
    /**
     * Instantiates the UsersService.
     * @param prisma - PrismaService for database operations.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Creates a new user in the database.
     * @param createUserDto - Data for creating the user.
     * @returns The created user data.
     */
    async create(createUserDto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = `hashed_${createUserDto.password}`;

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            select: this.userSelectData(),
        });
    }

    /**
     * Retrieves all users.
     * @returns Array of user records.
     */
    async findAll() {
        return this.prisma.user.findMany({ select: this.userSelectData() });
    }

    /**
     * Retrieves a single user by ID.
     * @param id - The ID of the user.
     * @returns The user record.
     */
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.userSelectData(),
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    /**
     * Updates an existing user.
     * @param id - The ID of the user to update.
     * @param updateUserDto - The data to update.
     * @returns The updated user record.
     */
    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id);

        if (updateUserDto.password) {
            updateUserDto.password = `hashed_${updateUserDto.password}`;
        }

        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: this.userSelectData(),
        });
    }

    /**
     * Removes a user from the database.
     * @param id - The ID of the user to remove.
     * @returns The removed user record.
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.user.delete({
            where: { id },
            select: this.userSelectData(),
        });
    }

    /**
     * Returns standard select fields for user queries.
     * @returns Object defining fields to select.
     */
    private userSelectData() {
        return {
            id: true,
            name: true,
            email: true,
            phone: true,
            created_at: true,
        };
    }
}

