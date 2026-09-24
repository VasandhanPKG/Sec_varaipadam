import {
  CORES_DATA,
  GRAPH_NODES,
  GRAPH_CONNECTIONS,
} from '../data/floor6Data';
import { EntityItem, RouteResult, NavigationStep, RoomItem, FloorRouteSegment, CoreItem } from '../types';
import { generateDefaultRoomsForFloor } from '../data/buildingFloorsData';

// Build Adjacency List for 2D Floor Graph
const graphAdj: Record<string, { node: string; weight: number }[]> = {};
Object.keys(GRAPH_NODES).forEach((node) => {
  graphAdj[node] = [];
});

GRAPH_CONNECTIONS.forEach(([u, v, w]) => {
  if (graphAdj[u] && graphAdj[v]) {
    graphAdj[u].push({ node: v, weight: w });
    graphAdj[v].push({ node: u, weight: w });
  }
});

// Map room or vertical core to nearest corridor waypoint
export function resolveNearestWaypoint(entityId: string, customRooms?: RoomItem[]): string {
  if (entityId === 'lift_sw' || entityId === 'stair_sw' || entityId === 'stairs_sw') return 'w_r2_core';
  if (entityId === 'lift_se' || entityId === 'stair_se' || entityId === 'stairs_se') return 'e_r2_core';
  if (entityId === 'lift_mid_w' || entityId === 'stair_mid_w' || entityId === 'stairs_nw' || entityId === 'stair_nw') return 'w_mid_core';
  if (entityId === 'lift_mid_e' || entityId === 'stair_mid_e' || entityId === 'stairs_ne' || entityId === 'stair_ne') return 'e_mid_core';
  if (entityId === 'audi_portal' || entityId.endsWith('151') || entityId === '6151' || entityId === '1151') return 'audi_portal';

  const room = customRooms ? customRooms.find((r) => r.id === entityId) : undefined;
  
  let row = room?.row;
  let col = room?.col;
  let bay = room?.bay;

  // Fallback: parse matrix coordinate from 4-digit code [Floor][Row][Col][Bay]
  if ((!row || !col) && /^\d{4}$/.test(entityId)) {
    row = parseInt(entityId[1], 10);
    col = parseInt(entityId[2], 10);
    bay = parseInt(entityId[3], 10);
  }

  if (!row || !col) return 'w_r6_cross';

  // Row 8 Studios / Labs
  if (row === 8) {
    if (col === 3) return 'w_r8';
    if (col === 7) return 'e_r8';
    if (col <= 4 || (bay && bay <= 2)) return 'r8_c4';
    if (col === 5) return 'r8_c5_mid';
    return 'r8_c6';
  }

  // Row 7 Faculty
  if (row === 7) {
    return col <= 4 ? 'w_r7_fac' : 'e_r7_fac';
  }

  // Row 6 Rooms
  if (row === 6) {
    if (col === 1) return 'r6_w_wing_end';
    if (col === 2) return 'r6_w_wing_junc';
    if (col === 3) return 'w_r6_cross';
    if (col === 4) return 'r6_c4';
    if (col === 5) return 'r6_c5_mid';
    if (col === 6) return 'r6_c6';
    if (col === 7) return 'e_r6_cross';
    if (col === 8) return 'r6_e_wing_junc';
    return 'r6_c5_mid';
  }

  // Row 5 Rooms
  if (row === 5) {
    if (col <= 2) return 'w_wing_r5';
    if (col >= 7) return 'e_wing_r5';
    if (col <= 4) return 'w_r5_vloop';
    return 'e_r5_vloop';
  }

  // Row 4 Rooms
  if (row === 4) {
    if (col === 1) return 'r4_w_wing_end';
    if (col === 2) return 'r4_w_wing_junc';
    if (col === 3) return 'w_r4_cross';
    if (col === 4) return 'r4_c4';
    if (col === 5) return 'r4_c5_mid';
    if (col === 6) return 'r4_c6';
    if (col === 7) return 'e_r4_cross';
    if (col === 8) return 'r4_e_wing_junc';
    return 'r4_c5_mid';
  }

  // Row 3 Rooms
  if (row === 3) {
    return col <= 4 ? 'w_r3_sem' : 'e_r3_sem';
  }

  // Row 2
  if (row === 2) {
    return col <= 4 ? 'w_r2_core' : 'e_r2_core';
  }

  // Row 1
  if (row === 1) {
    return 'audi_portal';
  }

  return 'w_r6_cross';
}

