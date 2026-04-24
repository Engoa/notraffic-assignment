import { IsHexColor, IsString, MaxLength, MinLength } from 'class-validator';
import { IsPolygonPoints } from '../validators/is-polygon-points.validator';

export class CreatePolygonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsHexColor()
  color!: string;

  @IsPolygonPoints()
  points!: [number, number][];
}

export class UpdatePolygonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsHexColor()
  color!: string;
}
