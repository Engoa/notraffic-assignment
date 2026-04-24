import { registerDecorator, ValidationOptions } from 'class-validator';

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;
const MIN_POINTS = 3;

function isPolygonPoint(point: unknown): point is [number, number] {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    typeof point[0] === 'number' &&
    Number.isFinite(point[0]) &&
    point[0] >= 0 &&
    point[0] <= IMAGE_WIDTH &&
    typeof point[1] === 'number' &&
    Number.isFinite(point[1]) &&
    point[1] >= 0 &&
    point[1] <= IMAGE_HEIGHT
  );
}

function isPolygonPoints(value: unknown): value is [number, number][] {
  return (
    Array.isArray(value) &&
    value.length >= MIN_POINTS &&
    value.every((point) => isPolygonPoint(point))
  );
}

export function IsPolygonPoints(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string): void => {
    registerDecorator({
      name: 'isPolygonPoints',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isPolygonPoints(value);
        },
        defaultMessage(): string {
          return `points must contain at least ${MIN_POINTS} [x, y] coordinates within the ${IMAGE_WIDTH}x${IMAGE_HEIGHT} image bounds`;
        },
      },
    });
  };
}
