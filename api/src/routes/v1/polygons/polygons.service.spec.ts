import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PolygonsService } from './polygons.service';

describe('PolygonsService', () => {
  const originalCwd = process.cwd();
  let tempDir: string;
  let service: PolygonsService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'polygons-service-'));
    process.chdir(tempDir);
    service = new PolygonsService();
    await service.onModuleInit();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('creates polygons with rounded points and incremental ids', async () => {
    await expect(
      service.create({
        name: 'Lobby',
        color: '#22aa66',
        points: [
          [10.04, 20.05],
          [30.16, 40.27],
          [50.38, 60.49],
        ],
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Lobby',
      color: '#22aa66',
      points: [
        [10, 20.1],
        [30.2, 40.3],
        [50.4, 60.5],
      ],
    });

    await expect(
      service.create({
        name: 'Parking',
        color: '#445566',
        points: [
          [0, 0],
          [25, 10],
          [10, 25],
        ],
      }),
    ).resolves.toMatchObject({ id: 2 });

    await expect(service.findAll()).resolves.toHaveLength(2);
  });

  it('updates only editable polygon fields', async () => {
    const polygon = await service.create({
      name: 'Triangle',
      color: '#111111',
      points: [
        [0, 0],
        [100, 0],
        [50, 50],
      ],
    });

    await expect(
      service.update(polygon.id, {
        name: 'Updated triangle',
        color: '#ABCDEF',
      }),
    ).resolves.toEqual({
      ...polygon,
      name: 'Updated triangle',
      color: '#ABCDEF',
    });
  });

  it('throws a not found error when deleting a missing polygon', async () => {
    await expect(service.remove(42)).rejects.toEqual(
      new NotFoundException({
        code: 'POLYGON_NOT_FOUND',
        message: 'Polygon 42 was not found',
      }),
    );
  });

  it('surfaces malformed storage as an internal server error', async () => {
    await fs.writeFile(
      path.join(tempDir, 'data/polygons.json'),
      '{oops',
      'utf8',
    );

    await expect(service.findAll()).rejects.toEqual(
      new InternalServerErrorException({
        code: 'POLYGON_STORAGE_ERROR',
        message: 'Polygon storage is unavailable or malformed',
      }),
    );
  });
});
