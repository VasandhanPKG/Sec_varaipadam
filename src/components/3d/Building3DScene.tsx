import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EntityItem, RouteResult, SpaceType } from '../../types';
import { useRooms } from '../../context/RoomsContext';
import { FLOORS_META } from '../../data/buildingFloorsData';
import { DirectionsDrawer } from '../navigation/DirectionsDrawer';
import {
  Layers,
  Compass,
  Navigation,
  Sparkles,
  Eye,
  Maximize2,
  ZoomIn,
  Building2,
  Info,
  GraduationCap,
  FlaskConical,
  Briefcase,
  Coffee,
  Sun,
  Box,
  MapPin,
  Flag,
} from 'lucide-react';

interface Building3DSceneProps {
  activeRoute: RouteResult | null;
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
  onCalculateRoute?: (startId: string, endId: string, startFloor?: number, targetFloor?: number) => void;
  onClearRoute?: () => void;
}

// Convert 2D blueprint coordinates (0..1000, 0..1250) to 3D world space
export function convert2Dto3D(x: number, y: number, floor: number = 6): [number, number, number] {
  const worldX = (x - 500) / 10;
  const worldZ = (y - 625) / 10;
  const worldY = (floor - 1) * 6.8 + 1.2;
  return [worldX, worldY, worldZ];
}

// Helper to build chamfered corridor curves (strictly within corridors, avoiding wall clipping)
function buildCorridorCurve(pts: { x: number; y: number }[], floor: number) {
  if (!pts || pts.length < 2) return null;
  const y = (floor - 1) * 6.8 + 0.8;
  const vectorPoints: THREE.Vector3[] = [];

  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const currV = new THREE.Vector3((curr.x - 500) / 10, y, (curr.y - 625) / 10);

    if (i > 0 && i < pts.length - 1) {
      const prev = pts[i - 1];
      const next = pts[i + 1];
      const prevV = new THREE.Vector3((prev.x - 500) / 10, y, (prev.y - 625) / 10);
      const nextV = new THREE.Vector3((next.x - 500) / 10, y, (next.y - 625) / 10);

      const dIn = currV.clone().sub(prevV);
      const dOut = nextV.clone().sub(currV);
      const lenIn = dIn.length();
      const lenOut = dOut.length();

      const cornerRadius = Math.min(0.8, lenIn * 0.35, lenOut * 0.35);
      if (cornerRadius > 0.1) {
        const pIn = currV.clone().sub(dIn.normalize().multiplyScalar(cornerRadius));
        const pOut = currV.clone().add(dOut.normalize().multiplyScalar(cornerRadius));
        vectorPoints.push(pIn);
        vectorPoints.push(pOut);
        continue;
      }
    }
    vectorPoints.push(currV);
  }

  if (vectorPoints.length < 2) return null;
  return new THREE.CatmullRomCurve3(vectorPoints, false, 'catmullrom', 0.1);
}

