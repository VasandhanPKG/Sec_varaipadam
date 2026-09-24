export type SpaceType = 'classroom' | 'lab' | 'amenity' | 'lift' | 'stair' | 'core' | 'office';

export interface RoomItem {
  id: string; // e.g. "6853", "1451"
  std?: string; // e.g. "615"
  name: string;
  type: SpaceType;
  floor?: number; // 1..6
  capacity?: number;
  row?: number; // 1..8
  col?: number; // 1..8
  bay?: number; // 1..N
  x: number;
  y: number;
  w: number;
  h: number;
  doorX?: number;
  doorY?: number;
  desc?: string;
}

export interface CoreItem {
  id: string; // e.g. "lift_sw", "lift_se", "lift_mid_w", "lift_mid_e"
  name: string;
  std: string;
  type: 'lift' | 'stair';
  floor?: number;
  row: number;
  col: number;
  x: number;
  y: number;
  w: number;
  h: number;
  doorX: number;
  doorY: number;
  desc?: string;
}

export type EntityItem = RoomItem | CoreItem;

export interface GraphNode {
  x: number;
  y: number;
  label: string;
}

export interface NavigationStep {
  icon: string;
  title: string;
  desc: string;
  floor?: number;
  isFloorChange?: boolean;
}

export interface FloorRouteSegment {
  floor: number;
  pathWaypointKeys: string[];
  routePoints: { x: number; y: number }[];
  steps: NavigationStep[];
}

export interface RouteResult {
  isMultiFloor: boolean;
  startFloor: number;
  targetFloor: number;
  startEntity: EntityItem;
  targetEntity: EntityItem;
  approxSec: number;
  estimatedTimeText: string; // e.g. "~45s walk", "~2 min walk"
  steps: NavigationStep[];
  floorSegments: Record<number, FloorRouteSegment>;
  activeFloorRoutePoints: { x: number; y: number }[];
}

export type ViewMode = '2d' | '3d';
export type FilterCategory = 'all' | 'classroom' | 'lab' | 'lift' | 'stair' | 'amenity';
