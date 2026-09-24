import { RoomItem, SpaceType } from '../types';

export interface SectionConfig {
  id: string; // e.g. "65", "68", "85"
  name: string;
  row: number;
  col: number;
  startX: number;
  endX: number;
  y: number;
  h: number;
  gap: number;
  maxRooms: number;
  defaultType: SpaceType;
}

export const SECTIONS_CONFIG: Record<string, SectionConfig> = {
  // ROW 8: Top North Bar (y: 155, h: 60)
  '83': { id: '83', name: 'Row 8 West Wing Studio', row: 8, col: 3, startX: 260, endX: 335, y: 155, h: 50, gap: 5, maxRooms: 2, defaultType: 'classroom' },
  '85': { id: '85', name: 'Row 8 Center Concourse Hall', row: 8, col: 5, startX: 382, endX: 618, y: 155, h: 60, gap: 4, maxRooms: 6, defaultType: 'classroom' },
  '87': { id: '87', name: 'Row 8 East Wing Faculty Suite', row: 8, col: 7, startX: 665, endX: 750, y: 155, h: 48, gap: 5, maxRooms: 2, defaultType: 'classroom' },

  // ROW 7: Faculty Consultation & HOD Spine (y: 215, h: 36)
  '73': { id: '73', name: 'Row 7 West Faculty Consultation', row: 7, col: 3, startX: 240, endX: 335, y: 215, h: 38, gap: 6, maxRooms: 3, defaultType: 'classroom' },
  '77': { id: '77', name: 'Row 7 East HOD & Boardroom', row: 7, col: 7, startX: 665, endX: 750, y: 260, h: 40, gap: 6, maxRooms: 3, defaultType: 'classroom' },

  // ROW 6: Upper Classroom Concourse Bar (y: 345, h: 62)
  '61': { id: '61', name: 'Row 6 Outer West Wing Bar', row: 6, col: 1, startX: 90, endX: 280, y: 345, h: 62, gap: 5, maxRooms: 4, defaultType: 'classroom' },
  '65': { id: '65', name: 'Row 6 Central Gallery Concourse', row: 6, col: 5, startX: 382, endX: 602, y: 345, h: 62, gap: 5, maxRooms: 5, defaultType: 'classroom' },
  '68': { id: '68', name: 'Row 6 Outer East Wing Bar', row: 6, col: 8, startX: 785, endX: 910, y: 345, h: 62, gap: 5, maxRooms: 3, defaultType: 'classroom' },

  // ROW 5: Mid-Wing Flanks & Laboratories (y: 455..535, h: 60)
  '51': { id: '51', name: 'Row 5 West Restroom & Services', row: 5, col: 1, startX: 95, endX: 185, y: 465, h: 60, gap: 10, maxRooms: 2, defaultType: 'amenity' },
  '54': { id: '54', name: 'Row 5 West Atrium Flank Studios', row: 5, col: 4, startX: 375, endX: 435, y: 455, h: 60, gap: 10, maxRooms: 2, defaultType: 'classroom' },
  '56': { id: '56', name: 'Row 5 East Atrium Flank Studios', row: 5, col: 6, startX: 565, endX: 625, y: 455, h: 60, gap: 10, maxRooms: 2, defaultType: 'classroom' },
  '58': { id: '58', name: 'Row 5 East Specialized Laboratories', row: 5, col: 8, startX: 835, endX: 920, y: 465, h: 60, gap: 10, maxRooms: 2, defaultType: 'lab' },

  // ROW 4: Lower Classroom Concourse Bar (y: 645, h: 60)
  '41': { id: '41', name: 'Row 4 Outer West Wing Bar', row: 4, col: 1, startX: 95, endX: 220, y: 645, h: 60, gap: 5, maxRooms: 3, defaultType: 'classroom' },
  '45': { id: '45', name: 'Row 4 Central Lecture Hall Concourse', row: 4, col: 5, startX: 382, endX: 618, y: 645, h: 60, gap: 4, maxRooms: 6, defaultType: 'classroom' },
  '48': { id: '48', name: 'Row 4 Outer East Wing Bar', row: 4, col: 8, startX: 730, endX: 913, y: 645, h: 60, gap: 4, maxRooms: 4, defaultType: 'classroom' },

  // ROW 3: South Studio Suites (y: 735, h: 52)
  '33': { id: '33', name: 'Row 3 West Studio Suite', row: 3, col: 3, startX: 260, endX: 335, y: 735, h: 52, gap: 8, maxRooms: 2, defaultType: 'classroom' },
  '37': { id: '37', name: 'Row 3 East Studio Suite', row: 3, col: 7, startX: 665, endX: 740, y: 735, h: 52, gap: 8, maxRooms: 2, defaultType: 'classroom' },
};

export const ALL_SECTIONS_LIST = Object.values(SECTIONS_CONFIG);

export function layoutRoomsInSection(
  section: SectionConfig,
  roomDefinitions: { name: string; type?: SpaceType; capacity?: number; desc?: string }[]
): RoomItem[] {
  const count = Math.max(1, roomDefinitions.length);
  const totalSpan = section.endX - section.startX;
  const totalGap = (count - 1) * section.gap;
  const roomWidth = Math.max(38, Math.floor((totalSpan - totalGap) / count));

  return roomDefinitions.map((def, idx) => {
    const bayIndex = idx + 1;
    const x = section.startX + idx * (roomWidth + section.gap);
    const y = section.y;
    const w = roomWidth;
    const h = section.h;

    const doorX = Math.round(x + w / 2);
    let doorY = y + h;
    if (section.row === 4 || section.row === 6) {
      doorY = section.row === 4 ? y - 10 : y + h + 10;
    } else if (section.row === 8) {
      doorY = y + h + 10;
    }

    const roomId = `6${section.row}${section.col}${bayIndex}`;

    return {
      id: roomId,
      std: roomId,
      name: def.name,
      type: def.type || section.defaultType,
      capacity: def.capacity || 40,
      row: section.row,
      col: section.col,
      bay: bayIndex,
      x,
      y,
      w,
      h,
      doorX,
      doorY,
      desc: def.desc || `${def.name} in Section ${section.row}${section.col}.`,
    };
  });
}
