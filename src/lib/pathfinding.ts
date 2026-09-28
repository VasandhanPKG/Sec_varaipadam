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

// Calculate distance between two points
function dist2D(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// Get the exact door point of an entity
export function getEntityDoor(entity: EntityItem): { x: number; y: number } {
  if (entity.doorX !== undefined && entity.doorY !== undefined) {
    return { x: entity.doorX, y: entity.doorY };
  }
  const x = 'x' in entity ? entity.x ?? 0 : 500;
  const y = 'y' in entity ? entity.y ?? 0 : 500;
  const w = 'w' in entity ? entity.w || 60 : 60;
  const h = 'h' in entity ? entity.h || 60 : 60;
  return { x: x + w / 2, y: y + h };
}

// Calculate the precise anchor point on the nearest circulation corridor
export function getCorridorAnchorPoint(entity: EntityItem): { x: number; y: number; corridorAxis: 'x' | 'y' | 'none'; corridorValue: number } {
  const door = getEntityDoor(entity);

  if (entity.id === 'audi_portal' || entity.id.endsWith('151') || entity.id === '6151' || entity.id === '1151') {
    return { x: 500, y: 900, corridorAxis: 'y', corridorValue: 900 };
  }
  if (entity.id === 'lift_sw' || entity.id === 'stair_sw') {
    return { x: 357, y: 875, corridorAxis: 'x', corridorValue: 357 };
  }
  if (entity.id === 'lift_se' || entity.id === 'stair_se') {
    return { x: 642, y: 875, corridorAxis: 'x', corridorValue: 642 };
  }
  if (entity.id === 'lift_mid_w' || entity.id === 'stair_mid_w') {
    return { x: 357, y: 365, corridorAxis: 'x', corridorValue: 357 };
  }
  if (entity.id === 'lift_mid_e' || entity.id === 'stair_mid_e') {
    return { x: 642, y: 365, corridorAxis: 'x', corridorValue: 642 };
  }

  const row = entity.row;
  const col = entity.col;

  // Row 8 North Concourse
  if (row === 8) {
    if (door.x >= 357 && door.x <= 642) {
      return { x: door.x, y: 225, corridorAxis: 'y', corridorValue: 225 };
    }
    if (door.x < 357) return { x: 357, y: 225, corridorAxis: 'y', corridorValue: 225 };
    return { x: 642, y: 225, corridorAxis: 'y', corridorValue: 225 };
  }

  // Row 7 Faculty Corridor
  if (row === 7) {
    if (door.x < 500) {
      return { x: 357, y: door.y, corridorAxis: 'x', corridorValue: 357 };
    }
    return { x: 642, y: door.y, corridorAxis: 'x', corridorValue: 642 };
  }

  // Row 6 Main Gallery Concourse
  if (row === 6) {
    return { x: door.x, y: 430, corridorAxis: 'y', corridorValue: 430 };
  }

  // Row 5 Atrium flanks & Outer wings
  if (row === 5) {
    if (col && col <= 2) {
      return { x: 202, y: door.y, corridorAxis: 'x', corridorValue: 202 };
    }
    if (col && col >= 7) {
      return { x: 800, y: door.y, corridorAxis: 'x', corridorValue: 800 };
    }
    if (door.x < 500) {
      return { x: 357, y: door.y, corridorAxis: 'x', corridorValue: 357 };
    }
    return { x: 642, y: door.y, corridorAxis: 'x', corridorValue: 642 };
  }

  // Row 4 Lower Gallery Concourse
  if (row === 4) {
    return { x: door.x, y: 620, corridorAxis: 'y', corridorValue: 620 };
  }

  // Row 3 Seminar Studio Spine
  if (row === 3) {
    if (door.x < 500) {
      return { x: 357, y: door.y, corridorAxis: 'x', corridorValue: 357 };
    }
    return { x: 642, y: door.y, corridorAxis: 'x', corridorValue: 642 };
  }

  // Row 2 / Row 1 Promenade
  if (row === 2 || row === 1) {
    if (door.y >= 860) {
      return { x: door.x, y: 900, corridorAxis: 'y', corridorValue: 900 };
    }
    return door.x < 500
      ? { x: 357, y: 875, corridorAxis: 'x', corridorValue: 357 }
      : { x: 642, y: 875, corridorAxis: 'x', corridorValue: 642 };
  }

  // Fallback: project onto nearest graph node
  let bestNode = 'w_r6_cross';
  let minDist = Infinity;
  for (const [nodeKey, node] of Object.entries(GRAPH_NODES)) {
    const d = dist2D(door.x, door.y, node.x, node.y);
    if (d < minDist) {
      minDist = d;
      bestNode = nodeKey;
    }
  }
  const fallback = GRAPH_NODES[bestNode];
  return { x: fallback.x, y: fallback.y, corridorAxis: 'none', corridorValue: 0 };
}

// Map room or vertical core to nearest corridor waypoint in graph
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

  if (!row || !col) {
    if (room && room.doorX !== undefined && room.doorY !== undefined) {
      let closestNode = 'w_r6_cross';
      let minD = Infinity;
      for (const [k, n] of Object.entries(GRAPH_NODES)) {
        const d = dist2D(room.doorX, room.doorY, n.x, n.y);
        if (d < minD) {
          minD = d;
          closestNode = k;
        }
      }
      return closestNode;
    }
    return 'w_r6_cross';
  }

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

// Clean and optimize path points: remove overshoots, duplicates, and backtracking
function cleanAndTrimRoutePoints(
  rawPoints: { x: number; y: number }[]
): { x: number; y: number }[] {
  if (rawPoints.length <= 1) return rawPoints;

  // 1. Remove duplicate adjacent points (< 3px)
  const deduped: { x: number; y: number }[] = [];
  for (const pt of rawPoints) {
    if (deduped.length === 0) {
      deduped.push(pt);
    } else {
      const last = deduped[deduped.length - 1];
      if (dist2D(last.x, last.y, pt.x, pt.y) > 2) {
        deduped.push(pt);
      }
    }
  }

  if (deduped.length <= 2) return deduped;

  // 2. Collinear simplification and overshoot removal
  const cleaned: { x: number; y: number }[] = [deduped[0]];

  for (let i = 1; i < deduped.length - 1; i++) {
    const prev = cleaned[cleaned.length - 1];
    const curr = deduped[i];
    const next = deduped[i + 1];

    // Check if points are strictly collinear along X axis
    const isHorizontal = Math.abs(prev.y - curr.y) < 2 && Math.abs(curr.y - next.y) < 2;
    // Check if points are strictly collinear along Y axis
    const isVertical = Math.abs(prev.x - curr.x) < 2 && Math.abs(curr.x - next.x) < 2;

    if (isHorizontal) {
      // Check if curr is between prev and next
      const isBetween = (curr.x >= Math.min(prev.x, next.x) - 1) && (curr.x <= Math.max(prev.x, next.x) + 1);
      if (isBetween) {
        // Redundant intermediate point on straight line
        continue;
      }
      // If curr is beyond both prev and next, it's an overshoot/backtracking!
      const isOvershoot = (curr.x > Math.max(prev.x, next.x)) || (curr.x < Math.min(prev.x, next.x));
      if (isOvershoot) {
        // Skip overshooting node
        continue;
      }
    } else if (isVertical) {
      const isBetween = (curr.y >= Math.min(prev.y, next.y) - 1) && (curr.y <= Math.max(prev.y, next.y) + 1);
      if (isBetween) {
        continue;
      }
      const isOvershoot = (curr.y > Math.max(prev.y, next.y)) || (curr.y < Math.min(prev.y, next.y));
      if (isOvershoot) {
        continue;
      }
    }

    cleaned.push(curr);
  }

  cleaned.push(deduped[deduped.length - 1]);
  return cleaned;
}

// Generate natural, human-friendly turn-by-turn steps from cleaned points
function generateHumanFriendlySteps(
  points: { x: number; y: number }[],
  floor: number,
  startObj: EntityItem,
  targetObj: EntityItem,
  isInitialDeparture: boolean,
  isFinalArrival: boolean
): NavigationStep[] {
  const steps: NavigationStep[] = [];

  // 1. Departure Step
  if (isInitialDeparture) {
    steps.push({
      icon: 'map-pin',
      title: `Start at ${startObj.name}`,
      desc: `Exit room into Floor ${floor} corridor.`,
      floor,
    });
  } else {
    steps.push({
      icon: 'arrow-right-circle',
      title: `Exit ${startObj.name}`,
      desc: `Enter Floor ${floor} corridor.`,
      floor,
    });
  }

  if (points.length < 2) {
    if (isFinalArrival) {
      steps.push({
        icon: 'check-circle-2',
        title: `Arrive at ${targetObj.name}`,
        desc: `Your destination is right here on Floor ${floor}.`,
        floor,
      });
    }
    return steps;
  }

  // 2. Walk segments & turn analysis
  for (let i = 0; i < points.length - 1; i++) {
    const cur = points[i];
    const nxt = points[i + 1];
    const dx = nxt.x - cur.x;
    const dy = nxt.y - cur.y;
    const segLen = Math.round(dist2D(cur.x, cur.y, nxt.x, nxt.y) * 0.18); // approx meters

    // Identify direction & orientation
    let heading = '';
    let isVert = Math.abs(dy) > Math.abs(dx);
    if (isVert) {
      heading = dy < 0 ? 'North' : 'South';
    } else {
      heading = dx > 0 ? 'East' : 'West';
    }

    // Determine turn relative to previous motion
    let turnAction = `Walk ${heading}`;
    let icon = 'arrow-up';

    if (i > 0) {
      const prev = points[i - 1];
      const prevDx = cur.x - prev.x;
      const prevDy = cur.y - prev.y;

      // 2D Cross Product (prevDx * dy - prevDy * dx) to determine Left vs Right turn in standard screen coords
      const cross = prevDx * dy - prevDy * dx;
      const dot = prevDx * dx + prevDy * dy;

      if (Math.abs(cross) > 100) {
        if (cross > 0) {
          turnAction = `Turn Right, head ${heading}`;
          icon = 'corner-up-right';
        } else {
          turnAction = `Turn Left, head ${heading}`;
          icon = 'corner-up-left';
        }
      } else if (dot < -100) {
        turnAction = 'Turn around';
        icon = 'arrow-down';
      } else {
        turnAction = `Continue straight ${heading}`;
        icon = 'arrow-up';
      }
    }

    // Friendly corridor zone description
    let corridorName = 'along the corridor';
    const midY = (cur.y + nxt.y) / 2;
    const midX = (cur.x + nxt.x) / 2;

    if (midY < 290) corridorName = 'along North Concourse (Row 8)';
    else if (midY > 370 && midY < 480) corridorName = 'along Central Gallery (Row 6)';
    else if (midY > 560 && midY < 680) corridorName = 'along Lower Concourse (Row 4)';
    else if (midY > 820) corridorName = 'towards South Promenade';
    else if (midX < 365) corridorName = 'along West Main Corridor';
    else if (midX > 635) corridorName = 'along East Main Corridor';

    steps.push({
      icon,
      title: turnAction,
      desc: `Proceed ${corridorName} (~${Math.max(5, segLen)}m).`,
      floor,
    });
  }

  // 3. Final Arrival Step
  if (isFinalArrival) {
    steps.push({
      icon: 'check-circle-2',
      title: `Arrive at ${targetObj.name}`,
      desc: `Located on Floor ${floor} (${targetObj.id || targetObj.std || targetObj.name}).`,
      floor,
    });
  }

  return steps;
}

// Compute single-floor route segment with smart corridor projection & no overshoot
function buildSingleFloorSegment(
  floor: number,
  startObj: EntityItem,
  targetObj: EntityItem,
  customRooms: RoomItem[],
  isInitialDeparture: boolean,
  isFinalArrival: boolean
): { segment: FloorRouteSegment; estimatedSeconds: number } {
  const startDoor = getEntityDoor(startObj);
  const targetDoor = getEntityDoor(targetObj);

  const startAnchor = getCorridorAnchorPoint(startObj);
  const targetAnchor = getCorridorAnchorPoint(targetObj);

  const rawRoutePoints: { x: number; y: number }[] = [];
  rawRoutePoints.push(startDoor);

  // Check if both rooms are on the exact same straight corridor
  const isSameCorridor =
    startAnchor.corridorAxis !== 'none' &&
    startAnchor.corridorAxis === targetAnchor.corridorAxis &&
    Math.abs(startAnchor.corridorValue - targetAnchor.corridorValue) < 8;

  let pathWaypointKeys: string[] = [];

  if (isSameCorridor) {
    // Same straight corridor: connect directly through corridor line without detour
    rawRoutePoints.push({ x: startAnchor.x, y: startAnchor.y });
    rawRoutePoints.push({ x: targetAnchor.x, y: targetAnchor.y });
    rawRoutePoints.push(targetDoor);
  } else {
    // Multi-corridor route: find shortest path via graph
    const startWp = resolveNearestWaypoint(startObj.id, customRooms);
    const endWp = resolveNearestWaypoint(targetObj.id, customRooms);

    pathWaypointKeys = findShortestPath(startWp, endWp);

    rawRoutePoints.push({ x: startAnchor.x, y: startAnchor.y });

    // Waypoint nodes along the shortest graph path
    pathWaypointKeys.forEach((key) => {
      const wp = GRAPH_NODES[key];
      if (wp) rawRoutePoints.push({ x: wp.x, y: wp.y });
    });

    rawRoutePoints.push({ x: targetAnchor.x, y: targetAnchor.y });
    rawRoutePoints.push(targetDoor);
  }

  // Clean, trim overshoots, and deduplicate route points
  const routePoints = cleanAndTrimRoutePoints(rawRoutePoints);

  // Generate crisp, professional turn-by-turn navigation steps
  const steps = generateHumanFriendlySteps(
    routePoints,
    floor,
    startObj,
    targetObj,
    isInitialDeparture,
    isFinalArrival
  );

  let totalDistPx = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    totalDistPx += dist2D(routePoints[i].x, routePoints[i].y, routePoints[i + 1].x, routePoints[i + 1].y);
  }
  const estimatedSeconds = Math.max(12, Math.round(totalDistPx * 0.12));

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
