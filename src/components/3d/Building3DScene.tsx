import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EntityItem, RouteResult } from '../../types';
import { useRooms } from '../../context/RoomsContext';
import { Layers } from 'lucide-react';
import { FLOORS_META } from '../../data/buildingFloorsData';

interface Building3DSceneProps {
  activeRoute: RouteResult | null;
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
}

// 3D Animated Glowing Route Tube with multi-floor vertical elevator transition
function AnimatedRouteTube({ route }: { route: RouteResult }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    if (!route) return null;
    const points: THREE.Vector3[] = [];

    const floorToHeight = (f: number) => (f - 1) * 6.0 + 0.6;

    if (!route.isMultiFloor) {
      // Single Floor Route
      const seg = route.floorSegments[route.startFloor];
      const pts = seg?.routePoints || route.activeFloorRoutePoints;
      if (!pts || pts.length < 2) return null;

      const y = floorToHeight(route.startFloor);
      pts.forEach((pt) => {
        const x = (pt.x - 500) / 10;
        const z = (pt.y - 625) / 10;
        points.push(new THREE.Vector3(x, y, z));
      });
    } else {
      // Multi-Floor Route: Start Floor -> Shaft Climb -> Target Floor
      const startSeg = route.floorSegments[route.startFloor];
      const targetSeg = route.floorSegments[route.targetFloor];

      if (startSeg && startSeg.routePoints.length > 0) {
        const startY = floorToHeight(route.startFloor);
        startSeg.routePoints.forEach((pt) => {
          const x = (pt.x - 500) / 10;
          const z = (pt.y - 625) / 10;
          points.push(new THREE.Vector3(x, startY, z));
        });
      }

      if (targetSeg && targetSeg.routePoints.length > 0) {
        const targetY = floorToHeight(route.targetFloor);
        targetSeg.routePoints.forEach((pt) => {
          const x = (pt.x - 500) / 10;
          const z = (pt.y - 625) / 10;
          points.push(new THREE.Vector3(x, targetY, z));
        });
      }
    }

    if (points.length < 2) return null;
    return new THREE.CatmullRomCurve3(points);
  }, [route]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = (clock.getElapsedTime() * 2.5) % 1;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.6 + Math.sin(t * Math.PI * 2) * 0.9;
    }
  });

  if (!curve) return null;

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 128, 0.45, 12, false]} />
      <meshStandardMaterial
        color="#2563eb"
        emissive="#38bdf8"
        emissiveIntensity={2.4}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

