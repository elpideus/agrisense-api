import { Injectable } from '@nestjs/common';

/**
 * The root application service.
 * Provides basic shared functionality.
 */
@Injectable()
export class AppService {
  /**
   * Returns a basic, simple greeting.
   * @returns A string containing the greeting.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
