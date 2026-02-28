import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller handling user-related routing.
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
    /**
     * Instantiates the UsersController.
     * @param usersService - Injected UsersService instance.
     */
    constructor(private readonly usersService: UsersService) { }

    /**
     * Creates a new user.
     * @param createUserDto - Payload containing user details.
     * @returns The created user.
     */
    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
    @ApiResponse({ status: 409, description: 'Email already exists.' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * Retrieves all users.
     * @returns An array of users.
     */
    @Get()
    @ApiOperation({ summary: 'Get all users' })
    findAll() {
        return this.usersService.findAll();
    }

    /**
     * Retrieves a single user by their ID.
     * @param id - The ID of the user.
     * @returns The user record.
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'Return the user profile.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    /**
     * Updates an existing user by their ID.
     * @param id - The ID of the user.
     * @param updateUserDto - Payload containing updated information.
     * @returns The updated user record.
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * Deletes a user by their ID.
     * @param id - The ID of the user to delete.
     * @returns The removed user data.
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}

