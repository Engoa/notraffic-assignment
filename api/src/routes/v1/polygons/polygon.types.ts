export type PolygonPoint = [number, number];

export interface PolygonRecord {
  id: number;
  name: string;
  color: string;
  points: PolygonPoint[];
}
