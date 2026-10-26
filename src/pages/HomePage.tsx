import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { BlueprintCanvas } from '../components/2d/BlueprintCanvas';
import { Building3DScene } from '../components/3d/Building3DScene';
import { EntityItem, RouteResult, ViewMode } from '../types';
import { calculateMultiFloorRoute, resolveRoomFloor } from '../lib/pathfinding';
import { useRooms } from '../context/RoomsContext';
import {
  ArrowLeft,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  RotateCcw,
} from 'lucide-react';

export function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    const sFloor = resolveRoomFloor(startId, startFloorArg ?? currentFloor, allBuildingDestinations);
    const tFloor = resolveRoomFloor(endId, targetFloorArg ?? sFloor, allBuildingDestinations);

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
      if (res.targetFloor !== currentFloor && !res.isMultiFloor) {
        setCurrentFloor(res.targetFloor);
      }
    }
  };

  // Handle entity selection (canvas click or search pick)
  const handleSelectEntity = (entity: EntityItem) => {
    setSelectedEntity(entity);
    const entityFloor = resolveRoomFloor(entity.id, entity.floor ?? currentFloor, allBuildingDestinations);
    if (entityFloor !== currentFloor) {
      setCurrentFloor(entityFloor);
    }
    handleCalculateRoute('lift_sw', entity.id, entityFloor, entityFloor);
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setSelectedEntity(null);
  };

  // Compute route from URL parameters (start, target, sFloor, tFloor, or room, floor)
  useEffect(() => {
    const startParam = searchParams.get('start') || 'lift_sw';
    const targetParam = searchParams.get('target') || searchParams.get('room') || '6853';
    const sFloorParam = searchParams.get('sFloor');
    const tFloorParam = searchParams.get('tFloor') || searchParams.get('floor');

    const sFloor = resolveRoomFloor(
      startParam,
      sFloorParam ? parseInt(sFloorParam, 10) : undefined,
      allBuildingDestinations
    );
    const tFloor = resolveRoomFloor(
      targetParam,
      tFloorParam ? parseInt(tFloorParam, 10) : sFloor,
      allBuildingDestinations
    );

    // Set initial active floor to target floor
    setCurrentFloor(tFloor);

    const res = calculateMultiFloorRoute(
      startParam,
      targetParam,
      sFloor,
      tFloor,
      allFloorsRooms,
      allBuildingDestinations
    );

    if (res) {
      setActiveRoute(res);
      setSelectedEntity(res.targetEntity);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* TOP FLOATING CONTROLS: Route Button & Status Banner */}
        <div className="absolute top-2 sm:top-3.5 inset-x-2 sm:inset-x-4 z-30 flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Plan New Route Button */}
          <div className="pointer-events-auto shrink-0">
            <Link
              to="/route"
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900/95 hover:bg-slate-800 border border-slate-700/90 text-slate-200 hover:text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-md transition active:scale-95"
              title="Choose new Source and Destination"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">New Route</span>
              <span className="sm:hidden">Route</span>
            </Link>
          </div>

          {/* MULTI-FLOOR TRANSITION BANNER */}
          {activeRoute && activeRoute.isMultiFloor && (() => {
            const transitionStep = activeRoute.steps?.find((s) => s.isFloorChange);
            const rawTitle = transitionStep?.title?.replace(/^Take\s+/i, '') || 'Mid-West Lift';
            const coreLabel = rawTitle.replace(/\s+(Up|Down)\s+to\s+Floor\s+\d+/i, '');

            return (
              <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/60 text-xs shrink-0 max-w-[calc(100vw-82px)] sm:max-w-none overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setCurrentFloor(activeRoute.startFloor)}
                  className={`px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-mono text-[10.5px] sm:text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                    currentFloor === activeRoute.startFloor
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View Starting Floor"
                >
                  <span className="sm:hidden">L0{activeRoute.startFloor}</span>
                  <span className="hidden sm:inline">Floor {activeRoute.startFloor}</span>
                  <span className="opacity-80 max-w-[100px] truncate hidden md:inline">
                    ({activeRoute.startEntity.name || activeRoute.startEntity.id})
                  </span>
                </button>

                <span className="text-amber-400 font-bold font-mono text-[11px] shrink-0">➔</span>

                <div className="px-1.5 sm:px-2 py-0.5 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-lg sm:rounded-xl font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0">
                  <span className="sm:hidden">🛗 {coreLabel.replace('South-West', 'SW').replace('South-East', 'SE').replace('Mid-West', 'MW').replace('Mid-East', 'ME')}</span>
                  <span className="hidden sm:inline">🛗 {coreLabel}</span>
                </div>

                <span className="text-amber-400 font-bold font-mono text-[11px] shrink-0">➔</span>

                <button
                  type="button"
                  onClick={() => setCurrentFloor(activeRoute.targetFloor)}
                  className={`px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-mono text-[10.5px] sm:text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                    currentFloor === activeRoute.targetFloor
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="View Destination Floor"
                >
                  <span className="sm:hidden">L0{activeRoute.targetFloor}</span>
                  <span className="hidden sm:inline">Floor {activeRoute.targetFloor}</span>
                  <span className="opacity-80 max-w-[100px] truncate hidden md:inline">
                    ({activeRoute.targetEntity.name || activeRoute.targetEntity.id})
                  </span>
                </button>
              </div>
            );
          })()}

          {/* SINGLE FLOOR ROUTE BANNER */}
          {activeRoute && !activeRoute.isMultiFloor && (
            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xl text-xs whitespace-nowrap shrink-0 max-w-[calc(100vw-82px)] sm:max-w-none overflow-x-auto no-scrollbar">
              <span className="font-mono text-emerald-400 font-bold text-[11px] sm:text-xs">L0{activeRoute.targetFloor}:</span>
              <span className="text-slate-300 font-medium truncate max-w-[70px] sm:max-w-none">{activeRoute.startEntity.name || activeRoute.startEntity.id}</span>
              <span className="text-amber-400 font-bold font-mono text-[11px]">➔</span>
              <span className="text-amber-300 font-bold truncate max-w-[80px] sm:max-w-none">{activeRoute.targetEntity.name || activeRoute.targetEntity.id}</span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">({activeRoute.estimatedTimeText || `${activeRoute.steps?.length || 3} steps`})</span>
            </div>
          )}
        </div>

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
