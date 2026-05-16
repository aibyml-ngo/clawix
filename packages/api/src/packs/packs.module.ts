import * as path from 'path';
import { Module } from '@nestjs/common';
import { PacksController } from './packs.controller.js';
import { PacksService } from './packs.service.js';

@Module({
  controllers: [PacksController],
  providers: [
    {
      provide: PacksService,
      useFactory: () => {
        const packsDir =
          process.env['SKILLS_PACKS_DIR'] ??
          path.resolve(process.cwd(), '../../skills/packs');
        return new PacksService(packsDir);
      },
    },
  ],
  exports: [PacksService],
})
export class PacksModule {}