// 3D Animated Route Tube with Floor Corridors, Vertical Shaft Beam & Start/Destination Beacons
function AnimatedRouteTube({ route }: { route: RouteResult }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shaftRef = useRef<THREE.Mesh>(null);
  const beaconStartRef = useRef<THREE.Group>(null);
  const beaconTargetRef = useRef<THREE.Group>(null);

  // Single Floor Curve
  const singleCurve = useMemo(() => {
    if (route.isMultiFloor) return null;
    const seg = route.floorSegments[route.startFloor];
    const pts = seg?.routePoints || route.activeFloorRoutePoints;
    return buildCorridorCurve(pts, route.startFloor);
  }, [route]);

  // Multi-Floor Curves
  const startFloorCurve = useMemo(() => {
    if (!route.isMultiFloor) return null;
    const seg = route.floorSegments[route.startFloor];
    return seg ? buildCorridorCurve(seg.routePoints, route.startFloor) : null;
  }, [route]);

  const targetFloorCurve = useMemo(() => {
    if (!route.isMultiFloor) return null;
    const seg = route.floorSegments[route.targetFloor];
    return seg ? buildCorridorCurve(seg.routePoints, route.targetFloor) : null;
  }, [route]);

  // Vertical Shaft Laser
  const verticalShaft = useMemo(() => {
    if (!route.isMultiFloor) return null;
    const startSeg = route.floorSegments[route.startFloor];
    const targetSeg = route.floorSegments[route.targetFloor];
    if (!startSeg?.routePoints.length || !targetSeg?.routePoints.length) return null;

    const liftPt = startSeg.routePoints[startSeg.routePoints.length - 1];
    const x = (liftPt.x - 500) / 10;
    const z = (liftPt.y - 625) / 10;
    const y1 = (route.startFloor - 1) * 6.8 + 0.8;
    const y2 = (route.targetFloor - 1) * 6.8 + 0.8;
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const height = maxY - minY;

    return {
      x,
      z,
      centerY: minY + height / 2,
      height,
    };
  }, [route]);

  // Beacon Positions
  const startPos = useMemo(() => {
    const pts = route.isMultiFloor
      ? route.floorSegments[route.startFloor]?.routePoints
      : route.floorSegments[route.startFloor]?.routePoints || route.activeFloorRoutePoints;
    if (!pts || pts.length === 0) return null;
    const p = pts[0];
    return [(p.x - 500) / 10, (route.startFloor - 1) * 6.8 + 0.4, (p.y - 625) / 10] as [number, number, number];
  }, [route]);

  const targetPos = useMemo(() => {
    const targetFloor = route.isMultiFloor ? route.targetFloor : route.startFloor;
    const pts = route.isMultiFloor
      ? route.floorSegments[route.targetFloor]?.routePoints
      : route.floorSegments[route.startFloor]?.routePoints || route.activeFloorRoutePoints;
    if (!pts || pts.length === 0) return null;
    const p = pts[pts.length - 1];
    return [(p.x - 500) / 10, (targetFloor - 1) * 6.8 + 0.4, (p.y - 625) / 10] as [number, number, number];
  }, [route]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((m) => {
      if (m && m.material) {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.8 + Math.sin(t * 3.5) * 0.7;
      }
    });
    if (shaftRef.current && shaftRef.current.material) {
      (shaftRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2.5 + Math.sin(t * 5.0) * 1.0;
    }
    if (beaconStartRef.current) {
      beaconStartRef.current.position.y = (startPos ? startPos[1] : 0) + Math.sin(t * 4) * 0.2 + 0.3;
    }
    if (beaconTargetRef.current) {
      beaconTargetRef.current.position.y = (targetPos ? targetPos[1] : 0) + Math.sin(t * 4 + Math.PI) * 0.2 + 0.3;
    }
  });

  return (
    <group>
      {/* Single Floor Tube */}
      {singleCurve && (
        <mesh ref={(el) => (meshRefs.current[0] = el)}>
          <tubeGeometry args={[singleCurve, 96, 0.38, 10, false]} />
          <meshStandardMaterial
            color="#2563eb"
            emissive="#38bdf8"
            emissiveIntensity={2.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      )}

      {/* Multi-Floor Start Tube */}
      {startFloorCurve && (
        <mesh ref={(el) => (meshRefs.current[1] = el)}>
          <tubeGeometry args={[startFloorCurve, 64, 0.38, 10, false]} />
          <meshStandardMaterial
            color="#2563eb"
            emissive="#38bdf8"
            emissiveIntensity={2.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      )}

      {/* Multi-Floor Target Tube */}
      {targetFloorCurve && (
        <mesh ref={(el) => (meshRefs.current[2] = el)}>
          <tubeGeometry args={[targetFloorCurve, 64, 0.38, 10, false]} />
          <meshStandardMaterial
            color="#2563eb"
            emissive="#38bdf8"
            emissiveIntensity={2.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      )}

      {/* Vertical Elevator Shaft Laser Beam */}
      {verticalShaft && (
        <group position={[verticalShaft.x, verticalShaft.centerY, verticalShaft.z]}>
          <mesh ref={shaftRef}>
            <cylinderGeometry args={[0.45, 0.45, verticalShaft.height, 16]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={3.0}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.9, 0.9, verticalShaft.height, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#7dd3fc"
              emissiveIntensity={1.2}
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      )}

      {/* START BEACON PIN */}
      {startPos && (
        <group position={[startPos[0], startPos[1], startPos[2]]}>
          {/* Ground Pulse Disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.6, 1.2, 24]} />
            <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
          {/* Floating Marker */}
          <group ref={beaconStartRef} position={[0, 0.5, 0]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
              <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={3.0} />
            </mesh>
            <Text
              position={[0, 3.4, 0]}
              fontSize={0.8}
              color="#10b981"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              START
            </Text>
          </group>
        </group>
      )}

      {/* TARGET BEACON PIN */}
      {targetPos && (
        <group position={[targetPos[0], targetPos[1], targetPos[2]]}>
          {/* Ground Pulse Disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.6, 1.2, 24]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
          {/* Floating Marker */}
          <group ref={beaconTargetRef} position={[0, 0.5, 0]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
              <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={3.0} />
            </mesh>
            <Text
              position={[0, 3.4, 0]}
              fontSize={0.8}
              color="#f59e0b"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              DESTINATION
            </Text>
          </group>
        </group>
      )}
    </group>
  );
}

// 3D Room Box Component with Category Styling & Interactive Hover/Selection
function Room3DBox({
  room,
  floorNumber,
  isSelected,
  onSelectEntity,
  onHoverEntity,
}: {
  room: EntityItem;
  floorNumber: number;
  isSelected: boolean;
  onSelectEntity: (entity: EntityItem) => void;
  onHoverEntity: (entity: EntityItem | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const posX = ('x' in room && room.w ? room.x + room.w / 2 - 500 : 0) / 10;
  const posZ = ('y' in room && room.h ? room.y + room.h / 2 - 625 : 0) / 10;
  const width = ('w' in room && room.w ? room.w : 60) / 10;
  const depth = ('h' in room && room.h ? room.h : 60) / 10;
  const height = 2.4;

  const getColor = () => {
    if (isSelected) return '#f59e0b';
    if (hovered) return '#3b82f6';
    switch (room.type) {
      case 'classroom':
        return '#1e3a8a';
      case 'lab':
        return '#0284c7';
      case 'office':
      case 'core':
        return '#6b21a8';
      case 'amenity':
        return '#047857';
      default:
        return '#1e293b';
    }
  };

  const getEmissive = () => {
    if (isSelected) return '#d97706';
    if (hovered) return '#2563eb';
    switch (room.type) {
      case 'classroom':
        return '#172554';
      case 'lab':
        return '#0369a1';
      case 'office':
      case 'core':
        return '#581c87';
      case 'amenity':
        return '#065f46';
      default:
        return '#0f172a';
    }
  };

  return (
    <group position={[posX, height / 2 + 0.1, posZ]}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectEntity(room);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHoverEntity(room);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHoverEntity(null);
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getEmissive()}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      <mesh position={[0, height / 2 + 0.02, 0]}>
        <boxGeometry args={[width * 0.96, 0.04, depth * 0.96]} />
        <meshStandardMaterial
          color={isSelected ? '#fbbf24' : '#e2e8f0'}
          roughness={0.5}
        />
      </mesh>

      <Text
        position={[0, height / 2 + 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={Math.min(0.9, width * 0.22)}
        color={isSelected ? '#78350f' : '#0f172a'}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {room.id}
      </Text>
    </group>
  );
}

// 3D Auditorium / Amphitheater Component (Exact 2D Geometry Match)
function Auditorium3D({
  floorNumber,
  isSelected,
  onSelectEntity,
  onHoverEntity,
}: {
  floorNumber: number;
  isSelected: boolean;
  onSelectEntity: (entity: EntityItem) => void;
  onHoverEntity: (entity: EntityItem | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const audiEntity: EntityItem = {
    id: `${floorNumber}151`,
    name: 'Grand Auditorium',
    type: 'amenity',
    floor: floorNumber,
    capacity: 650,
    row: 1,
    col: 5,
    x: 250,
    y: 950,
    w: 500,
    h: 250,
    doorX: 500,
    doorY: 900,
    desc: 'Main Institutional Auditorium with tiered seating',
  };

  const audiShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-25, -38);
    s.quadraticCurveTo(0, -34.5, 25, -38);
    s.lineTo(31.5, -50);
    s.quadraticCurveTo(0, -58.5, -31.5, -50);
    s.closePath();
    return s;
  }, []);

  const westLobbyShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-31.5, -30.5);
    s.lineTo(-19, -32.5);
    s.lineTo(-24.5, -42);
    s.lineTo(-31.5, -36);
    s.closePath();
    return s;
  }, []);

  const eastLobbyShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(31.5, -30.5);
    s.lineTo(19, -32.5);
    s.lineTo(24.5, -42);
    s.lineTo(31.5, -36);
    s.closePath();
    return s;
  }, []);

  const audiExtrudeSettings = useMemo(
    () => ({
      depth: 2.2,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    }),
    []
  );

  const lobbyExtrudeSettings = useMemo(
    () => ({
      depth: 0.6,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Clean Stage Platform (No Backstage Rooms) */}
      <group position={[0, 0.4, 32.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[32, 0.8, 2.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
        <Text
          position={[0, 0.42, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.8}
          color="#334155"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.2}
        >
          STAGE
        </Text>
      </group>

      {/* West Lobby Platform */}
      <group position={[0, 0.3, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <extrudeGeometry args={[westLobbyShape, lobbyExtrudeSettings]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} />
        </mesh>
        <Text
          position={[-26, 0.7, 35]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.9}
          color="#92400e"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Lobby
        </Text>
      </group>

      {/* East Lobby Platform */}
      <group position={[0, 0.3, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <extrudeGeometry args={[eastLobbyShape, lobbyExtrudeSettings]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} />
        </mesh>
        <Text
          position={[26, 0.7, 35]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.9}
          color="#92400e"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Lobby
        </Text>
      </group>

      {/* Main Extruded Curved Auditorium Body */}
      <group position={[0, 0.1, 0]}>
        <mesh
          castShadow
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectEntity(audiEntity);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHoverEntity(audiEntity);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHoverEntity(null);
          }}
        >
          <extrudeGeometry args={[audiShape, audiExtrudeSettings]} />
          <meshStandardMaterial
            color={isSelected ? '#f59e0b' : hovered ? '#3b82f6' : '#1e3a8a'}
            emissive={isSelected ? '#d97706' : hovered ? '#2563eb' : '#172554'}
            emissiveIntensity={isSelected ? 0.75 : hovered ? 0.5 : 0.2}
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>

        <Text
          position={[0, 2.45, 45]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="black"
        >
          {`${floorNumber}151`}
        </Text>
        <Text
          position={[0, 2.45, 47.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.9}
          color="#93c5fd"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Auditorium
        </Text>

        <mesh position={[0, 2.38, 44]}>
          <boxGeometry args={[0.5, 0.05, 12]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>
    </group>
  );
}

// 🏢 ICONIC FRONT BUILDING ROTUNDA & FACADE (Faithfully Modeled after Real Campus Reference Image)
function FrontBuildingFacade({ isCutaway }: { isCutaway: boolean }) {
  if (isCutaway) return null;

  const totalHeight = 41.5;
  const pillarAngles = [-0.44, -0.26, -0.09, 0.09, 0.26, 0.44];
  const floorHeights = [0, 6.8, 13.6, 20.4, 27.2, 34.0, 40.8];

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Curved Glass Curtain Wall facing Front (+Z) */}
      <group position={[0, totalHeight / 2, -4.1]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[62.6, 62.6, totalHeight, 48, 1, true, -0.528, 1.056]} />
          <meshPhysicalMaterial
            color="#67e8f9"
            emissive="#0e7490"
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.2}
            transmission={0.65}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 2. Terracotta / Orange Side Towers */}
      {/* Left Orange Tower */}
      <group position={[-32.5, totalHeight / 2, 47.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.2, totalHeight + 1.2, 7.5]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        <mesh position={[2.6, 0, 3.75]}>
          <boxGeometry args={[0.5, totalHeight + 1.4, 0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[-2.6, 0, 3.75]}>
          <boxGeometry args={[0.5, totalHeight + 1.4, 0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        {floorHeights.map((h, idx) => (
          <mesh key={`lw-slit-${idx}`} position={[0, h - totalHeight / 2 + 3.4, 3.8]}>
            <boxGeometry args={[2.5, 2.2, 0.1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
      </group>

      {/* Right Orange Tower */}
      <group position={[32.5, totalHeight / 2, 47.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.2, totalHeight + 1.2, 7.5]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        <mesh position={[2.6, 0, 3.75]}>
          <boxGeometry args={[0.5, totalHeight + 1.4, 0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[-2.6, 0, 3.75]}>
          <boxGeometry args={[0.5, totalHeight + 1.4, 0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        {floorHeights.map((h, idx) => (
          <mesh key={`rw-slit-${idx}`} position={[0, h - totalHeight / 2 + 3.4, 3.8]}>
            <boxGeometry args={[2.5, 2.2, 0.1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
      </group>

      {/* 3. 6 Vertical Steel/Concrete Structural Columns */}
      {pillarAngles.map((angle, idx) => {
        const px = 62.6 * Math.sin(angle);
        const pz = -4.1 + 62.6 * Math.cos(angle);
        return (
          <mesh key={`col-${idx}`} position={[px, totalHeight / 2, pz]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, totalHeight + 0.8, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}

      {/* 4. Horizontal White Concrete Spandrel Ledges */}
      {floorHeights.map((h, idx) => (
        <group key={`ledge-${idx}`} position={[0, h, -4.1]}>
          <mesh receiveShadow castShadow>
            <cylinderGeometry args={[63.4, 63.4, 0.65, 48, 1, true, -0.53, 1.06]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 5. Top Roof Crown */}
      <group position={[0, totalHeight + 0.8, -4.1]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[63.6, 63.6, 1.8, 48, 1, true, -0.535, 1.07]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 6. Ground Base Landscaping */}
      <group position={[0, 0.5, 59.5]}>
        {[-22, -14, -7, 0, 7, 14, 22].map((xOffset, idx) => (
          <group key={`shrub-${idx}`} position={[xOffset, 0, -Math.abs(xOffset) * 0.15]}>
            <mesh castShadow position={[0, 0.6, 0]}>
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshStandardMaterial color="#15803d" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 0.8, 6]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// 🏢 ARCHITECTURAL PUNCHED DOUBLE-WINDOW FACADE (Matching Real Campus Photo)
function PunchedWindowsFacade({
  wallLength,
  baysCount = 4,
  floorHeights = [0, 6.8, 13.6, 20.4, 27.2, 34.0],
  axis = 'z',
  insetOffset = 0.32,
}: {
  wallLength: number;
  baysCount?: number;
  floorHeights?: number[];
  axis?: 'x' | 'z';
  insetOffset?: number;
}) {
  const totalHeight = 41.5;
  const baySpacing = wallLength / (baysCount + 1);
  const bayOffsets = Array.from({ length: baysCount }, (_, i) => -wallLength / 2 + (i + 1) * baySpacing);

  return (
    <group>
      {floorHeights.map((h, fIdx) => {
        const yPos = h - totalHeight / 2 + 3.4;
        return bayOffsets.map((bayPos, bIdx) => {
          const p1 = bayPos - 0.62;
          const p2 = bayPos + 0.62;
          const winW = 0.88;
          const winH = 2.2;

          return (
            <group key={`bay-${fIdx}-${bIdx}`}>
              {/* Window Pane 1 */}
              <mesh
                position={
                  axis === 'z'
                    ? [insetOffset, yPos, p1]
                    : [p1, yPos, insetOffset]
                }
              >
                <boxGeometry
                  args={
                    axis === 'z'
                      ? [0.12, winH, winW]
                      : [winW, winH, 0.12]
                  }
                />
                <meshStandardMaterial color="#0b1120" roughness={0.15} metalness={0.7} />
              </mesh>

              {/* Window Pane 2 */}
              <mesh
                position={
                  axis === 'z'
                    ? [insetOffset, yPos, p2]
                    : [p2, yPos, insetOffset]
                }
              >
                <boxGeometry
                  args={
                    axis === 'z'
                      ? [0.12, winH, winW]
                      : [winW, winH, 0.12]
                  }
                />
                <meshStandardMaterial color="#0b1120" roughness={0.15} metalness={0.7} />
              </mesh>

              {/* Architectural Sub-sill Lintel Accent */}
              <mesh
                position={
                  axis === 'z'
                    ? [insetOffset * 1.08, yPos - winH / 2 - 0.08, bayPos]
                    : [bayPos, yPos - winH / 2 - 0.08, insetOffset * 1.08]
                }
              >
                <boxGeometry
                  args={
                    axis === 'z'
                      ? [0.16, 0.08, 2.4]
                      : [2.4, 0.08, 0.16]
                  }
                />
                <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
              </mesh>
            </group>
          );
        });
      })}
    </group>
  );
}

// 🏢 COMPLETE EXTERIOR BUILDING ENVELOPE (All Wings, Connector Walls, Window Grids & Parapets)
function BuildingExteriorWalls({ isCutaway }: { isCutaway: boolean }) {
  if (isCutaway) return null;

  const totalHeight = 41.5;
  const floorHeights = [0, 6.8, 13.6, 20.4, 27.2, 34.0];

  return (
    <group position={[0, 0, 0]}>
      {/* 1. WEST WING OUTER FACADE (x = -42.8, depth = 38.2, covers z from -29.0 to +9.2) */}
      <group position={[-42.8, totalHeight / 2, -9.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, totalHeight, 38.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={38.2} baysCount={4} axis="z" insetOffset={-0.32} />
        {/* Horizontal Concrete Floor Band Demarcations */}
        {floorHeights.map((h, idx) => (
          <mesh key={`ww-band-${idx}`} position={[-0.34, h - totalHeight / 2 + 0.1, 0]}>
            <boxGeometry args={[0.1, 0.25, 38.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        {/* Roof Parapet Cap */}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 39.0]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 2. SOUTH-WEST STEP WALL (x from -42.8 to -32.5 at z = 9.2) */}
      <group position={[-37.65, totalHeight / 2, 9.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10.3, totalHeight, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={10.3} baysCount={2} axis="x" insetOffset={0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`sw-step-band-${idx}`} position={[0, h - totalHeight / 2 + 0.1, 0.34]}>
            <boxGeometry args={[10.5, 0.25, 0.1]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[10.8, 0.8, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 3. SOUTH-WEST FACADE CONNECTOR WALL (from z = 9.2 to z = 44 at x = -32.5, meeting Left Orange Tower) */}
      <group position={[-32.5, totalHeight / 2, 26.6]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, totalHeight, 34.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={34.8} baysCount={4} axis="z" insetOffset={-0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`sw-conn-band-${idx}`} position={[-0.34, h - totalHeight / 2 + 0.1, 0]}>
            <boxGeometry args={[0.1, 0.25, 35.0]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 35.6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 4. EAST WING OUTER FACADE (x = +42.8, depth = 38.2, covers z from -29.0 to +9.2) */}
      <group position={[42.8, totalHeight / 2, -9.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, totalHeight, 38.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={38.2} baysCount={4} axis="z" insetOffset={0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`ew-band-${idx}`} position={[0.34, h - totalHeight / 2 + 0.1, 0]}>
            <boxGeometry args={[0.1, 0.25, 38.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 39.0]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 5. SOUTH-EAST STEP WALL (x from +42.8 to +32.5 at z = 9.2) */}
      <group position={[37.65, totalHeight / 2, 9.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10.3, totalHeight, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={10.3} baysCount={2} axis="x" insetOffset={0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`se-step-band-${idx}`} position={[0, h - totalHeight / 2 + 0.1, 0.34]}>
            <boxGeometry args={[10.5, 0.25, 0.1]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[10.8, 0.8, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 6. SOUTH-EAST FACADE CONNECTOR WALL (from z = 9.2 to z = 44 at x = +32.5, meeting Right Orange Tower) */}
      <group position={[32.5, totalHeight / 2, 26.6]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, totalHeight, 34.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={34.8} baysCount={4} axis="z" insetOffset={0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`se-conn-band-${idx}`} position={[0.34, h - totalHeight / 2 + 0.1, 0]}>
            <boxGeometry args={[0.1, 0.25, 35.0]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 35.6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 7. NORTH-WEST STEP WALL (x from -42.8 to -27 at z = -29.0) */}
      <group position={[-34.9, totalHeight / 2, -29.0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[15.8, totalHeight, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={15.8} baysCount={2} axis="x" insetOffset={-0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`nw-step-band-${idx}`} position={[0, h - totalHeight / 2 + 0.1, -0.34]}>
            <boxGeometry args={[16.0, 0.25, 0.1]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[16.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 8. NORTH-WEST RETURN WALL (from z = -29.0 to z = -48.2 at x = -27) */}
      <group position={[-27, totalHeight / 2, -38.6]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, totalHeight, 19.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={19.2} baysCount={3} axis="z" insetOffset={-0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`nw-ret-band-${idx}`} position={[-0.34, h - totalHeight / 2 + 0.1, 0]}>
            <boxGeometry args={[0.1, 0.25, 19.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 20.0]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 9. NORTH-EAST STEP WALL (x from +42.8 to +27 at z = -29.0) */}
      <group position={[34.9, totalHeight / 2, -29.0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[15.8, totalHeight, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={15.8} baysCount={2} axis="x" insetOffset={-0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`ne-step-band-${idx}`} position={[0, h - totalHeight / 2 + 0.1, -0.34]}>
            <boxGeometry args={[16.0, 0.25, 0.1]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[16.2, 0.8, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 10. NORTH-EAST RETURN WALL (from z = -29.0 to z = -48.2 at x = +27) */}
      <group position={[27, totalHeight / 2, -38.6]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, totalHeight, 19.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={19.2} baysCount={3} axis="z" insetOffset={0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`ne-ret-band-${idx}`} position={[0.34, h - totalHeight / 2 + 0.1, 0]}>
            <boxGeometry args={[0.1, 0.25, 19.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 20.0]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 11. NORTH REAR FACADE (z = -48.2, width = 54, x = 0) */}
      <group position={[0, totalHeight / 2, -48.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[54, totalHeight, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <PunchedWindowsFacade wallLength={54} baysCount={6} axis="x" insetOffset={-0.32} />
        {floorHeights.map((h, idx) => (
          <mesh key={`nw-band-${idx}`} position={[0, h - totalHeight / 2 + 0.1, -0.34]}>
            <boxGeometry args={[54.2, 0.25, 0.1]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, totalHeight / 2 + 0.4, 0]}>
          <boxGeometry args={[54.8, 0.8, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>
    </group>
  );
}

// 3D Floor Level Component with Seamless Continuous Footprint Slabs
function FloorLevel({
  floorNumber,
  isolatedFloor,
  selectedEntity,
  onSelectEntity,
  onHoverEntity,
}: {
  floorNumber: number;
  isolatedFloor: number | null;
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
  onHoverEntity: (entity: EntityItem | null) => void;
}) {
  const { allFloorsRooms } = useRooms();
  const rooms = allFloorsRooms[floorNumber] || [];
  const isVisible = isolatedFloor === null || isolatedFloor === floorNumber;
  const floorY = (floorNumber - 1) * 6.8;

  if (!isVisible) return null;

  return (
    <group position={[0, floorY, 0]}>
      {/* 1. CENTRAL MAIN CORE SLAB (Rows 8 down to 3: x in [-27, +27], z in [-48.2, +26.0]) */}
      <mesh position={[0, -0.18, -11.1]} receiveShadow>
        <boxGeometry args={[54, 0.35, 74.2]} />
        <meshStandardMaterial
          color={isolatedFloor === floorNumber ? '#ffffff' : '#f8fafc'}
          roughness={0.6}
        />
      </mesh>

      {/* 2. WEST WING SLAB (x in [-42.8, -27.0], z in [-29.0, +9.2]) */}
      <mesh position={[-34.9, -0.18, -9.9]} receiveShadow>
        <boxGeometry args={[15.8, 0.35, 38.2]} />
        <meshStandardMaterial
          color={isolatedFloor === floorNumber ? '#ffffff' : '#f8fafc'}
          roughness={0.6}
        />
      </mesh>

      {/* 3. EAST WING SLAB (x in [+27.0, +42.8], z in [-29.0, +9.2]) */}
      <mesh position={[34.9, -0.18, -9.9]} receiveShadow>
        <boxGeometry args={[15.8, 0.35, 38.2]} />
        <meshStandardMaterial
          color={isolatedFloor === floorNumber ? '#ffffff' : '#f8fafc'}
          roughness={0.6}
        />
      </mesh>

      {/* 4. SOUTH PROMENADE / AUDITORIUM BASE SLAB (x in [-32.5, +32.5], z in [+26.0, +50.0]) */}
      <mesh position={[0, -0.18, 38]} receiveShadow>
        <boxGeometry args={[65, 0.35, 24]} />
        <meshStandardMaterial
          color={isolatedFloor === floorNumber ? '#ffffff' : '#f8fafc'}
          roughness={0.6}
        />
      </mesh>
      {/* Corridor Walkway Runners (Proportioned to actual circulation) */}
      <mesh position={[-14.3, 0.02, -5.5]}>
        <boxGeometry args={[3.2, 0.05, 63]} />
        <meshStandardMaterial color="#ede5d6" roughness={0.8} />
      </mesh>
      <mesh position={[14.2, 0.02, -5.5]}>
        <boxGeometry args={[3.2, 0.05, 63]} />
        <meshStandardMaterial color="#ede5d6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, -37]}>
        <boxGeometry args={[31.6, 0.05, 3.0]} />
        <meshStandardMaterial color="#ede5d6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, -19.5]}>
        <boxGeometry args={[82, 0.05, 3.2]} />
        <meshStandardMaterial color="#ede5d6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, -0.5]}>
        <boxGeometry args={[82, 0.05, 3.2]} />
        <meshStandardMaterial color="#ede5d6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, 23.5]}>
        <boxGeometry args={[31.6, 0.05, 3.2]} />
        <meshStandardMaterial color="#ede5d6" roughness={0.8} />
      </mesh>

      {/* Central Atrium Open Lightwell Void & Indoor Planter Garden */}
      <group position={[0, 0.2, -10]}>
        <mesh>
          <boxGeometry args={[18, 0.1, 14]} />
          <meshStandardMaterial
            color="#bae6fd"
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[14, 0.4, 10]} />
          <meshStandardMaterial color="#166534" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.8, -7]}>
          <boxGeometry args={[18, 0.8, 0.2]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.8, 7]}>
          <boxGeometry args={[18, 0.8, 0.2]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
        </mesh>
      </group>


      {/* Individual Extruded Rooms */}
      {rooms.map((room) => {
        if (room.id.endsWith('151') && room.row === 1) return null;
        const isSelected = selectedEntity?.id === room.id;

        return (
          <Room3DBox
            key={room.id}
            room={room}
            floorNumber={floorNumber}
            isSelected={isSelected}
            onSelectEntity={onSelectEntity}
            onHoverEntity={onHoverEntity}
          />
        );
      })}

      {/* Grand Auditorium */}
      <Auditorium3D
        floorNumber={floorNumber}
        isSelected={selectedEntity?.id === `${floorNumber}151`}
        onSelectEntity={onSelectEntity}
        onHoverEntity={onHoverEntity}
      />
    </group>
  );
}

// Continuous Vertical Elevator & Staircase Shafts (Floors 1 to 6)
function ContinuousVerticalShafts({
  selectedEntity,
  onSelectEntity,
  onHoverEntity,
}: {
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
  onHoverEntity: (entity: EntityItem | null) => void;
}) {
  const { cores } = useRooms();
  const totalHeight = 42.0;

  return (
    <group>
      {cores.map((core) => {
        const posX = (core.x + core.w / 2 - 500) / 10;
        const posZ = (core.y + core.h / 2 - 625) / 10;
        const isSelected = selectedEntity?.id === core.id;

        return (
          <group key={core.id} position={[posX, totalHeight / 2 - 0.2, posZ]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectEntity(core);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverEntity(core);
              }}
              onPointerOut={() => onHoverEntity(null)}
              castShadow
            >
              <boxGeometry args={[core.w / 10, totalHeight, core.h / 10]} />
              <meshStandardMaterial
                color={isSelected ? '#f59e0b' : core.type === 'lift' ? '#d97706' : '#0284c7'}
                emissive={core.type === 'lift' ? '#b45309' : '#0369a1'}
                emissiveIntensity={isSelected ? 0.8 : 0.3}
                roughness={0.2}
                transparent
                opacity={0.75}
              />
            </mesh>

            <mesh position={[core.w / 20, 0, core.h / 20]}>
              <boxGeometry args={[0.3, totalHeight, 0.3]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            <mesh position={[-core.w / 20, 0, -core.h / 20]}>
              <boxGeometry args={[0.3, totalHeight, 0.3]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Camera Preset Controller Component
function CameraRig({ cameraPreset }: { cameraPreset: 'iso' | 'top' | 'front' }) {
  const controlsRef = useRef<any>(null);

  React.useEffect(() => {
    if (!controlsRef.current) return;
    if (cameraPreset === 'iso') {
      controlsRef.current.object.position.set(0, 55, 80);
      controlsRef.current.target.set(0, 18, 0);
    } else if (cameraPreset === 'top') {
      controlsRef.current.object.position.set(0, 110, 0.1);
      controlsRef.current.target.set(0, 18, 0);
    } else if (cameraPreset === 'front') {
      controlsRef.current.object.position.set(0, 22, 105);
      controlsRef.current.target.set(0, 20, 0);
    }
    controlsRef.current.update();
  }, [cameraPreset]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={15}
      maxDistance={220}
      maxPolarAngle={Math.PI / 2 - 0.02}
    />
  );
}

export function Building3DScene({
  activeRoute,
  selectedEntity,
  onSelectEntity,
  onCalculateRoute,
  onClearRoute,
}: Building3DSceneProps) {
  const { currentFloor, setCurrentFloor } = useRooms();
  const [isolatedFloor, setIsolatedFloor] = useState<number | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'front'>('iso');
  const [hoveredEntity, setHoveredEntity] = useState<EntityItem | null>(null);
  const [isDirectionsDrawerOpen, setIsDirectionsDrawerOpen] = useState(false);
  const [isCutaway, setIsCutaway] = useState(false);

  const handleFloorSelect = (fl: number | null) => {
    setIsolatedFloor(fl);
    if (fl !== null) {
      setCurrentFloor(fl);
    }
  };

  return (
    <div className="flex-1 w-full h-full relative spaceplanner-grid-bg overflow-hidden flex">
      {/* Top HUD: 3D Floor Isolator & Camera View Angle Presets */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-[#fcfaf6]/95 backdrop-blur-md rounded-2xl p-1.5 border border-[#ded4c0] shadow-md shadow-[#11202f]/10">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1e354d] px-2 border-r border-[#ded4c0]/80">
          <Building2 className="w-3.5 h-3.5 text-[#1e354d]" />
          <span className="font-mono">FLOOR:</span>
        </div>

        <button
          onClick={() => handleFloorSelect(null)}
          className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold transition ${
            isolatedFloor === null
              ? 'bg-[#1e354d] text-white shadow-sm'
              : 'text-[#475569] hover:bg-[#ede5d6] hover:text-[#11202f]'
          }`}
        >
          All 6 Floors
        </button>

        {[1, 2, 3, 4, 5, 6].map((fl) => (
          <button
            key={fl}
            onClick={() => handleFloorSelect(fl)}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition ${
              isolatedFloor === fl
                ? 'bg-[#1e354d] text-white shadow-sm'
                : 'text-[#475569] hover:bg-[#ede5d6] hover:text-[#11202f]'
            }`}
          >
            L{fl}
          </button>
        ))}

        {/* Camera Angles */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#ded4c0]/80">
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              cameraPreset === 'iso' ? 'bg-[#1e354d] text-white' : 'text-[#64748b] hover:bg-[#ede5d6]'
            }`}
            title="Isometric 3D Angle"
          >
            3D Iso
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              cameraPreset === 'top' ? 'bg-[#1e354d] text-white' : 'text-[#64748b] hover:bg-[#ede5d6]'
            }`}
            title="Top-Down CAD View"
          >
            Top-Down
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              cameraPreset === 'front' ? 'bg-[#1e354d] text-white' : 'text-[#64748b] hover:bg-[#ede5d6]'
            }`}
            title="Front Elevation (Real Photo Match)"
          >
            Front Elevation
          </button>
        </div>

        {/* Facade Exterior vs Cutaway Toggle */}
        <div className="pl-2 border-l border-[#ded4c0]/80">
          <button
            onClick={() => setIsCutaway(!isCutaway)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
              !isCutaway
                ? 'bg-amber-600/15 text-amber-900 border border-amber-500/30'
                : 'bg-slate-200 text-slate-700'
            }`}
            title="Toggle Exterior Building Walls vs Interior Cutaway"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{!isCutaway ? 'Building: Exterior' : 'Cutaway'}</span>
          </button>
        </div>
      </div>

      {/* Top Right: Directions / Navigation Quick Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsDirectionsDrawerOpen(!isDirectionsDrawerOpen)}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 transition backdrop-blur-md ${
            isDirectionsDrawerOpen
              ? 'bg-blue-600 text-white shadow-blue-600/30'
              : 'bg-white/95 text-slate-800 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Navigation className="w-4 h-4 text-blue-500" />
          <span>{isDirectionsDrawerOpen ? 'Hide Directions' : 'Navigate in 3D'}</span>
          {activeRoute && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </button>
      </div>

      {/* Floating 3D Hover Tooltip Card */}
      {hoveredEntity && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-2xl p-3.5 shadow-2xl max-w-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-1.5">
            <span className="font-mono text-blue-400 font-bold text-xs">{hoveredEntity.id}</span>
            <span className="px-2 py-0.2 rounded-full bg-blue-600/30 text-blue-300 text-[10px] uppercase font-bold">
              {hoveredEntity.type}
            </span>
          </div>
          <h4 className="font-bold text-sm text-white">{hoveredEntity.name}</h4>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {'capacity' in hoveredEntity && hoveredEntity.capacity && (
              <span>Capacity: {hoveredEntity.capacity} seats • </span>
            )}
            <span>Floor {hoveredEntity.floor || currentFloor}</span>
          </div>
          {hoveredEntity.desc && (
            <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">
              {hoveredEntity.desc}
            </p>
          )}
        </div>
      )}

      {/* Bottom Category Legend */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-[#ded4c0] rounded-2xl p-2.5 shadow-md flex items-center gap-3 text-[11px] font-semibold text-slate-700 hidden lg:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#ea580c]"></span>
          <span>Rotunda Facade</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#1e3a8a]"></span>
          <span>Classrooms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#0284c7]"></span>
          <span>Labs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#6b21a8]"></span>
          <span>Faculty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#d97706]"></span>
          <span>Lifts & Stairs</span>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <Canvas
        camera={{ position: [0, 55, 80], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={1.3} />
        <directionalLight
          position={[45, 85, 45]}
          intensity={1.9}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-35, 45, -35]} intensity={1.1} color="#38bdf8" />
        <pointLight position={[35, 20, 55]} intensity={1.2} color="#f59e0b" />

        <CameraRig cameraPreset={cameraPreset} />

        {/* All Building Floor Levels (Floors 1 to 6) */}
        {[1, 2, 3, 4, 5, 6].map((fl) => (
          <FloorLevel
            key={fl}
            floorNumber={fl}
            isolatedFloor={isolatedFloor}
            selectedEntity={selectedEntity}
            onSelectEntity={onSelectEntity}
            onHoverEntity={setHoveredEntity}
          />
        ))}

        {/* Continuous Vertical Cores (Lifts & Stairs) */}
        <ContinuousVerticalShafts
          selectedEntity={selectedEntity}
          onSelectEntity={onSelectEntity}
          onHoverEntity={setHoveredEntity}
        />

        {/* 🏢 Complete Exterior Building Architecture (Front Rotunda, Side Wings, Connector Walls & Rear Facade) */}
        {isolatedFloor === null && (
          <>
            <FrontBuildingFacade isCutaway={isCutaway} />
            <BuildingExteriorWalls isCutaway={isCutaway} />
          </>
        )}

        {/* 3D Multi-Floor Route & Beacons */}
        {activeRoute && <AnimatedRouteTube route={activeRoute} />}

        {/* Ground Floor Base Grid */}
        <gridHelper args={[200, 40, '#1e354d', '#ded4c0']} position={[0, -0.6, 0]} />
      </Canvas>

      {/* Slide-out Navigation Drawer for 3D Route Planning */}
      {isDirectionsDrawerOpen && onCalculateRoute && (
        <DirectionsDrawer
          isOpen={isDirectionsDrawerOpen}
          selectedEntity={selectedEntity}
          activeRoute={activeRoute}
          onCalculateRoute={onCalculateRoute}
          onClearRoute={onClearRoute || (() => {})}
          onSelectEntity={onSelectEntity}
          inspectorTabActive={false}
          setInspectorTabActive={() => {}}
        />
      )}
    </div>
  );
}

export default Building3DScene;
