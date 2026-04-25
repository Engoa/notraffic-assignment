import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { delay } from '../../../common/utils/delay';
import { CreatePolygonDto, UpdatePolygonDto } from './dto/save-polygon.dto';
import { PolygonRecord } from './polygon.types';

const roundCoordinate = (value: number): number => Number(value.toFixed(1));
const STORAGE_PATH = 'data/polygons.json';
const ACTION_DELAY_MS = 5000;

@Injectable()
export class PolygonsService implements OnModuleInit {
  private async ensureStorageFile(): Promise<void> {
    await fs.mkdir(dirname(STORAGE_PATH), { recursive: true });

    try {
      await fs.access(STORAGE_PATH);
    } catch {
      await fs.writeFile(STORAGE_PATH, '[]\n', 'utf8');
    }
  }

  async onModuleInit(): Promise<void> {
    await this.ensureStorageFile();
  }

  async findAll(): Promise<PolygonRecord[]> {
    await delay(ACTION_DELAY_MS);
    return this.readPolygons();
  }

  async create(payload: CreatePolygonDto): Promise<PolygonRecord> {
    await delay(ACTION_DELAY_MS);

    const polygons = await this.readPolygons();

    const nextId =
      polygons.reduce((maxId, polygon) => Math.max(maxId, polygon.id), 0) + 1;

    const polygon: PolygonRecord = {
      id: nextId,
      name: payload.name,
      color: payload.color,
      points: payload.points.map(([x, y]) => [
        roundCoordinate(x),
        roundCoordinate(y),
      ]),
    };

    polygons.push(polygon);
    await this.writePolygons(polygons);

    return polygon;
  }

  async update(id: number, payload: UpdatePolygonDto): Promise<PolygonRecord> {
    await delay(ACTION_DELAY_MS);

    const polygons = await this.readPolygons();
    const polygon = polygons.find((item) => item.id === id);

    if (!polygon) {
      throw new NotFoundException({
        code: 'POLYGON_NOT_FOUND',
        message: `Polygon ${id} was not found`,
      });
    }

    polygon.name = payload.name;
    polygon.color = payload.color;
    await this.writePolygons(polygons);

    return polygon;
  }

  async remove(id: number): Promise<{ id: number }> {
    await delay(ACTION_DELAY_MS);

    const polygons = await this.readPolygons();
    const polygonExists = polygons.some((polygon) => polygon.id === id);

    if (!polygonExists) {
      throw new NotFoundException({
        code: 'POLYGON_NOT_FOUND',
        message: `Polygon ${id} was not found`,
      });
    }

    await this.writePolygons(polygons.filter((polygon) => polygon.id !== id));

    return { id };
  }

  private async readPolygons(): Promise<PolygonRecord[]> {
    try {
      const fileContents = await fs.readFile(STORAGE_PATH, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      throw new InternalServerErrorException({
        code: 'POLYGON_STORAGE_ERROR',
        message: 'Polygon storage is unavailable or malformed',
      });
    }
  }

  private async writePolygons(polygons: PolygonRecord[]): Promise<void> {
    const temporaryPath = `${STORAGE_PATH}.tmp`;

    await fs.writeFile(
      temporaryPath,
      `${JSON.stringify(polygons, null, 2)}\n`,
      'utf8',
    );
    await fs.rename(temporaryPath, STORAGE_PATH);
  }
}
