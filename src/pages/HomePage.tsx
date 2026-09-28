import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { BlueprintCanvas } from '../components/2d/BlueprintCanvas';
import { Building3DScene } from '../components/3d/Building3DScene';
import { EntityItem, RouteResult, ViewMode } from '../types';
import { calculateMultiFloorRoute } from '../lib/pathfinding';
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

    let sFloor = 6;
    if (sFloorParam && !isNaN(parseInt(sFloorParam, 10))) {
      sFloor = parseInt(sFloorParam, 10);
    } else if (/^[1-6]\d{3}$/.test(startParam)) {
      sFloor = parseInt(startParam[0], 10);
    }

    let tFloor = 6;
    if (tFloorParam && !isNaN(parseInt(tFloorParam, 10))) {
      tFloor = parseInt(tFloorParam, 10);
    } else if (/^[1-6]\d{3}$/.test(targetParam)) {
      tFloor = parseInt(targetParam[0], 10);
    }

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
        {/* TOP LEFT BUTTON: PLAN NEW ROUTE */}
        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-4 z-30">
          <Link
            to="/route"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/90 text-slate-200 hover:text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-md transition active:scale-95"
            title="Choose new Source and Destination"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>New Route</span>
          </Link>
        </div>

        {/* MULTI-FLOOR TRANSITION BANNER (TOP CENTER) */}
        {activeRoute && activeRoute.isMultiFloor && (
          <div className="absolute top-2.5 sm:top-3.5 left-1/2 transform -translate-x-1/2 z-30 max-w-[92vw] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-2xl shadow-black/60 text-xs whitespace-nowrap">
              <button
                onClick={() => setCurrentFloor(activeRoute.startFloor)}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] sm:text-xs font-bold transition flex items-center gap-1 ${
                  currentFloor === activeRoute.startFloor
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="View Starting Floor"
              >
                <span>Floor {activeRoute.startFloor}</span>
                <span className="opacity-80">({activeRoute.startEntity.name || activeRoute.startEntity.id})</span>
              </button>

              <span className="text-amber-400 font-bold font-mono">➔</span>

              <div className="px-2 py-0.5 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl font-mono text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0">
                <span>🛗 Southwest Lift</span>
              </div>

              <span className="text-amber-400 font-bold font-mono">➔</span>

              <button
                onClick={() => setCurrentFloor(activeRoute.targetFloor)}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] sm:text-xs font-bold transition flex items-center gap-1 ${
                  currentFloor === activeRoute.targetFloor
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="View Destination Floor"
              >
                <span>Floor {activeRoute.targetFloor}</span>
                <span className="opacity-80">({activeRoute.targetEntity.name || activeRoute.targetEntity.id})</span>
              </button>
            </div>
          </div>
        )}

        {/* SINGLE FLOOR ROUTE BANNER (TOP CENTER) */}
        {activeRoute && !activeRoute.isMultiFloor && (
          <div className="absolute top-2.5 sm:top-3.5 left-1/2 transform -translate-x-1/2 z-30 max-w-[92vw] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3.5 py-1.5 rounded-2xl shadow-xl text-xs whitespace-nowrap">
              <span className="font-mono text-emerald-400 font-bold">Floor {activeRoute.targetFloor}:</span>
              <span className="text-slate-300 font-medium">{activeRoute.startEntity.name || activeRoute.startEntity.id}</span>
              <span className="text-amber-400 font-bold font-mono">➔</span>
              <span className="text-amber-300 font-bold">{activeRoute.targetEntity.name || activeRoute.targetEntity.id}</span>
              <span className="text-[10px] font-mono text-slate-400">({activeRoute.estimatedTimeText || `${activeRoute.steps?.length || 3} steps`})</span>
            </div>
          </div>
        )}

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