// 3D Floor Level Component
function FloorLevel({
  floorNumber,
  isolatedFloor,
  selectedEntity,
  onSelectEntity,
}: {
  floorNumber: number;
  isolatedFloor: number | null;
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
}) {
  const { allFloorsRooms } = useRooms();
  const rooms = allFloorsRooms[floorNumber] || [];
  const isVisible = isolatedFloor === null || isolatedFloor === floorNumber;
  const floorY = (floorNumber - 1) * 6.0;

  if (!isVisible) return null;

  return (
    <group position={[0, floorY, 0]}>
      {/* Structural Floor Slab */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[100, 0.4, 125]} />
        <meshStandardMaterial
          color={isolatedFloor === floorNumber ? '#f1f5f9' : '#e2e8f0'}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={isolatedFloor === null ? 0.88 : 1.0}
        />
      </mesh>

      {/* Level Badge Text on West Edge */}
      <Text
        position={[-52, 1.2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={1.8}
        color="#2563eb"
        anchorX="center"
        anchorY="middle"
      >
        {`LEVEL ${floorNumber} • ${FLOORS_META[floorNumber]?.department || ''}`}
      </Text>

      {/* Extruded Rooms */}
      {rooms.map((room) => {
        if (room.id.endsWith('151') && room.row === 1) return null; // Front hall handled below
        const posX = (room.x + room.w / 2 - 500) / 10;
        const posZ = (room.y + room.h / 2 - 625) / 10;
        const width = room.w / 10;
        const depth = room.h / 10;
        const isSelected = selectedEntity?.id === room.id;

        return (
          <group key={room.id} position={[posX, 1.2, posZ]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectEntity(room);
              }}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width, 2.4, depth]} />
              <meshStandardMaterial
                color={
                  isSelected
                    ? '#f59e0b'
                    : room.type === 'lab'
                    ? '#0284c7'
                    : '#1d4ed8'
                }
                emissive={isSelected ? '#d97706' : '#1e3a8a'}
                emissiveIntensity={isSelected ? 0.7 : 0.15}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>
            <Text
              position={[0, 1.3, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.9}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {room.id}
            </Text>
          </group>
        );
      })}

      {/* 3D Front Amphitheater / Auditorium */}
      <group position={[0, 1.0, 42.5]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            const audi = rooms.find((r) => r.id.endsWith('151') && r.row === 1);
            if (audi) onSelectEntity(audi);
          }}
          castShadow
        >
          <cylinderGeometry args={[22, 28, 2.0, 32, 1, false, 0, Math.PI]} />
          <meshStandardMaterial
            color={selectedEntity?.id.endsWith('151') ? '#f59e0b' : '#1e3a8a'}
            roughness={0.4}
          />
        </mesh>
        <Text
          position={[0, 1.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${floorNumber}151 AUDITORIUM`}
        </Text>
      </group>
    </group>
  );
}

// Continuous Vertical Elevator Shafts (Floors 1 to 6)
function ContinuousVerticalShafts({
  selectedEntity,
  onSelectEntity,
}: {
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
}) {
  const { cores } = useRooms();
  const totalHeight = 35.0;

  return (
    <group>
      {cores.map((core) => {
        const posX = (core.x + core.w / 10 - 500) / 10;
        const posZ = (core.y + core.h / 10 - 625) / 10;
        const isSelected = selectedEntity?.id === core.id;

        return (
          <mesh
            key={core.id}
            position={[posX, totalHeight / 2 - 0.5, posZ]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEntity(core);
            }}
            castShadow
          >
            <boxGeometry args={[core.w / 10, totalHeight, core.h / 10]} />
            <meshStandardMaterial
              color={
                isSelected
                  ? '#f59e0b'
                  : core.type === 'lift'
                  ? '#d97706'
                  : '#0284c7'
              }
              emissive={core.type === 'lift' ? '#b45309' : '#0369a1'}
              emissiveIntensity={0.3}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function Building3DScene({
  activeRoute,
  selectedEntity,
  onSelectEntity,
}: Building3DSceneProps) {
  const [isolatedFloor, setIsolatedFloor] = useState<number | null>(null);

  return (
    <div className="flex-1 w-full h-full relative spaceplanner-grid-bg overflow-hidden">
      {/* 3D Floor Isolator Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-[#fcfaf6]/95 backdrop-blur-md rounded-2xl p-1.5 border border-[#ded4c0] shadow-md shadow-[#11202f]/5">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#1e354d] px-2">
          <Layers className="w-3.5 h-3.5 text-[#1e354d]" />
          <span className="hidden sm:inline font-mono">3D VIEW:</span>
        </div>
        <button
          onClick={() => setIsolatedFloor(null)}
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
            onClick={() => setIsolatedFloor(fl)}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition ${
              isolatedFloor === fl
                ? 'bg-[#1e354d] text-white shadow-sm'
                : 'text-[#475569] hover:bg-[#ede5d6] hover:text-[#11202f]'
            }`}
          >
            F{fl}
          </button>
        ))}
      </div>

      {/* R3F 3D Canvas */}
      <Canvas
        camera={{ position: [0, 50, 75], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[40, 70, 30]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-30, 40, -30]} intensity={1.0} color="#38bdf8" />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={15}
          maxDistance={180}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />

        {/* All 6 Floors (Floors 1 to 6) */}
        {[1, 2, 3, 4, 5, 6].map((fl) => (
          <FloorLevel
            key={fl}
            floorNumber={fl}
            isolatedFloor={isolatedFloor}
            selectedEntity={selectedEntity}
            onSelectEntity={onSelectEntity}
          />
        ))}

        {/* Continuous Vertical Cores */}
        <ContinuousVerticalShafts
          selectedEntity={selectedEntity}
          onSelectEntity={onSelectEntity}
        />

        {/* 3D Multi-Floor Route Spline */}
        {activeRoute && <AnimatedRouteTube route={activeRoute} />}

        {/* Ground Base Grid */}
        <gridHelper args={[180, 40, '#1e354d', '#ded4c0']} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}
