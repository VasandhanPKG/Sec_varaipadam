import React, { createContext, useContext, useState, useEffect } from 'react';
import { RoomItem, CoreItem, EntityItem, SpaceType } from '../types';
import { CORES_DATA } from '../data/floor6Data';
import { SECTIONS_CONFIG, layoutRoomsInSection } from '../data/sectionsData';
import {
  FLOORS_META,
  FloorMeta,
  getInitialBuildingFloors,
  generateDefaultRoomsForFloor,
} from '../data/buildingFloorsData';

interface RoomsContextType {
  currentFloor: number;
  setCurrentFloor: (floor: number) => void;
  floorsMeta: Record<number, FloorMeta>;
  currentFloorMeta: FloorMeta;
  allFloorsRooms: Record<number, RoomItem[]>;
  rooms: RoomItem[]; // Active floor rooms
  cores: CoreItem[];
  allBuildingRooms: RoomItem[]; // Flat list of all 6 floors
  allDestinations: EntityItem[]; // Active floor destinations
  allBuildingDestinations: EntityItem[]; // Entire building destinations (Floors 1-6 + Cores)
  getRoomsForFloor: (floor: number) => RoomItem[];
  addRoom: (room: Omit<RoomItem, 'id'> & { id?: string }, targetFloor?: number) => RoomItem;
  addRoomToSection: (
    sectionKey: string,
    roomData: { name: string; type: SpaceType; capacity: number; desc?: string },
    targetFloor?: number
  ) => RoomItem;
  removeRoomFromSection: (roomId: string, targetFloor?: number) => void;
  updateRoom: (id: string, room: Partial<RoomItem>, targetFloor?: number) => void;
  deleteRoom: (id: string, targetFloor?: number) => void;
  resetFloorToDefault: (floor: number) => void;
  resetAllFloorsToDefault: () => void;
  generateNextRoomCode: (row: number, col: number, floor?: number) => { roomNumber: string; bay: number };
}

const RoomsContext = createContext<RoomsContextType | null>(null);

const STORAGE_KEY = 'secmap_all_floors_v1';

