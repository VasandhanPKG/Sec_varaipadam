import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Navigation2,
  Layers,
  MapPin,
  ArrowUpDown,
  Milestone,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  CornerUpRight,
  CornerUpLeft,
  CheckCircle2,
  ArrowRightCircle,
  ChevronDown,
} from 'lucide-react';
import { EntityItem, RouteResult } from '../../types';
import { useRooms } from '../../context/RoomsContext';
import { FLOORS_META } from '../../data/buildingFloorsData';

interface DirectionsDrawerProps {
  isOpen: boolean;
  selectedEntity: EntityItem | null;
  activeRoute: RouteResult | null;
  onCalculateRoute: (startId: string, endId: string, startFloor?: number, targetFloor?: number) => void;
  onClearRoute: () => void;
  onSelectEntity: (entity: EntityItem) => void;
  inspectorTabActive: boolean;
  setInspectorTabActive: (active: boolean) => void;
}

export function DirectionsDrawer({
  isOpen,
  selectedEntity,
  activeRoute,
  onCalculateRoute,
  onClearRoute,
  inspectorTabActive,
  setInspectorTabActive,
}: DirectionsDrawerProps) {
  const { allFloorsRooms, cores, currentFloor, setCurrentFloor } = useRooms();

  const [startFloor, setStartFloor] = useState<number>(currentFloor || 6);
  const [targetFloor, setTargetFloor] = useState<number>(currentFloor || 6);
  const [startId, setStartId] = useState('lift_sw');
  const [endId, setEndId] = useState('6853');
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);

  // Sync with selectedEntity whenever it changes
  useEffect(() => {
    if (selectedEntity) {
      setEndId(selectedEntity.id);
      const fl =
        selectedEntity.floor ||
        (/^\d{4}$/.test(selectedEntity.id)
          ? parseInt(selectedEntity.id[0], 10)
          : currentFloor);
      setTargetFloor(fl);
    }
  }, [selectedEntity, currentFloor]);

  const startFloorRooms = allFloorsRooms[startFloor] || [];
  const targetFloorRooms = allFloorsRooms[targetFloor] || [];

  const handleSwap = () => {
    const tempF = startFloor;
    const tempId = startId;
    setStartFloor(targetFloor);
    setStartId(endId);
    setTargetFloor(tempF);
    setEndId(tempId);
    onCalculateRoute(endId, tempId, targetFloor, tempF);
  };

  const handleCalculate = () => {
    onCalculateRoute(startId, endId, startFloor, targetFloor);
  };

  const renderStepIcon = (iconName: string) => {
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

  if (!isOpen) return null;

  return (
    <aside
      className={`fixed sm:static inset-x-0 bottom-0 sm:inset-auto w-full sm:w-96 border-t sm:border-t-0 sm:border-l border-[#ded4c0] bg-[#fdfcf9] flex flex-col z-30 shadow-2xl sm:shadow-xl shrink-0 ${
        isMobileCollapsed ? 'h-16' : 'h-[78vh] sm:h-full'
      } transition-all duration-300 rounded-t-3xl sm:rounded-none overflow-hidden`}
    >
      {/* Mobile Drag/Collapse Handle */}
      <div
        onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
        className="sm:hidden pt-2 pb-1 px-4 flex flex-col items-center cursor-pointer bg-[#faf8f3] border-b border-[#ded4c0]"
      >
        <div className="w-12 h-1.5 bg-[#ded4c0] rounded-full mb-1" />
        <div className="text-[10px] text-[#64748b] font-semibold flex items-center gap-1">
          <span>{isMobileCollapsed ? 'Tap to Expand Route Guidance' : 'Tap to Minimize'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isMobileCollapsed ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-[#ded4c0] bg-[#faf8f3] p-1.5 gap-1.5 shrink-0">
        <button
          onClick={() => setInspectorTabActive(false)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            !inspectorTabActive
              ? 'text-white bg-[#1e354d] shadow-sm'
              : 'text-[#64748b] hover:text-[#11202f]'
          }`}
        >
          <Navigation2 className="w-4 h-4" /> Route
        </button>
        <button
          onClick={() => setInspectorTabActive(true)}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            inspectorTabActive
              ? 'text-white bg-[#1e354d] shadow-sm'
              : 'text-[#64748b] hover:text-[#11202f]'
          }`}
        >
          <Layers className="w-4 h-4" /> Space Details
        </button>
      </div>

      {/* TAB 1: Route Finder & Guidance */}
      {!inspectorTabActive && (
        <div className="flex-1 flex flex-col overflow-y-auto p-3.5 sm:p-4 space-y-4">
          {/* Controls Box */}
          <div className="bg-[#faf8f3] rounded-2xl p-3.5 sm:p-4 border border-[#ded4c0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-sans text-[#11202f]">
              <span className="flex items-center gap-1.5 font-bold text-[#1e354d]">
                <MapPin className="w-4 h-4 text-emerald-600" /> INDOOR ROUTING (FLOORS 1–6)
              </span>
              <button
                onClick={handleSwap}
                title="Swap Start and Destination"
                className="p-1.5 hover:bg-[#ede6d8] rounded-lg text-[#1e354d] transition"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Origin Selection */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-[#64748b] font-semibold">
                  START (ORIGIN):
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#8a99a8]">Floor:</span>
                  <select
                    value={startFloor}
                    onChange={(e) => {
                      const fl = Number(e.target.value);
                      setStartFloor(fl);
                      const fRooms = allFloorsRooms[fl] || [];
                      if (fRooms.length > 0 && !startId.startsWith('lift') && !startId.startsWith('stair')) {
                        setStartId(fRooms[0].id);
                      }
                    }}
                    className="bg-white border border-[#ded4c0] text-[11px] font-bold text-[#1e354d] rounded-lg px-2 py-0.5 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((f) => (
                      <option key={f} value={f}>
                        Floor {f} ({FLOORS_META[f]?.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                className="w-full bg-white border border-[#ded4c0] focus:border-[#1e354d] rounded-xl py-2 px-3 text-xs text-[#11202f] focus:outline-none focus:ring-2 focus:ring-[#1e354d]/10 font-sans shadow-xs"
              >
                <optgroup label="🛗 Vertical Lifts (Elevators)">
                  <option value="lift_sw">South-West Lift</option>
                  <option value="lift_se">South-East Lift</option>
                  <option value="lift_mid_w">Mid-West Lift</option>
                  <option value="lift_mid_e">Mid-East Lift</option>
                </optgroup>
                <optgroup label="🪜 Stairs">
                  <option value="stair_sw">South-West Staircase</option>
                  <option value="stair_se">South-East Staircase</option>
                  <option value="stair_mid_w">Mid-West Staircase</option>
                  <option value="stair_mid_e">Mid-East Staircase</option>
                </optgroup>
                <optgroup label={`🏢 Floor ${startFloor} Rooms & Spaces`}>
                  {startFloorRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Destination Selection */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-[#64748b] font-semibold">
                  DESTINATION (TARGET):
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#8a99a8]">Floor:</span>
                  <select
                    value={targetFloor}
                    onChange={(e) => {
                      const fl = Number(e.target.value);
                      setTargetFloor(fl);
                      const fRooms = allFloorsRooms[fl] || [];
                      if (fRooms.length > 0 && !endId.startsWith('lift') && !endId.startsWith('stair')) {
                        setEndId(fRooms[0].id);
                      }
                    }}
                    className="bg-white border border-[#ded4c0] text-[11px] font-bold text-[#1e354d] rounded-lg px-2 py-0.5 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((f) => (
                      <option key={f} value={f}>
                        Floor {f} ({FLOORS_META[f]?.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <select
                value={endId}
                onChange={(e) => setEndId(e.target.value)}
                className="w-full bg-white border border-[#ded4c0] focus:border-[#1e354d] rounded-xl py-2 px-3 text-xs text-[#11202f] focus:outline-none focus:ring-2 focus:ring-[#1e354d]/10 font-sans shadow-xs"
              >
                <optgroup label={`🏢 Floor ${targetFloor} Rooms & Spaces`}>
                  {targetFloorRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.id} - {room.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🛗 Vertical Lifts & Stairs">
                  {cores.map((core) => (
                    <option key={core.id} value={core.id}>
                      {core.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCalculate}
                className="flex-1 py-2.5 rounded-xl bg-[#1e354d] hover:bg-[#162a3f] text-white font-bold text-xs shadow-md shadow-[#1e354d]/20 flex items-center justify-center gap-1.5 transition"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </button>
              <button
                onClick={onClearRoute}
                className="px-4 py-2.5 rounded-xl bg-[#ede6d8] hover:bg-[#ded4c0] text-[#1e354d] text-xs font-semibold transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Turn-by-Turn Guidance Steps */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#64748b] font-semibold px-1">
              <span>ROUTE GUIDANCE</span>
              <span className="text-[#1e354d] font-bold">
                {activeRoute ? activeRoute.estimatedTimeText : 'Ready'}
              </span>
            </div>

            <div className="space-y-2 text-xs pb-6">
              {!activeRoute ? (
                <div className="p-6 rounded-2xl border border-dashed border-[#ded4c0] text-center text-[#8a99a8] bg-[#faf8f3]">
                  <Milestone className="w-6 h-6 mx-auto mb-2 text-[#1e354d]/40" />
                  Select origin and target across Floors 1–6 or click any room to calculate route.
                </div>
              ) : (
                <>
                  {activeRoute.isMultiFloor && (
                    <div className="p-3 rounded-2xl bg-[#f4ede0] border border-[#ded4c0] space-y-2 mb-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1e354d] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Layers className="w-3.5 h-3.5 text-[#1e354d]" />
                          Multi-Floor Journey Legs:
                        </span>
                        <span className="text-[10px] text-[#8a99a8] font-mono">
                          Viewing: L0{currentFloor}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentFloor(activeRoute.startFloor)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                            currentFloor === activeRoute.startFloor
                              ? 'bg-[#1e354d] text-white border-[#1e354d] shadow-md shadow-[#1e354d]/20'
                              : 'bg-white text-[#1e354d] border-[#ded4c0] hover:bg-[#faf8f3]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
                              currentFloor === activeRoute.startFloor ? 'bg-white/20 text-white' : 'bg-[#dbe4eb] text-[#1e354d]'
                            }`}>
                              1
                            </span>
                            <span className="truncate text-left">
                              Floor {activeRoute.startFloor} ➔ Staircase/Lift
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0 ml-1 ${
                            currentFloor === activeRoute.startFloor ? 'bg-white/20 text-white' : 'bg-[#dbe4eb] text-[#1e354d]'
                          }`}>
                            L0{activeRoute.startFloor}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurrentFloor(activeRoute.targetFloor)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                            currentFloor === activeRoute.targetFloor
                              ? 'bg-[#1e354d] text-white border-[#1e354d] shadow-md shadow-[#1e354d]/20'
                              : 'bg-white text-[#1e354d] border-[#ded4c0] hover:bg-[#faf8f3]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold shrink-0 ${
                              currentFloor === activeRoute.targetFloor ? 'bg-white/20 text-white' : 'bg-[#dbe4eb] text-[#1e354d]'
                            }`}>
                              2
                            </span>
                            <span className="truncate text-left">
                              Staircase/Lift ➔ Floor {activeRoute.targetFloor} ({activeRoute.targetEntity.name || activeRoute.targetEntity.id})
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0 ml-1 ${
                            currentFloor === activeRoute.targetFloor ? 'bg-white/20 text-white' : 'bg-[#dbe4eb] text-[#1e354d]'
                          }`}>
                            L0{activeRoute.targetFloor}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRoute.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition shadow-xs flex items-start gap-3 ${
                        step.isFloorChange
                          ? 'bg-[#fffbeb] border-amber-200 text-amber-950 font-medium'
                          : 'bg-white border-[#ded4c0] hover:border-[#1e354d]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          step.isFloorChange
                            ? 'bg-amber-100 border border-amber-300'
                            : 'bg-[#faf8f3] border border-[#ded4c0]'
                        }`}
                      >
                        {renderStepIcon(step.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[#11202f] font-bold text-xs flex items-center justify-between">
                          <span>{step.title}</span>
                          {step.floor && (
                            <button
                              onClick={() => setCurrentFloor(step.floor!)}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#dbe4eb] hover:bg-[#cad7e2] text-[#1e354d] border border-[#cad7e2] ml-1"
                              title={`Switch map view to Floor ${step.floor}`}
                            >
                              L{step.floor}
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748b] mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Space Details Inspector */}
      {inspectorTabActive && (
        <div className="flex-1 flex flex-col overflow-y-auto p-3.5 sm:p-4 space-y-4">
          <div className="bg-[#faf8f3] border border-[#ded4c0] rounded-2xl p-4 space-y-4 shadow-xs">
            {!selectedEntity ? (
              <div className="text-center py-8 text-[#8a99a8] text-xs">
                <MousePointerClick className="w-8 h-8 mx-auto mb-2 text-[#1e354d]/40" />
                Click any space on the map to view its details.
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-[#ded4c0] pb-3">
                  <div>
                    <div className="font-mono text-2xl font-black text-[#1e354d] flex items-center gap-2">
                      <span>{selectedEntity.id}</span>
                      {selectedEntity.floor && (
                        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-[#dbe4eb] text-[#1e354d]">
                          Floor {selectedEntity.floor}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[#11202f] font-serif font-bold text-base mt-1">
                      {selectedEntity.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#dbe4eb] text-[#1e354d] border border-[#cad7e2]">
                    {selectedEntity.type}
                  </span>
                </div>

                {'capacity' in selectedEntity && selectedEntity.capacity && (
                  <div className="text-xs text-[#64748b] font-medium">
                    Capacity: <span className="font-bold text-[#11202f]">{selectedEntity.capacity} seats</span>
                  </div>
                )}

                <p className="text-xs text-[#475569] leading-relaxed bg-white p-3 rounded-xl border border-[#ded4c0]">
                  {selectedEntity.desc}
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const fl =
                        selectedEntity.floor ||
                        (/^\d{4}$/.test(selectedEntity.id)
                          ? parseInt(selectedEntity.id[0], 10)
                          : currentFloor);
                      setStartFloor(fl);
                      setStartId(selectedEntity.id);
                      setInspectorTabActive(false);
                      onCalculateRoute(selectedEntity.id, endId, fl, targetFloor);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#ede6d8] hover:bg-[#ded4c0] text-[#1e354d] text-xs font-semibold transition"
                  >
                    Set Origin
                  </button>
                  <button
                    onClick={() => {
                      const fl =
                        selectedEntity.floor ||
                        (/^\d{4}$/.test(selectedEntity.id)
                          ? parseInt(selectedEntity.id[0], 10)
                          : currentFloor);
                      setTargetFloor(fl);
                      setEndId(selectedEntity.id);
                      setInspectorTabActive(false);
                      onCalculateRoute(startId, selectedEntity.id, startFloor, fl);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#1e354d] hover:bg-[#162a3f] text-white text-xs font-bold shadow-md shadow-[#1e354d]/20 transition"
                  >
                    Navigate Here
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
