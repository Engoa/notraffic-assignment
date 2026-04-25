import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PolygonsController } from './polygons.controller';
import { PolygonsService } from './polygons.service';

describe('PolygonsController', () => {
  let controller: PolygonsController;
  let service: jest.Mocked<PolygonsService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      onModuleInit: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<PolygonsService>;

    controller = new PolygonsController(service);
  });

  it('returns all polygons from the service', async () => {
    const polygons = [
      {
        id: 1,
        name: 'Test',
        color: '#AABBCC',
        points: [
          [0, 0],
          [100, 0],
          [50, 50],
        ] as [number, number][],
      },
    ];

    service.findAll.mockResolvedValue(polygons);

    await expect(controller.findAll()).resolves.toEqual(polygons);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('creates a polygon through the service', async () => {
    const payload = {
      name: 'Test',
      color: '#22AA66',
      points: [
        [10, 10],
        [20, 20],
        [30, 30],
      ] as [number, number][],
    };
    const createdPolygon = {
      id: 7,
      ...payload,
    };

    service.create.mockResolvedValue(createdPolygon);

    await expect(controller.create(payload)).resolves.toEqual(createdPolygon);
    expect(service.create).toHaveBeenCalledWith(payload);
  });

  it('updates and removes polygons by id through the service', async () => {
    const updatePayload = {
      name: 'Test',
      color: '#123456',
    };

    service.update.mockResolvedValue({
      id: 9,
      ...updatePayload,
      points: [
        [0, 0],
        [50, 0],
        [25, 25],
      ],
    });
    service.remove.mockResolvedValue({ id: 9 });

    await expect(controller.update(9, updatePayload)).resolves.toMatchObject({
      id: 9,
      ...updatePayload,
    });
    await expect(controller.remove(9)).resolves.toEqual({ id: 9 });

    expect(service.update).toHaveBeenCalledWith(9, updatePayload);
    expect(service.remove).toHaveBeenCalledWith(9);
  });
});