export function RoomsProvider({ children }: { children: React.ReactNode }) {
  const [currentFloor, setCurrentFloor] = useState<number>(6);
  const [allFloorsRooms, setAllFloorsRooms] = useState<Record<number, RoomItem[]>>(
    getInitialBuildingFloors
  );

  // Load persisted custom rooms from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setAllFloorsRooms((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch (e) {
      console.error('Error loading multi-floor rooms from localStorage', e);
    }
  }, []);

  // Save to localStorage whenever any floor mutates
  const saveAllFloors = (updated: Record<number, RoomItem[]>) => {
    setAllFloorsRooms(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving floors to localStorage', e);
    }
  };

  const getRoomsForFloor = (floor: number): RoomItem[] => {
    return allFloorsRooms[floor] || generateDefaultRoomsForFloor(floor);
  };

  const activeFloorRooms = allFloorsRooms[currentFloor] || generateDefaultRoomsForFloor(currentFloor);
  const currentFloorMeta = FLOORS_META[currentFloor] || FLOORS_META[6];

  // Flat list of all rooms across all 6 floors
  const allBuildingRooms = Object.values(allFloorsRooms).flat();

  // Generate deterministic [F][R][C][N] code for a given floor and (Row, Col)
  const generateNextRoomCode = (row: number, col: number, floorOverride?: number) => {
    const floor = floorOverride || currentFloor;
    const floorRooms = getRoomsForFloor(floor);
    const sameCellRooms = floorRooms.filter((r) => r.row === row && r.col === col);
    const maxBay = sameCellRooms.reduce((max, r) => Math.max(max, r.bay || 1), 0);
    const nextBay = maxBay + 1;
    const roomNumber = `${floor}${row}${col}${nextBay}`;
    return { roomNumber, bay: nextBay };
  };

  // Add room directly into a specific section on any floor with auto-balancing
  const addRoomToSection = (
    sectionKey: string,
    roomData: { name: string; type: SpaceType; capacity: number; desc?: string },
    targetFloorOverride?: number
  ): RoomItem => {
    const floor = targetFloorOverride || currentFloor;
    const sectionConfig = SECTIONS_CONFIG[sectionKey];
    const floorRooms = getRoomsForFloor(floor);

    if (!sectionConfig) {
      return addRoom(
        {
          ...roomData,
          row: 4,
          col: 5,
          x: 400,
          y: 645,
          w: 60,
          h: 60,
        },
        floor
      );
    }

    const { row, col } = sectionConfig;
    const existingSectionRooms = floorRooms.filter((r) => r.row === row && r.col === col);
    const otherRooms = floorRooms.filter((r) => !(r.row === row && r.col === col));

    const combinedList = [
      ...existingSectionRooms,
      {
        name: roomData.name,
        type: roomData.type,
        capacity: roomData.capacity,
        desc: roomData.desc,
      },
    ];

    const rebalanced = layoutRoomsInSection(sectionConfig, combinedList).map((r) => ({
      ...r,
      floor,
      id: `${floor}${r.row || row}${r.col || col}${r.bay || 1}`,
    }));

    const newRoom = rebalanced[rebalanced.length - 1];
    const updatedFloorRooms = [...otherRooms, ...rebalanced];

    saveAllFloors({
      ...allFloorsRooms,
      [floor]: updatedFloorRooms,
    });

    return newRoom;
  };

  // Remove room from section and auto-redistribute remaining rooms
  const removeRoomFromSection = (roomId: string, targetFloorOverride?: number) => {
    let floor = targetFloorOverride || currentFloor;
    let targetRoom: RoomItem | undefined;

    for (const [flStr, rList] of Object.entries(allFloorsRooms)) {
      const found = rList.find((r) => r.id === roomId);
      if (found) {
        floor = Number(flStr);
        targetRoom = found;
        break;
      }
    }

    if (!targetRoom) return;

    const floorRooms = getRoomsForFloor(floor);
    const sectionKey = `${targetRoom.row}${targetRoom.col}`;
    const sectionConfig = SECTIONS_CONFIG[sectionKey];

    if (!sectionConfig) {
      const updatedFloorRooms = floorRooms.filter((r) => r.id !== roomId);
      saveAllFloors({ ...allFloorsRooms, [floor]: updatedFloorRooms });
      return;
    }

    const otherRooms = floorRooms.filter((r) => !(r.row === targetRoom!.row && r.col === targetRoom!.col));
    const remainingSectionRooms = floorRooms.filter(
      (r) => r.row === targetRoom!.row && r.col === targetRoom!.col && r.id !== roomId
    );

    const rebalanced = layoutRoomsInSection(sectionConfig, remainingSectionRooms).map((r) => ({
      ...r,
      floor,
      id: `${floor}${r.row || targetRoom!.row}${r.col || targetRoom!.col}${r.bay || 1}`,
    }));

    saveAllFloors({
      ...allFloorsRooms,
      [floor]: [...otherRooms, ...rebalanced],
    });
  };

  // Add new standalone room
  const addRoom = (
    newRoomData: Omit<RoomItem, 'id'> & { id?: string },
    targetFloorOverride?: number
  ): RoomItem => {
    const floor = targetFloorOverride || newRoomData.floor || currentFloor;
    const row = newRoomData.row || 4;
    const col = newRoomData.col || 5;
    const { roomNumber, bay } = generateNextRoomCode(row, col, floor);

    const fullRoom: RoomItem = {
      ...newRoomData,
      id: newRoomData.id || roomNumber,
      bay: newRoomData.bay || bay,
      row,
      col,
      floor,
      doorX: newRoomData.doorX ?? ((newRoomData.x ?? 0) + (newRoomData.w || 60) / 2),
      doorY: newRoomData.doorY ?? ((newRoomData.y ?? 0) + (newRoomData.h || 60)),
    };

    const floorRooms = getRoomsForFloor(floor);
    const updated = [...floorRooms, fullRoom];

    saveAllFloors({
      ...allFloorsRooms,
      [floor]: updated,
    });

    return fullRoom;
  };

  const updateRoom = (id: string, updates: Partial<RoomItem>, targetFloorOverride?: number) => {
    let floor = targetFloorOverride || currentFloor;
    for (const [flStr, rList] of Object.entries(allFloorsRooms)) {
      if (rList.some((r) => r.id === id)) {
        floor = Number(flStr);
        break;
      }
    }

    const floorRooms = getRoomsForFloor(floor);
    const updated = floorRooms.map((r) => (r.id === id ? { ...r, ...updates } : r));

    saveAllFloors({
      ...allFloorsRooms,
      [floor]: updated,
    });
  };

  const deleteRoom = (id: string, targetFloorOverride?: number) => {
    removeRoomFromSection(id, targetFloorOverride);
  };

  const resetFloorToDefault = (floor: number) => {
    saveAllFloors({
      ...allFloorsRooms,
      [floor]: generateDefaultRoomsForFloor(floor),
    });
  };

  const resetAllFloorsToDefault = () => {
    saveAllFloors(getInitialBuildingFloors());
  };

  const allDestinations: EntityItem[] = [...activeFloorRooms, ...CORES_DATA];
  const allBuildingDestinations: EntityItem[] = [...allBuildingRooms, ...CORES_DATA];

  return (
    <RoomsContext.Provider
      value={{
        currentFloor,
        setCurrentFloor,
        floorsMeta: FLOORS_META,
        currentFloorMeta,
        allFloorsRooms,
        rooms: activeFloorRooms,
        cores: CORES_DATA,
        allBuildingRooms,
        allDestinations,
        allBuildingDestinations,
        getRoomsForFloor,
        addRoom,
        addRoomToSection,
        removeRoomFromSection,
        updateRoom,
        deleteRoom,
        resetFloorToDefault,
        resetAllFloorsToDefault,
        generateNextRoomCode,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms(): RoomsContextType {
  const context = useContext(RoomsContext);
  if (!context) {
    const defaultRooms = generateDefaultRoomsForFloor(6);
    return {
      currentFloor: 6,
      setCurrentFloor: () => {},
      floorsMeta: FLOORS_META,
      currentFloorMeta: FLOORS_META[6],
      allFloorsRooms: { 6: defaultRooms },
      rooms: defaultRooms,
      cores: CORES_DATA,
      allBuildingRooms: defaultRooms,
      allDestinations: [...defaultRooms, ...CORES_DATA],
      allBuildingDestinations: [...defaultRooms, ...CORES_DATA],
      getRoomsForFloor: () => defaultRooms,
      addRoom: (r) => ({ ...r, id: '6455', bay: 1 } as RoomItem),
      addRoomToSection: (s, r) => ({ ...r, id: '6654', bay: 1, row: 6, col: 5 } as RoomItem),
      removeRoomFromSection: () => {},
      updateRoom: () => {},
      deleteRoom: () => {},
      resetFloorToDefault: () => {},
      resetAllFloorsToDefault: () => {},
      generateNextRoomCode: (r, c) => ({ roomNumber: `6${r}${c}1`, bay: 1 }),
    };
  }
  return context;
}
