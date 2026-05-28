import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createDropletSchema, type CreateDropletInput } from '@clawix/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import type { JwtPayload } from '../auth/auth.types.js';
import { DigitalOceanService } from './digitalocean.service.js';

@ApiTags('droplets')
@Controller('droplets')
export class DigitalOceanController {
  constructor(private readonly do_: DigitalOceanService) {}

  /** Available DO sizes (filtered to what your account supports). */
  @Get('sizes')
  listSizes() {
    return this.do_.listSizes();
  }

  /** All droplets owned by the authenticated user. */
  @Get()
  listDroplets(@Req() req: { user: JwtPayload }) {
    return this.do_.listDroplets(req.user.sub);
  }

  /** Provision a new droplet for the authenticated user. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDroplet(
    @Req() req: { user: JwtPayload },
    @Body(new ZodValidationPipe(createDropletSchema)) body: CreateDropletInput,
  ) {
    return this.do_.createDroplet(req.user.sub, body);
  }

  /** Pull latest status + IP from DO and update the DB record. */
  @Get(':id/status')
  syncStatus(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.do_.syncDroplet(req.user.sub, id);
  }

  /** Delete a droplet on DO and mark it deleting in the DB. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDroplet(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.do_.deleteDroplet(req.user.sub, id);
  }
}
