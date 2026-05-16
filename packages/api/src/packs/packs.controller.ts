import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PacksService } from './packs.service.js';

@ApiTags('packs')
@Controller('api/v1/packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  @Get()
  async findAll() {
    const data = await this.packsService.listPacks();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.packsService.getPack(id);
    return { success: true, data };
  }
}
