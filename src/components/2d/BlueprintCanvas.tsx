import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  Home,
  Building,
  Send,
  MapPin,
  Flag,
  ArrowUp,
  ArrowDown,
  ArrowRightCircle,
  CornerUpRight,
  CornerUpLeft,
  ArrowUpDown,
  CheckCircle2,
  X,
  Navigation,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import {
  EntityItem,
  RouteResult,
} from '../../types';
import { useRooms } from '../../context/RoomsContext';

interface BlueprintCanvasProps {
  activeRoute: RouteResult | null;
  selectedEntity: EntityItem | null;
  onSelectEntity: (entity: EntityItem) => void;
  onCalculateRoute?: (startId: string, endId: string, startFloorArg?: number, targetFloorArg?: number) => void;
  onClearRoute: () => void;
  onOpenInspector?: () => void;
  isInteractiveClickToAdd?: boolean;
  onCanvasClickCoordinates?: (coords: { x: number; y: number; row: number; col: number }) => void;
}

interface SearchableItem {
  id: string;
  name: string;
  floor: number;
  type: string;
}

export function BlueprintCanvas({
  activeRoute,
  selectedEntity,
  onSelectEntity,
  onCalculateRoute,
  onClearRoute,
  isInteractiveClickToAdd = false,
  onCanvasClickCoordinates,
}: BlueprintCanvasProps) {
  const { rooms, cores, currentFloor, setCurrentFloor, allFloorsRooms } = useRooms();
  const [hoveredEntity, setHoveredEntity] = useState<EntityItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDirectionsExpanded, setIsDirectionsExpanded] = useState(true);

  // Bottom Demo Card Local Selector & Type-Ahead States
  const [demoStartId, setDemoStartId] = useState<string>(`${currentFloor}151`);
  const [demoTargetId, setDemoTargetId] = useState<string>(`${currentFloor}683`);

  const [startInputText, setStartInputText] = useState<string>(`Room ${currentFloor}151 (Auditorium)`);
  const [destInputText, setDestInputText] = useState<string>(`Room ${currentFloor}683`);

  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [isDestOpen, setIsDestOpen] = useState<boolean>(false);

  const startContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Build searchable items list across all 6 floors and special landmarks
  const allSearchableItems = useMemo<SearchableItem[]>(() => {
    const list: SearchableItem[] = [
      { id: `${currentFloor}151`, name: 'Auditorium', floor: currentFloor, type: 'Auditorium' },
      { id: 'lift_sw', name: 'South-West Lift (All Floors)', floor: currentFloor, type: 'Vertical' },
      { id: 'lift_se', name: 'South-East Lift (All Floors)', floor: currentFloor, type: 'Vertical' },
      { id: 'lift_mid_w', name: 'Mid-West Lift (All Floors)', floor: currentFloor, type: 'Vertical' },
      { id: 'lift_mid_e', name: 'Mid-East Lift (All Floors)', floor: currentFloor, type: 'Vertical' },
      { id: 'stair_sw', name: 'South-West Staircase', floor: currentFloor, type: 'Vertical' },
      { id: 'stair_se', name: 'South-East Staircase', floor: currentFloor, type: 'Vertical' },
      { id: 'stairs_nw', name: 'North-West Stairs', floor: currentFloor, type: 'Vertical' },
      { id: 'stairs_ne', name: 'North-East Stairs', floor: currentFloor, type: 'Vertical' },
    ];

    [1, 2, 3, 4, 5, 6].forEach((fl) => {
      const flRooms = allFloorsRooms[fl] || [];
      flRooms.forEach((r) => {
        list.push({
          id: r.id,
          name: r.name,
          floor: fl,
          type: r.type,
        });
      });
    });

    return list;
  }, [allFloorsRooms, currentFloor]);

  // Sync initial labels when current floor or selected entity changes
  useEffect(() => {
    if (selectedEntity) {
      setDemoTargetId(selectedEntity.id);
      setDestInputText(selectedEntity.name ? `Room ${selectedEntity.id} (${selectedEntity.name})` : `Room ${selectedEntity.id}`);
    }
  }, [selectedEntity]);

  // Filtered suggestions for Start
  const startSuggestions = useMemo(() => {
    const q = startInputText.trim().toLowerCase();
    if (!q) return allSearchableItems.slice(0, 8);
    return allSearchableItems
      .filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          `level ${item.floor}`.includes(q)
      )
      .slice(0, 8);
  }, [allSearchableItems, startInputText]);

  // Filtered suggestions for Destination
  const destSuggestions = useMemo(() => {
    const q = destInputText.trim().toLowerCase();
    if (!q) return allSearchableItems.slice(0, 8);
    return allSearchableItems
      .filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          `level ${item.floor}`.includes(q)
      )
      .slice(0, 8);
  }, [allSearchableItems, destInputText]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startContainerRef.current && !startContainerRef.current.contains(e.target as Node)) {
        setIsStartOpen(false);
      }
      if (destContainerRef.current && !destContainerRef.current.contains(e.target as Node)) {
        setIsDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStartItem = (item: SearchableItem) => {
    setDemoStartId(item.id);
    setStartInputText(item.name ? `Room ${item.id} (${item.name})` : `Room ${item.id}`);
    setIsStartOpen(false);
  };

  const handleSelectDestItem = (item: SearchableItem) => {
    setDemoTargetId(item.id);
    setDestInputText(item.name ? `Room ${item.id} (${item.name})` : `Room ${item.id}`);
    setIsDestOpen(false);
    // If room is on another floor, switch floor view
    if (item.floor && item.floor !== currentFloor) {
      setCurrentFloor(item.floor);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredEntity) {
      setTooltipPos({ x: e.clientX + 16, y: e.clientY + 16 });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isInteractiveClickToAdd && onCanvasClickCoordinates && svgRef.current) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
      const clickX = svgP.x;
      const clickY = svgP.y;

      let calcRow = 4;
      if (clickY > 900) calcRow = 1;
      else if (clickY > 750) calcRow = 3;
      else if (clickY > 620) calcRow = 4;
      else if (clickY > 500) calcRow = 5;
      else if (clickY > 380) calcRow = 6;
      else if (clickY > 260) calcRow = 7;
      else calcRow = 8;

      let calcCol = 5;
      if (clickX < 280) calcCol = 1;
      else if (clickX < 370) calcCol = 3;
      else if (clickX < 630) calcCol = 5;
      else if (clickX < 730) calcCol = 7;
      else calcCol = 8;

      onCanvasClickCoordinates({
        x: Math.round(clickX),
        y: Math.round(clickY),
        row: calcRow,
        col: calcCol,
      });
    }
  };

  // Active route points for current displayed floor
  const currentFloorSegment = activeRoute?.floorSegments?.[currentFloor];
  const activeFloorPoints =
    currentFloorSegment?.routePoints ||
    (activeRoute && !activeRoute.isMultiFloor && activeRoute.startFloor === currentFloor
      ? activeRoute.activeFloorRoutePoints
      : []);

  const routePathD = React.useMemo(() => {
    if (!activeFloorPoints || activeFloorPoints.length === 0) return '';
    let d = `M ${activeFloorPoints[0].x},${activeFloorPoints[0].y}`;
    for (let i = 1; i < activeFloorPoints.length; i++) {
      d += ` L ${activeFloorPoints[i].x},${activeFloorPoints[i].y}`;
    }
    return d;
  }, [activeFloorPoints]);

  const startPoint = activeFloorPoints && activeFloorPoints.length > 0 ? activeFloorPoints[0] : null;
  const endPoint = activeFloorPoints && activeFloorPoints.length > 0 ? activeFloorPoints[activeFloorPoints.length - 1] : null;

  const handleTriggerRoute = () => {
    let sFloor = currentFloor;
    let tFloor = currentFloor;

    if (/^[1-6]\d{3}$/.test(demoStartId)) {
      sFloor = parseInt(demoStartId[0], 10);
    }
    if (/^[1-6]\d{3}$/.test(demoTargetId)) {
      tFloor = parseInt(demoTargetId[0], 10);
    }

    if (onCalculateRoute) {
      onCalculateRoute(demoStartId, demoTargetId, sFloor, tFloor);
    } else {
      const allFlat = Object.values(allFloorsRooms).flat();
      const target = allFlat.find((r) => r.id === demoTargetId) || { id: demoTargetId, name: `Room ${demoTargetId}` };
      onSelectEntity(target as EntityItem);
    }
    setIsDirectionsExpanded(true);
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'map-pin':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'arrow-up':
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
      case 'arrow-down':
        return <ArrowDown className="w-4 h-4 text-blue-600" />;
      case 'corner-up-right':
        return <CornerUpRight className="w-4 h-4 text-blue-600" />;
      case 'corner-up-left':
        return <CornerUpLeft className="w-4 h-4 text-blue-600" />;
      case 'check-circle-2':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'layers':
        return <ArrowUpDown className="w-4 h-4 text-amber-500 animate-bounce" />;
      case 'arrow-right-circle':
        return <ArrowRightCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Navigation className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <main className="flex-1 relative flex flex-col h-full select-none overflow-hidden spaceplanner-grid-bg">
      {/* 1. BOTTOM FLOATING CARD: ULTRA-FAST SEARCHABLE INPUTS + AUTO-SUGGESTIONS + DIRECTIONS */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-6 sm:right-6 z-30 pointer-events-auto max-w-3xl mx-auto flex flex-col bg-[#fcfaf6]/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-[#11202f]/15 border border-[#ded4c0] transition-all">
        {/* Active Route Directions Header & Scrollable Steps */}
        {activeRoute && (
          <div className="border-b border-[#ded4c0] p-2.5 sm:p-3.5 bg-[#faf8f3]/95">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-[#1e354d] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-serif font-bold text-[#11202f] text-xs sm:text-sm truncate">
                      To {activeRoute.targetEntity.name || `Room ${activeRoute.targetEntity.id}`}
                    </h4>
                    {activeRoute.isMultiFloor && (
                      <span className="text-[9.5px] font-mono font-bold bg-[#dbe4eb] text-[#1e354d] px-1.5 py-0.2 rounded-full border border-[#cad7e2] shrink-0">
                        L0{activeRoute.startFloor} ➔ L0{activeRoute.targetFloor}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#64748b] mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-[#1e354d]">
                      <Clock className="w-3 h-3" />
                      {activeRoute.estimatedTimeText}
                    </span>
                    <span>•</span>
                    <span>{activeRoute.steps?.length || 0} steps</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsDirectionsExpanded((prev) => !prev)}
                  className="px-2 py-1 rounded-lg text-[#64748b] hover:bg-[#eae3d2] transition text-xs font-semibold flex items-center gap-1"
                  title="Toggle directions view"
                >
                  <span className="text-[11px] font-bold">{isDirectionsExpanded ? 'Hide' : 'Show'}</span>
                  {isDirectionsExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={onClearRoute}
                  className="p-1 rounded-lg text-[#64748b] hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Clear route"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multi-Floor Dedicated Leg Buttons */}
            {activeRoute.isMultiFloor && (
              <div className="mt-2 pt-2 border-t border-[#ded4c0]/80">
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Leg 1 Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentFloor(activeRoute.startFloor)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-between border ${
                      currentFloor === activeRoute.startFloor
                        ? 'bg-[#1e354d] text-white border-[#1e354d] shadow-sm'
                        : 'bg-white hover:bg-[#ede5d6] text-[#1e354d] border-[#ded4c0]'
                    }`}
                  >
                    <span className="truncate">1. Floor {activeRoute.startFloor} ➔ Lift</span>
                    <span className="font-mono text-[10px] ml-1 shrink-0">L0{activeRoute.startFloor}</span>
                  </button>

                  {/* Leg 2 Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentFloor(activeRoute.targetFloor)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-between border ${
                      currentFloor === activeRoute.targetFloor
                        ? 'bg-[#1e354d] text-white border-[#1e354d] shadow-sm'
                        : 'bg-white hover:bg-[#ede5d6] text-[#1e354d] border-[#ded4c0]'
                    }`}
                  >
                    <span className="truncate">2. Lift ➔ Floor {activeRoute.targetFloor}</span>
                    <span className="font-mono text-[10px] ml-1 shrink-0">L0{activeRoute.targetFloor}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Step-by-Step Instructions */}
            {isDirectionsExpanded && activeRoute.steps && activeRoute.steps.length > 0 && (
              <div className="mt-2 max-h-28 sm:max-h-36 overflow-y-auto space-y-1 pr-1 text-xs no-scrollbar">
                {activeRoute.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 p-1.5 rounded-xl border transition ${
                      step.isFloorChange
                        ? 'bg-[#fffbeb] border-amber-200 text-amber-950 font-medium'
                        : 'bg-white border-[#ded4c0] shadow-xs'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        step.isFloorChange
                          ? 'bg-amber-100 border-amber-300'
                          : 'bg-[#faf8f3] border-[#ded4c0]'
                      }`}
                    >
                      {getStepIcon(step.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#11202f] text-[11px] leading-tight">
                          {step.title}
                        </p>
                        {step.floor && (
                          <button
                            onClick={() => setCurrentFloor(step.floor!)}
                            className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#dbe4eb] text-[#1e354d] border border-[#cad7e2] ml-1 shrink-0"
                          >
                            L0{step.floor}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-[#64748b] mt-0.2 line-clamp-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fast Class Number Input (No Suggestions Popup, Just Room Number) */}
        <div className="p-2 sm:p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTriggerRoute();
            }}
            className="flex items-center gap-2"
          >
            {/* Destination Class Number Box */}
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-white border border-[#ded4c0] focus-within:border-[#1e354d] focus-within:ring-2 focus-within:ring-[#1e354d]/10 rounded-xl px-2.5 sm:px-3 py-2 transition shadow-sm">
                <Flag className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    autoComplete="off"
                    value={destInputText}
                    onChange={(e) => {
                      setDestInputText(e.target.value);
                      setDemoTargetId(e.target.value);
                    }}
                    placeholder="Type class number (e.g. 6853, 6411, 4151...)"
                    className="w-full bg-transparent text-xs sm:text-sm font-mono font-bold text-[#11202f] focus:outline-none placeholder-[#8a99a8] truncate"
                  />
                </div>
                {destInputText && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestInputText('');
                      setDemoTargetId('');
                    }}
                    className="p-1 text-[#8a99a8] hover:text-[#11202f]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Direct Route Go Button */}
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1e354d] hover:bg-[#162a3f] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#1e354d]/20 shrink-0 transition"
              title="Calculate route"
            >
              <Send className="w-3.5 h-3.5 text-[#ded4c0]" />
              <span className="hidden sm:inline">Navigate</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. MAIN SVG BLUEPRINT CANVAS */}
      <div
        onMouseMove={handleMouseMove}
        className="flex-1 min-h-0 w-full relative overflow-hidden flex items-center justify-center p-2 sm:p-4 pb-24 sm:pb-28"
      >
        {/* Floating Multi-Floor Quick-Switch Bar on Canvas */}
        {activeRoute && activeRoute.isMultiFloor && (
          <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-20 bg-[#fcfaf6]/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-xl shadow-[#11202f]/10 border border-[#ded4c0] flex items-center gap-2 text-xs animate-fadeIn max-w-[95vw] overflow-x-auto">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider hidden md:inline">
              Multi-Floor Path:
            </span>
            <button
              onClick={() => setCurrentFloor(activeRoute.startFloor)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                currentFloor === activeRoute.startFloor
                  ? 'bg-[#1e354d] text-white shadow-sm scale-105'
                  : 'bg-white text-[#1e354d] border border-[#ded4c0] hover:bg-[#ede5d6]'
              }`}
            >
              <span>1. Floor {activeRoute.startFloor} ➔ Lift/Stairs</span>
            </button>
            <span className="text-[#8a99a8] font-bold">➔</span>
            <button
              onClick={() => setCurrentFloor(activeRoute.targetFloor)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                currentFloor === activeRoute.targetFloor
                  ? 'bg-[#1e354d] text-white shadow-sm scale-105'
                  : 'bg-white text-[#1e354d] border border-[#ded4c0] hover:bg-[#ede5d6]'
              }`}
            >
              <span>2. Lift/Stairs ➔ Floor {activeRoute.targetFloor}</span>
            </button>
          </div>
        )}

        <svg
          ref={svgRef}
          id="blueprintSvg"
          onClick={handleCanvasClick}
          className="w-full h-full max-h-full max-w-full select-none"
          viewBox="30 40 940 1230"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Tree Icon Marker Component */}
            <g id="treeSymbol">
              <circle cx="0" cy="-6" r="8" fill="#86efac" />
              <circle cx="-4" cy="-4" r="6" fill="#4ade80" />
              <circle cx="4" cy="-4" r="6" fill="#22c55e" />
              <circle cx="0" cy="-8" r="6" fill="#16a34a" />
              <rect x="-1" y="-1" width="2" height="6" fill="#78350f" rx="1" />
            </g>

            {/* Restroom Figure Symbols */}
            <g id="menSymbol">
              <circle cx="0" cy="-6" r="2.2" fill="#16a34a" />
              <path d="M -3,-3 L 3,-3 L 2,4 L -2,4 Z" fill="#16a34a" />
            </g>
            <g id="womenSymbol">
              <circle cx="0" cy="-6" r="2.2" fill="#16a34a" />
              <path d="M -3.5,-3 L 3.5,-3 L 4.5,4 L -4.5,4 Z" fill="#16a34a" />
            </g>

            {/* Glowing route filter */}
            <filter id="cyanRouteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Fixed Blueprint Content */}
          <g id="fixedBlueprintContent">
            {/* LAYER 0: Corridors */}
            <g id="layerCorridors" fill="#fdfaf2" stroke="#e8e2d5" strokeWidth="1.5">
              <rect x="338" y="140" width="38" height="775" rx="2" />
              <rect x="624" y="140" width="38" height="775" rx="2" />
              <rect x="338" y="215" width="324" height="28" rx="2" />
              <rect x="80" y="415" width="840" height="30" rx="2" />
              <rect x="80" y="605" width="840" height="30" rx="2" />
              <rect x="188" y="445" width="28" height="160" rx="2" />
              <rect x="784" y="445" width="28" height="160" rx="2" />
              <rect x="338" y="885" width="324" height="30" rx="2" />
            </g>

            {/* Structural Junction Columns */}
            <g id="corridorPillars" fill="#334155" pointerEvents="none">
              <rect x="348" y="222" width="6" height="6" rx="1" />
              <rect x="646" y="222" width="6" height="6" rx="1" />
              <rect x="198" y="427" width="6" height="6" rx="1" />
              <rect x="348" y="427" width="6" height="6" rx="1" />
              <rect x="646" y="427" width="6" height="6" rx="1" />
              <rect x="796" y="427" width="6" height="6" rx="1" />
              <rect x="198" y="617" width="6" height="6" rx="1" />
              <rect x="348" y="617" width="6" height="6" rx="1" />
              <rect x="646" y="617" width="6" height="6" rx="1" />
              <rect x="796" y="617" width="6" height="6" rx="1" />
              <rect x="348" y="897" width="6" height="6" rx="1" />
              <rect x="646" y="897" width="6" height="6" rx="1" />
            </g>

            {/* LAYER 1: Voids & Open Atriums */}
            <g id="layerAtriums">
              <rect x="376" y="245" width="248" height="98" rx="4" fill="#f4f9ff" stroke="#bfdbfe" strokeWidth="1.5" />
              <use href="#treeSymbol" x="405" y="300" />
              <use href="#treeSymbol" x="595" y="300" />
              <text x="500" y="290" fill="#1e3a8a" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="extrabold" letterSpacing="0.6">
                OPEN ATRIUM
              </text>
              <text x="500" y="305" fill="#64748b" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                (NORTH)
              </text>

              <rect x="218" y="450" width="118" height="150" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="218" y1="450" x2="336" y2="600" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="336" y1="450" x2="218" y2="600" stroke="#cbd5e1" strokeWidth="1" />
              <text x="277" y="530" fill="#64748b" fontSize="10.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                VOID
              </text>

              <rect x="664" y="450" width="118" height="150" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="664" y1="450" x2="782" y2="600" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="782" y1="450" x2="664" y2="600" stroke="#cbd5e1" strokeWidth="1" />
              <text x="723" y="530" fill="#64748b" fontSize="10.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                VOID
              </text>

              <rect x="445" y="450" width="110" height="150" rx="4" fill="#f4f9ff" stroke="#bfdbfe" strokeWidth="1.5" />
              <use href="#treeSymbol" x="500" y="475" />
              <use href="#treeSymbol" x="465" y="530" />
              <use href="#treeSymbol" x="535" y="530" />
              <use href="#treeSymbol" x="500" y="585" />
              <text x="500" y="525" fill="#1e3a8a" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="extrabold">CENTER</text>
              <text x="500" y="540" fill="#1e3a8a" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="extrabold">VOID</text>

              <rect x="376" y="645" width="248" height="235" rx="4" fill="#f4f9ff" stroke="#bfdbfe" strokeWidth="1.5" />
              <use href="#treeSymbol" x="405" y="740" />
              <use href="#treeSymbol" x="595" y="740" />
              <text x="500" y="735" fill="#1e3a8a" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="extrabold" letterSpacing="0.6">
                OPEN ATRIUM
              </text>
              <text x="500" y="750" fill="#64748b" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                (SOUTH)
              </text>
            </g>

            {/* LAYER 2: Rooms */}
            <g id="layerRooms">
              {rooms.map((room) => {
                if (room.id.endsWith('151') && room.row === 1) return null;

                const isSelected = selectedEntity?.id === room.id;
                const isRow7Restroom = room.row === 7 && room.col === 3 && room.bay === 3;
                const isRow7HOD = room.row === 7 && room.col === 7 && (room.bay === 2 || room.id.endsWith('770'));

                const isRestroom =
                  (room.row === 5 && (room.col === 1 || room.col === 2)) || isRow7Restroom;
                const isLab =
                  (room.row === 5 && room.col === 8) || (room.row === 6 && room.col === 8) || room.type === 'lab';

                let fill = '#dbeafe';
                let stroke = '#2563eb';
                let textColor = '#1e3a8a';

                if (isRow7Restroom || isRow7HOD) {
                  fill = '#0e4d64';
                  stroke = '#083344';
                  textColor = '#ffffff';
                } else if (isRestroom) {
                  fill = '#dcfce7';
                  stroke = '#16a34a';
                  textColor = '#14532d';
                } else if (isLab) {
                  fill = '#f3e8ff';
                  stroke = '#9333ea';
                  textColor = '#581c87';
                }

                if (isSelected) {
                  stroke = '#f59e0b';
                }

                const getHodDeptName = (fl: number) => {
                  switch (fl) {
                    case 1: return 'Sci & Humanities';
                    case 2: return 'ECE';
                    case 3: return 'Mech & Robotics';
                    case 4: return 'EEE';
                    case 5: return 'CSE';
                    case 6: return 'AI & Data Sci';
                    default: return 'Engineering';
                  }
                };

                return (
                  <g
                    key={room.id}
                    className="room-zone cursor-pointer transition-all duration-200"
                    onClick={() => onSelectEntity(room)}
                    onMouseEnter={() => setHoveredEntity(room)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.w}
                      height={room.h}
                      rx="3"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {room.doorX !== undefined && room.doorY !== undefined && (
                      <rect
                        x={
                          room.doorX > room.x + room.w - 8
                            ? room.x + room.w - 3
                            : room.doorX < room.x + 8
                            ? room.x
                            : room.doorX - 6
                        }
                        y={
                          room.doorY > room.y + room.h - 8
                            ? room.y + room.h - 3
                            : room.doorY < room.y + 8
                            ? room.y
                            : room.doorY - 6
                        }
                        width={room.doorX === room.x || room.doorX === room.x + room.w ? 3 : 12}
                        height={room.doorY === room.y || room.doorY === room.y + room.h ? 3 : 12}
                        fill={isRow7Restroom || isRow7HOD ? '#38bdf8' : '#1d4ed8'}
                        rx="1"
                      />
                    )}

                    {isRow7Restroom ? (
                      <g pointerEvents="none">
                        <text x={room.x + room.w / 2} y={room.y + room.h / 2 - 3} fill="#ffffff" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                          Restroom
                        </text>
                        <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 8} fill="#a5f3fc" fontSize="7.5" fontFamily="sans-serif" fontWeight="semibold" textAnchor="middle">
                          (Men & Women)
                        </text>
                      </g>
                    ) : isRow7HOD ? (
                      <g pointerEvents="none">
                        <text x={room.x + room.w / 2} y={room.y + room.h / 2 - 4} fill="#ffffff" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                          Department HOD
                        </text>
                        <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 7} fill="#fed7aa" fontSize="7" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                          ({getHodDeptName(currentFloor)})
                        </text>
                      </g>
                    ) : isRestroom ? (
                      <g pointerEvents="none">
                        <use href={room.bay === 1 ? '#menSymbol' : '#womenSymbol'} x={room.x + 18} y={room.y + room.h / 2} />
                        <text x={room.x + room.w / 2 + 8} y={room.y + room.h / 2 - 2} fill="#166534" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                          Restroom
                        </text>
                        <text x={room.x + room.w / 2 + 8} y={room.y + room.h / 2 + 10} fill="#166534" fontSize="8.5" fontFamily="sans-serif" fontWeight="semibold" textAnchor="middle">
                          {room.bay === 1 ? '(Men)' : '(Women)'}
                        </text>
                      </g>
                    ) : isLab && room.row === 5 ? (
                      <g pointerEvents="none">
                        <text x={room.x + room.w / 2} y={room.y + room.h / 2 - 6} fill="#6b21a8" fontSize="10" fontFamily="monospace" fontWeight="extrabold" textAnchor="middle">
                          {room.id}
                        </text>
                        <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 8} fill="#6b21a8" fontSize="8" fontFamily="sans-serif" fontWeight="semibold" textAnchor="middle">
                          {room.bay === 1 ? 'Communication Lab' : 'Electronics Lab'}
                        </text>
                      </g>
                    ) : (
                      <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 4} fill={textColor} fontSize={room.w < 50 ? '9.5' : '11'} fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {room.id}
                      </text>
                    )}

                    {room.id.endsWith('412') && (
                      <use href="#treeSymbol" x={room.x + room.w - 18} y={room.y + room.h / 2} />
                    )}
                  </g>
                );
              })}
            </g>

            {/* LAYER 3: Vertical Cores & Stairs */}
            <g id="layerVerticalCores">
              <g id="nwStairBadge">
                <rect x="340" y="160" width="16" height="32" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1" />
                <line x1="340" y1="168" x2="356" y2="168" stroke="#ffffff" strokeWidth="1" />
                <line x1="340" y1="176" x2="356" y2="176" stroke="#ffffff" strokeWidth="1" />
                <line x1="340" y1="184" x2="356" y2="184" stroke="#ffffff" strokeWidth="1" />
              </g>

              <g id="neStairBadge">
                <rect x="644" y="160" width="16" height="32" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1" />
                <line x1="644" y1="168" x2="660" y2="168" stroke="#ffffff" strokeWidth="1" />
                <line x1="644" y1="176" x2="660" y2="176" stroke="#ffffff" strokeWidth="1" />
                <line x1="644" y1="184" x2="660" y2="184" stroke="#ffffff" strokeWidth="1" />
              </g>

              {cores.map((core) => {
                const isSelected = selectedEntity?.id === core.id;
                const isMidLift = core.id === 'lift_mid_w' || core.id === 'lift_mid_e';

                return (
                  <g
                    key={core.id}
                    className="core-zone cursor-pointer"
                    onClick={() => onSelectEntity(core)}
                    onMouseEnter={() => setHoveredEntity(core)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {isMidLift && (
                      <g id={`staircase_wrap_${core.id}`}>
                        <rect
                          x={core.id === 'lift_mid_w' ? core.x - 20 : core.x + core.w + 2}
                          y={core.y - 2}
                          width={18}
                          height={core.h + 4}
                          rx="2"
                          fill="#f8fafc"
                          stroke="#334155"
                          strokeWidth="1.2"
                        />
                        {Array.from({ length: 5 }).map((_, i) => (
                          <line
                            key={`stair_step_${core.id}_${i}`}
                            x1={core.id === 'lift_mid_w' ? core.x - 18 : core.x + core.w + 4}
                            y1={core.y + 3 + i * 6}
                            x2={core.id === 'lift_mid_w' ? core.x - 4 : core.x + core.w + 18}
                            y2={core.y + 3 + i * 6}
                            stroke="#475569"
                            strokeWidth="1"
                          />
                        ))}
                      </g>
                    )}

                    <rect
                      x={core.x}
                      y={core.y}
                      width={core.w}
                      height={core.h}
                      rx="4"
                      fill="#475569"
                      stroke={isSelected ? '#f59e0b' : '#1e293b'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    <rect x={core.x + 5} y={core.y + 5} width={core.w - 10} height={core.h - 10} fill="#ffffff" rx="1" />
                    <line x1={core.x + core.w / 2} y1={core.y + 5} x2={core.x + core.w / 2} y2={core.y + core.h - 5} stroke="#64748b" strokeWidth="1.2" />
                  </g>
                );
              })}
            </g>

            {/* Stage Bar */}
            <g id="layerStage">
              <rect x="340" y="940" width="320" height="24" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.2" />
              <text x="500" y="956" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" letterSpacing="2">
                STAGE
              </text>
            </g>

            {/* LAYER 5: Lobbies & Tiered Auditorium */}
            <g id="westLobby">
              <polygon points="175,930 310,950 250,1045 145,985" fill="#fef3c7" stroke="#e2d9c8" strokeWidth="1.5" />
              <text x="218" y="955" fill="#64748b" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Lobby</text>
              <use href="#treeSymbol" x="256" y="975" />
              <g transform="rotate(-35, 218, 985)">
                <rect x="200" y="965" width="36" height="40" fill="#ffffff" stroke="#334155" strokeWidth="1" rx="2" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <line key={`wl-stair-${i}`} x1="202" y1={968 + i * 5} x2="234" y2={968 + i * 5} stroke="#334155" strokeWidth="1" />
                ))}
              </g>
            </g>

            <g id="eastLobby">
              <polygon points="825,930 664,950 750,1045 855,985" fill="#fef3c7" stroke="#e2d9c8" strokeWidth="1.5" />
              <text x="758" y="955" fill="#64748b" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Lobby</text>
              <use href="#treeSymbol" x="715" y="975" />
              <g transform="rotate(35, 758, 985)">
                <rect x="740" y="965" width="36" height="40" fill="#ffffff" stroke="#334155" strokeWidth="1" rx="2" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <line key={`el-stair-${i}`} x1="742" y1={968 + i * 5} x2="774" y2={968 + i * 5} stroke="#334155" strokeWidth="1" />
                ))}
              </g>
            </g>

            {/* Grand Auditorium */}
            {(() => {
              const audiCode = `${currentFloor}151`;
              const audi = rooms.find((r) => r.id === audiCode) || rooms.find((r) => r.id.endsWith('151'));
              const isSelected = selectedEntity?.id === audiCode || (selectedEntity && audi && selectedEntity.id === audi.id);

              return (
                <g
                  id="auditoriumBowl"
                  className="room-zone cursor-pointer"
                  onClick={() => {
                    if (audi) onSelectEntity(audi);
                  }}
                  onMouseEnter={() => {
                    if (audi) setHoveredEntity(audi);
                  }}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  <path
                    d="M 250,1005 Q 500,970 750,1005 L 815,1125 Q 500,1210 185,1125 Z"
                    fill={isSelected ? '#eff6ff' : '#ffffff'}
                    stroke={isSelected ? '#f59e0b' : '#334155'}
                    strokeWidth="2"
                  />

                  <g stroke="#cbd5e1" strokeWidth="1.2" fill="none" pointerEvents="none">
                    <path d="M 275,1010 Q 500,980 725,1010" />
                    <path d="M 266,1022 Q 500,992 734,1022" />
                    <path d="M 257,1034 Q 500,1004 743,1034" />
                    <path d="M 248,1046 Q 500,1016 752,1046" />
                    <path d="M 239,1058 Q 500,1028 761,1058" />
                    <path d="M 230,1070 Q 500,1040 770,1070" />
                    <path d="M 221,1082 Q 500,1052 779,1082" />
                    <path d="M 212,1094 Q 500,1064 788,1094" />
                    <path d="M 203,1106 Q 500,1076 797,1106" />
                    <path d="M 194,1118 Q 500,1088 806,1118" />
                  </g>

                  <g stroke="#334155" strokeWidth="1.2" pointerEvents="none">
                    <line x1="488" y1="976" x2="486" y2="1170" />
                    <line x1="512" y1="976" x2="514" y2="1170" />
                  </g>

                  <g pointerEvents="none">
                    <text x="500" y="1075" fill="#0f172a" fontSize="14" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">
                      {audiCode}
                    </text>
                    <text x="500" y="1090" fill="#64748b" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                      Auditorium
                    </text>
                  </g>

                  <g fill="#0f172a" pointerEvents="none">
                    <circle cx="145" cy="985" r="4.5" />
                    <circle cx="230" cy="1070" r="4.5" />
                    <circle cx="380" cy="1185" r="4.5" />
                    <circle cx="500" cy="1205" r="4.5" />
                    <circle cx="620" cy="1185" r="4.5" />
                    <circle cx="770" cy="1070" r="4.5" />
                    <circle cx="855" cy="985" r="4.5" />
                  </g>
                </g>
              );
            })()}

            {/* South Main Entrance Indicator */}
            <g id="southMainEntrance" pointerEvents="none">
              <rect x="488" y="1215" width="24" height="6" fill="#334155" rx="1" />
              <text x="500" y="1235" fill="#0f172a" fontSize="10" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">
                SOUTH
              </text>
              <text x="500" y="1248" fill="#64748b" fontSize="8.5" fontFamily="sans-serif" fontWeight="semibold" textAnchor="middle">
                (Main Entrance)
              </text>
            </g>

            {/* LAYER 6: Animated Walking Corridor Route */}
            {activeRoute && routePathD && (
              <g id="layerRouteOverlay" pointerEvents="none">
                <path
                  d={routePathD}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="12"
                  opacity="0.25"
                  filter="url(#cyanRouteGlow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="animated-nav-line"
                  d={routePathD}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Start Marker */}
                {startPoint && (
                  <g>
                    <circle cx={startPoint.x} cy={startPoint.y} r="4" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                )}

                {/* Destination Marker */}
                {endPoint && (
                  <g transform={`translate(${endPoint.x}, ${endPoint.y})`}>
                    <circle cx="0" cy="0" r="4" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            )}
          </g>
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredEntity && (
          <div
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
            className="absolute pointer-events-none bg-white border border-[#ded4c0] text-xs rounded-2xl p-3.5 shadow-2xl shadow-[#11202f]/15 z-50 max-w-xs transition-transform"
          >
            <div className="font-mono text-[#1e354d] font-bold text-xs flex items-center justify-between border-b border-[#ded4c0]/50 pb-1.5 mb-1.5">
              <span>{hoveredEntity.id}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#dbe4eb] text-[10px] text-[#1e354d] font-sans font-bold border border-[#cad7e2] uppercase">
                {hoveredEntity.type}
              </span>
            </div>
            <div className="text-[#11202f] font-bold text-xs font-serif">{hoveredEntity.name}</div>
            <div className="text-[11px] text-[#64748b] font-sans mt-0.5">
              {hoveredEntity.desc}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