// Shortest path using Dijkstra's algorithm
export function findShortestPath(startKey: string, endKey: string): string[] {
  if (startKey === endKey) {
    return [startKey];
  }

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set(Object.keys(GRAPH_NODES));

  Object.keys(GRAPH_NODES).forEach((node) => {
    dist[node] = Infinity;
    prev[node] = null;
  });
  dist[startKey] = 0;

  while (unvisited.size > 0) {
    let minNode: string | null = null;
    unvisited.forEach((node) => {
      if (minNode === null || dist[node] < dist[minNode]) minNode = node;
    });

    if (minNode === null || dist[minNode] === Infinity || minNode === endKey) break;
    unvisited.delete(minNode);

    const neighbors = graphAdj[minNode] || [];
    for (const edge of neighbors) {
      const alt = dist[minNode] + edge.weight;
      if (alt < dist[edge.node]) {
        dist[edge.node] = alt;
        prev[edge.node] = minNode;
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = endKey;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return path.length >= 1 && path[0] === startKey ? path : [startKey, endKey];
}

// Helper to format walking/transit time
export function formatTimeEstimate(seconds: number): string {
  if (seconds < 60) {
    return `~${Math.round(seconds)}s walk`;
  }
  const mins = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  if (remainingSecs < 15) {
    return `~${mins} min walk`;
  }
  return `~${mins}m ${remainingSecs}s walk`;
}

// Compute single-floor route segment
function buildSingleFloorSegment(
  floor: number,
  startObj: EntityItem,
  targetObj: EntityItem,
  customRooms: RoomItem[],
  isInitialDeparture: boolean,
  isFinalArrival: boolean
): { segment: FloorRouteSegment; estimatedSeconds: number } {
  const startWp = resolveNearestWaypoint(startObj.id, customRooms);
  const endWp = resolveNearestWaypoint(targetObj.id, customRooms);

  const pathWaypointKeys = findShortestPath(startWp, endWp);
  const routePoints: { x: number; y: number }[] = [];

  // Start Door Point
  if (startObj.doorX !== undefined && startObj.doorY !== undefined) {
    routePoints.push({ x: startObj.doorX, y: startObj.doorY });
  } else if ('x' in startObj && 'y' in startObj) {
    routePoints.push({ x: (startObj.x ?? 0) + (startObj.w || 60) / 2, y: (startObj.y ?? 0) + (startObj.h || 60) });
  }

  // Corridor Waypoint Nodes
  pathWaypointKeys.forEach((key) => {
    const wp = GRAPH_NODES[key];
    if (wp) routePoints.push({ x: wp.x, y: wp.y });
  });

  // Target Door Point
  if (targetObj.doorX !== undefined && targetObj.doorY !== undefined) {
    routePoints.push({ x: targetObj.doorX, y: targetObj.doorY });
  } else if ('x' in targetObj && 'y' in targetObj) {
    routePoints.push({ x: (targetObj.x ?? 0) + (targetObj.w || 60) / 2, y: (targetObj.y ?? 0) + (targetObj.h || 60) });
  }

  // Turn-by-Turn step generator
  const steps: NavigationStep[] = [];

  if (isInitialDeparture) {
    steps.push({
      icon: 'map-pin',
      title: `Depart from ${startObj.name} [L${floor}]`,
      desc: 'Step into the main circulation corridor.',
      floor,
    });
  } else {
    steps.push({
      icon: 'arrow-right-circle',
      title: `Exit ${startObj.name} on Floor ${floor}`,
      desc: 'Enter floor corridor heading toward your destination.',
      floor,
    });
  }

  for (let i = 0; i < pathWaypointKeys.length - 1; i++) {
    const cur = GRAPH_NODES[pathWaypointKeys[i]];
    const nxt = GRAPH_NODES[pathWaypointKeys[i + 1]];
    if (!cur || !nxt) continue;

    const dx = nxt.x - cur.x;
    const dy = nxt.y - cur.y;

    let action = 'Walk straight along corridor';
    let icon = 'arrow-up';

    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) {
        action = 'Head North along Main Corridor';
        icon = 'arrow-up';
      } else {
        action = 'Head South along Main Corridor';
        icon = 'arrow-down';
      }
    } else {
      if (dx > 0) {
        action = 'Turn Right along Cross Corridor';
        icon = 'corner-up-right';
      } else {
        action = 'Turn Left along Cross Corridor';
        icon = 'corner-up-left';
      }
    }

    const landmark = nxt.label || 'Corridor Junction';
    steps.push({
      icon,
      title: action,
      desc: `Proceed towards ${landmark}.`,
      floor,
    });
  }

  if (isFinalArrival) {
    steps.push({
      icon: 'check-circle-2',
      title: `Arrive at ${targetObj.name}`,
      desc: `Located on Floor ${floor} (${targetObj.id || targetObj.std || targetObj.name}).`,
      floor,
    });
  }

  const stepCount = Math.max(1, pathWaypointKeys.length);
  const estimatedSeconds = Math.max(15, Math.round(stepCount * 6.5));

  return {
    segment: {
      floor,
      pathWaypointKeys,
      routePoints,
      steps,
    },
    estimatedSeconds,
  };
}

// Find optimal vertical lift/stair core between start and target
function pickOptimalVerticalCore(
  startEntity: EntityItem,
  targetEntity: EntityItem,
  allRooms: RoomItem[]
): CoreItem {
  if (startEntity.type === 'lift' || startEntity.type === 'stair') {
    const core = CORES_DATA.find((c) => c.id === startEntity.id);
    if (core) return core;
  }
  if (targetEntity.type === 'lift' || targetEntity.type === 'stair') {
    const core = CORES_DATA.find((c) => c.id === targetEntity.id);
    if (core) return core;
  }

  const liftCores = CORES_DATA.filter((c) => c.type === 'lift');
  let bestCore = liftCores[0] || CORES_DATA[0];
  let minSteps = Infinity;

  const startWp = resolveNearestWaypoint(startEntity.id, allRooms);
  const targetWp = resolveNearestWaypoint(targetEntity.id, allRooms);

  liftCores.forEach((core) => {
    const coreWp = resolveNearestWaypoint(core.id, allRooms);
    const path1 = findShortestPath(startWp, coreWp);
    const path2 = findShortestPath(coreWp, targetWp);
    const totalSteps = path1.length + path2.length;
    if (totalSteps < minSteps) {
      minSteps = totalSteps;
      bestCore = core;
    }
  });

  return bestCore;
}

// Helper to synthesize entity if not found in database
function findOrSynthesizeEntity(
  id: string,
  floor: number,
  allPool: EntityItem[]
): EntityItem {
  let found = allPool.find((e) => e.id === id);
  if (found) return found;

  const core = CORES_DATA.find((c) => c.id === id);
  if (core) return core;

  // Synthesize from 4-digit code
  let row = 4;
  let col = 5;
  let bay = 1;

  if (/^\d{4}$/.test(id)) {
    row = parseInt(id[1], 10);
    col = parseInt(id[2], 10);
    bay = parseInt(id[3], 10);
  }

  const defaultDoorX = col <= 4 ? 370 : 610;
  const defaultDoorY = 200 + (8 - row) * 100;

  return {
    id,
    std: id.slice(1),
    name: `Space ${id}`,
    type: 'classroom',
    floor,
    row,
    col,
    bay,
    x: defaultDoorX - 30,
    y: defaultDoorY - 30,
    w: 60,
    h: 60,
    doorX: defaultDoorX,
    doorY: defaultDoorY,
    desc: `Floor ${floor} Space (${id})`,
  };
}

// Main Multi-Floor Route Calculator (Floors 1 to 6)
export function calculateMultiFloorRoute(
  startEntityId: string,
  targetEntityId: string,
  startFloorArg?: number,
  targetFloorArg?: number,
  allFloorsRoomsMap?: Record<number, RoomItem[]>,
  allDestinationsList?: EntityItem[]
): RouteResult | null {
  // 1. Auto-infer floor from 4-digit codes if present
  let startFloor = startFloorArg ?? 6;
  if (/^[1-6]\d{3}$/.test(startEntityId)) {
    startFloor = parseInt(startEntityId[0], 10);
  }

  let targetFloor = targetFloorArg ?? 6;
  if (/^[1-6]\d{3}$/.test(targetEntityId)) {
    targetFloor = parseInt(targetEntityId[0], 10);
  }

  // 2. Build complete room registries
  const startRooms =
    allFloorsRoomsMap?.[startFloor] || generateDefaultRoomsForFloor(startFloor);
  const targetRooms =
    allFloorsRoomsMap?.[targetFloor] || generateDefaultRoomsForFloor(targetFloor);

  const allAvailableRooms = allFloorsRoomsMap
    ? Object.values(allFloorsRoomsMap).flat()
    : [...startRooms, ...targetRooms];

  const pool = [
    ...(allDestinationsList || []),
    ...allAvailableRooms,
    ...CORES_DATA,
  ];

  // 3. Resolve start & target entities
  const startObj = findOrSynthesizeEntity(startEntityId, startFloor, pool);
  const targetObj = findOrSynthesizeEntity(targetEntityId, targetFloor, pool);

  const isMultiFloor = startFloor !== targetFloor;
  const floorSegments: Record<number, FloorRouteSegment> = {};
  const allSteps: NavigationStep[] = [];
  let totalSeconds = 0;

  if (!isMultiFloor) {
    // Same-Floor Direct Route
    const { segment, estimatedSeconds } = buildSingleFloorSegment(
      startFloor,
      startObj,
      targetObj,
      startRooms,
      true,
      true
    );
    floorSegments[startFloor] = segment;
    allSteps.push(...segment.steps);
    totalSeconds = estimatedSeconds;
  } else {
    // Multi-Floor Route via Vertical Core (Lift / Stair)
    const verticalCore = pickOptimalVerticalCore(startObj, targetObj, pool as RoomItem[]);

    // Step 1: Start Floor Route (Start Room -> Vertical Core)
    const startSeg = buildSingleFloorSegment(
      startFloor,
      startObj,
      verticalCore,
      startRooms,
      true,
      false
    );
    floorSegments[startFloor] = startSeg.segment;
    allSteps.push(...startSeg.segment.steps);
    totalSeconds += startSeg.estimatedSeconds;

    // Step 2: Elevator Transit
    const floorDiff = Math.abs(targetFloor - startFloor);
    const directionWord = targetFloor > startFloor ? 'Up' : 'Down';
    const coreName = verticalCore.name.includes('Lift') ? 'Elevator / Lift' : 'Staircase';

    allSteps.push({
      icon: 'layers',
      title: `Take ${verticalCore.name} ${directionWord} to Floor ${targetFloor}`,
      desc: `Ascend/Descend ${floorDiff} level${floorDiff > 1 ? 's' : ''} via ${coreName}.`,
      floor: targetFloor,
      isFloorChange: true,
    });
    totalSeconds += 15 + floorDiff * 6;

    // Step 3: Target Floor Route (Vertical Core -> Target Room)
    const targetSeg = buildSingleFloorSegment(
      targetFloor,
      verticalCore,
      targetObj,
      targetRooms,
      false,
      true
    );
    floorSegments[targetFloor] = targetSeg.segment;
    allSteps.push(...targetSeg.segment.steps);
    totalSeconds += targetSeg.estimatedSeconds;
  }

  const activeFloorRoutePoints =
    floorSegments[startFloor]?.routePoints ||
    floorSegments[targetFloor]?.routePoints ||
    [];
  const estimatedTimeText = formatTimeEstimate(totalSeconds);

  return {
    isMultiFloor,
    startFloor,
    targetFloor,
    startEntity: startObj,
    targetEntity: targetObj,
    approxSec: totalSeconds,
    estimatedTimeText,
    steps: allSteps,
    floorSegments,
    activeFloorRoutePoints,
  };
}

// Backward-compatible alias
export const calculateCorridorRoute = (
  startEntityId: string,
  targetEntityId: string,
  allDestinationsList?: EntityItem[]
) => {
  return calculateMultiFloorRoute(startEntityId, targetEntityId, 6, 6, undefined, allDestinationsList);
};
