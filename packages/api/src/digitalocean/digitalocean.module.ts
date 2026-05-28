import { Module } from '@nestjs/common';
import { DigitalOceanController } from './digitalocean.controller.js';
import { DigitalOceanService } from './digitalocean.service.js';

@Module({
  controllers: [DigitalOceanController],
  providers: [DigitalOceanService],
  exports: [DigitalOceanService],
})
export class DigitalOceanModule {}
