import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * The root application controller.
 * Handles the base routes for the Agrisense API.
 */
@Controller()
export class AppController {
  /**
   * Initializes the AppController.
   * @param appService - Injected AppService instance.
   */
  constructor(private readonly appService: AppService) { }

  /**
   * Handles GET requests to the root endpoint.
   * @returns A welcome message.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
