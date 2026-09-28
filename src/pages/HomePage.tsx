import { useState, useEffect } from 'react';
import { Header } from '../components/ui/Header';
import { BlueprintCanvas } from '../components/2d/BlueprintCanvas';
import { Building3DScene } from '../components/3d/Building3DScene';
import { EntityItem, RouteResult, ViewMode } from '../types';
import { calculateMultiFloorRoute } from '../lib/pathfinding';
import { useRooms } from '../context/RoomsContext';

export function HomePage() {
  const {
    allBuildingDestinations,
    rooms,
    allFloorsRooms,
    currentFloor,
    setCurrentFloor,
  } = useRooms();

  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [selectedEntity, setSelectedEntity] = useState<EntityItem | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);

  // Handle multi-floor route calculation
  const handleCalculateRoute = (
    startId: string,
    endId: string,
    startFloorArg?: number,
    targetFloorArg?: number
  ) => {
    let sFloor = startFloorArg ?? currentFloor;
    let tFloor = targetFloorArg ?? currentFloor;

    if (/^[1-6]\d{3}$/.test(startId)) {
      sFloor = parseInt(startId[0], 10);
    }
    if (/^[1-6]\d{3}$/.test(endId)) {
      tFloor = parseInt(endId[0], 10);
    }

    const res = calculateMultiFloorRoute(
      startId,
      endId,
      sFloor,
      tFloor,
      allFloorsRooms,
      allBuildingDestinations
    );

    if (res) {
      setActiveRoute(res);
      setSelectedEntity(res.targetEntity);
    }
  };

  // Handle entity selection (canvas click or search pick)
  const handleSelectEntity = (entity: EntityItem) => {
    setSelectedEntity(entity);
    const entityFloor = entity.floor || (/^[1-6]\d{3}$/.test(entity.id) ? parseInt(entity.id[0], 10) : currentFloor);
    if (entityFloor !== currentFloor) {
      setCurrentFloor(entityFloor);
    }
    // Calculate route to selected room
    handleCalculateRoute('lift_sw', entity.id, entityFloor, entityFloor);
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setSelectedEntity(null);
  };

  // Initial demo route from SW Lift to default studio/room on mount
  useEffect(() => {
    const defaultTarget = rooms.find((r) => r.id === '6853') || rooms[0];
    if (defaultTarget) {
      setSelectedEntity(defaultTarget);
      const res = calculateMultiFloorRoute(
        'lift_sw',
        defaultTarget.id,
        currentFloor,
        defaultTarget.floor || currentFloor,
        allFloorsRooms,
        allBuildingDestinations
      );
      if (res) setActiveRoute(res);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Viewport: 2D Canvas or 3D Scene */}
        {viewMode === '2d' ? (
          <BlueprintCanvas
            activeRoute={activeRoute}
            selectedEntity={selectedEntity}
            onSelectEntity={handleSelectEntity}
            onCalculateRoute={handleCalculateRoute}
            onClearRoute={handleClearRoute}
          />
        ) : (
          <Building3DScene
            activeRoute={activeRoute}
            selectedEntity={selectedEntity}
            onSelectEntity={handleSelectEntity}
            onCalculateRoute={handleCalculateRoute}
            onClearRoute={handleClearRoute}
          />
        )}
      </div>
    </div>
  );
}
export default HomePage;
