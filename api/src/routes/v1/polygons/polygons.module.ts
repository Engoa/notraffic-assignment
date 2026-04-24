import { Module } from '@nestjs/common';

import { PolygonsController } from './polygons.controller';
import { PolygonsService } from './polygons.service';

@Module({
  controllers: [PolygonsController],
  providers: [PolygonsService],
})
export class PolygonsModule {}
