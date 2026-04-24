import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreatePolygonDto, UpdatePolygonDto } from './dto/save-polygon.dto';
import { PolygonsService } from './polygons.service';

@Controller('v1/polygons')
export class PolygonsController {
  constructor(private readonly polygonsService: PolygonsService) {}

  @Get()
  findAll() {
    return this.polygonsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() payload: CreatePolygonDto) {
    return this.polygonsService.create(payload);
  }

  @Patch(':polygonId')
  update(
    @Param('polygonId', ParseIntPipe) polygonId: number,
    @Body() payload: UpdatePolygonDto,
  ) {
    return this.polygonsService.update(polygonId, payload);
  }

  @Delete(':polygonId')
  remove(@Param('polygonId', ParseIntPipe) polygonId: number) {
    return this.polygonsService.remove(polygonId);
  }
}
