import { RoomItem, CoreItem, GraphNode } from '../types';

export const ROOMS_DATA: RoomItem[] = [
  // ---------------- ROW 3: South Studio Suites ----------------
  { id: "6331", std: "6331", name: "Classroom 6331", type: "classroom", capacity: 40, row: 3, col: 3, bay: 1, x: 260, y: 795, w: 75, h: 52, doorX: 345, doorY: 821, desc: "Acoustic classroom with interactive board." },
  { id: "6332", std: "6332", name: "Classroom 6332", type: "classroom", capacity: 40, row: 3, col: 3, bay: 2, x: 260, y: 735, w: 75, h: 52, doorX: 345, doorY: 761, desc: "Smart classroom equipped with interactive display." },
  { id: "6372", std: "6372", name: "Classroom 6372", type: "classroom", capacity: 35, row: 3, col: 7, bay: 2, x: 665, y: 735, w: 75, h: 52, doorX: 655, doorY: 761, desc: "Standard classroom suite." },
  { id: "6371", std: "6371", name: "Classroom 6371", type: "classroom", capacity: 35, row: 3, col: 7, bay: 1, x: 665, y: 795, w: 75, h: 52, doorX: 655, doorY: 821, desc: "Standard classroom suite." },

  // ---------------- ROW 4: Lower Classroom Bar ----------------
  // Outer West Wing (Cols 1-2)
  { id: "6411", std: "6411", name: "Classroom 6411", type: "classroom", capacity: 45, row: 4, col: 1, bay: 1, x: 95, y: 645, w: 60, h: 60, doorX: 125, doorY: 620, desc: "West Wing lecture classroom." },
  { id: "6412", std: "6412", name: "Classroom 6412", type: "classroom", capacity: 45, row: 4, col: 1, bay: 2, x: 160, y: 645, w: 60, h: 60, doorX: 190, doorY: 620, desc: "West Wing lecture classroom." },
  // Central Bar (Cols 4,5,6)
  { id: "6451", std: "6451", name: "Classroom 6451", type: "classroom", capacity: 50, row: 4, col: 5, bay: 1, x: 382, y: 645, w: 56, h: 60, doorX: 410, doorY: 620, desc: "Direct access tiered lecture hall." },
  { id: "6452", std: "6452", name: "Classroom 6452", type: "classroom", capacity: 50, row: 4, col: 5, bay: 2, x: 442, y: 645, w: 56, h: 60, doorX: 470, doorY: 620, desc: "Audio-visual equipped collaborative hall." },
  { id: "6453", std: "6453", name: "Classroom 6453", type: "classroom", capacity: 50, row: 4, col: 5, bay: 3, x: 502, y: 645, w: 56, h: 60, doorX: 530, doorY: 620, desc: "Executive hall with personal power modules." },
  { id: "6454", std: "6454", name: "Classroom 6454", type: "classroom", capacity: 50, row: 4, col: 5, bay: 4, x: 562, y: 645, w: 56, h: 60, doorX: 590, doorY: 620, desc: "Central lecture room with motorized curtains." },
  // Outer East Wing (Cols 8)
  { id: "6483", std: "6483", name: "Classroom 6483", type: "classroom", capacity: 40, row: 4, col: 8, bay: 3, x: 730, y: 645, w: 58, h: 60, doorX: 759, doorY: 620, desc: "Multi-modal display hall with lecture recording." },
  { id: "6482", std: "6482", name: "Classroom 6482", type: "classroom", capacity: 40, row: 4, col: 8, bay: 2, x: 792, y: 645, w: 58, h: 60, doorX: 821, doorY: 620, desc: "Standard presentation lecture room." },
  { id: "6481", std: "6481", name: "Classroom 6481", type: "classroom", capacity: 40, row: 4, col: 8, bay: 1, x: 855, y: 645, w: 58, h: 60, doorX: 884, doorY: 620, desc: "Whiteboard-lined discussion classroom." },

  // ---------------- ROW 5: Central Void with Left/Right Flanking Classrooms ----------------
  // Outer West: Restrooms (Men / Women)
  { id: "6511", std: "6511", name: "Restroom (Men)", type: "amenity", capacity: 15, row: 5, col: 1, bay: 1, x: 95, y: 535, w: 90, h: 60, doorX: 185, doorY: 565, desc: "Gents hygiene & restroom suite." },
  { id: "6512", std: "6512", name: "Restroom (Women)", type: "amenity", capacity: 15, row: 5, col: 1, bay: 2, x: 95, y: 465, w: 90, h: 60, doorX: 185, doorY: 495, desc: "Ladies hygiene & restroom suite." },
  
  // West Flank of Center Void
  { id: "6541", std: "6541", name: "Classroom 6541", type: "classroom", capacity: 34, row: 5, col: 4, bay: 1, x: 375, y: 525, w: 60, h: 58, doorX: 365, doorY: 554, desc: "Facing west corridor. Collaborative studio." },
  { id: "6542", std: "6542", name: "Classroom 6542", type: "classroom", capacity: 34, row: 5, col: 4, bay: 2, x: 375, y: 455, w: 60, h: 60, doorX: 365, doorY: 485, desc: "Facing west corridor. Design studio." },

  // East Flank of Center Void
  { id: "6561", std: "6561", name: "Classroom 6561", type: "classroom", capacity: 34, row: 5, col: 6, bay: 1, x: 565, y: 525, w: 60, h: 58, doorX: 635, doorY: 554, desc: "Facing east corridor. Innovation bay." },
  { id: "6562", std: "6562", name: "Classroom 6562", type: "classroom", capacity: 34, row: 5, col: 6, bay: 2, x: 565, y: 455, w: 60, h: 60, doorX: 635, doorY: 485, desc: "Facing east corridor. Systems design room." },

  // Outer East: Laboratories
  { id: "6581", std: "6581", name: "Communication Lab", type: "lab", capacity: 42, row: 5, col: 8, bay: 1, x: 835, y: 535, w: 85, h: 60, doorX: 830, doorY: 565, desc: "RF, fiber optic & wireless communications lab." },
  { id: "6582", std: "6582", name: "Electronics Lab", type: "lab", capacity: 40, row: 5, col: 8, bay: 2, x: 835, y: 465, w: 85, h: 60, doorX: 830, doorY: 495, desc: "VLSI, embedded systems & electronics lab." },

  // ---------------- ROW 6: Upper Classroom Bar ----------------
  // Outer West (Cols 1-2)
  { id: "6611", std: "6611", name: "Classroom 6611", type: "classroom", capacity: 55, row: 6, col: 1, bay: 1, x: 90, y: 345, w: 60, h: 62, doorX: 120, doorY: 415, desc: "West Wing lecture hall." },
  { id: "6612", std: "6612", name: "Classroom 6612", type: "classroom", capacity: 55, row: 6, col: 1, bay: 2, x: 155, y: 345, w: 60, h: 62, doorX: 185, doorY: 415, desc: "West Wing digital classroom." },
  { id: "6613", std: "6613", name: "Classroom 6613", type: "classroom", capacity: 55, row: 6, col: 1, bay: 3, x: 220, y: 345, w: 60, h: 62, doorX: 250, doorY: 415, desc: "West Wing multimedia theater." },
  // Center Bar (Cols 4,5,6)
  { id: "6651", std: "6651", name: "Classroom 6651", type: "classroom", capacity: 58, row: 6, col: 5, bay: 1, x: 382, y: 345, w: 70, h: 62, doorX: 417, doorY: 415, desc: "Main concourse studio." },
  { id: "6652", std: "6652", name: "Classroom 6652", type: "classroom", capacity: 58, row: 6, col: 5, bay: 2, x: 457, y: 345, w: 70, h: 62, doorX: 492, doorY: 415, desc: "Main concourse studio." },
  { id: "6653", std: "6653", name: "Classroom 6653", type: "classroom", capacity: 58, row: 6, col: 5, bay: 3, x: 532, y: 345, w: 70, h: 62, doorX: 567, doorY: 415, desc: "Main concourse studio." },
  // Outer East (Cols 8)
  { id: "6682", std: "6682", name: "Classroom 6682", type: "classroom", capacity: 48, row: 6, col: 8, bay: 2, x: 785, y: 345, w: 60, h: 62, doorX: 815, doorY: 415, desc: "East Wing lecture studio." },
  { id: "6681", std: "6681", name: "Classroom 6681", type: "classroom", capacity: 45, row: 6, col: 8, bay: 1, x: 850, y: 345, w: 60, h: 62, doorX: 880, doorY: 415, desc: "East Wing lecture studio." },

  // ---------------- ROW 7: Mid-Connector Spine ----------------
  { id: "6732", std: "6732", name: "Office 6732", type: "classroom", capacity: 12, row: 7, col: 3, bay: 2, x: 260, y: 215, w: 75, h: 36, doorX: 345, doorY: 233, desc: "Faculty consultation office." },
  { id: "6731", std: "6731", name: "Office 6731", type: "classroom", capacity: 12, row: 7, col: 3, bay: 1, x: 260, y: 260, w: 75, h: 36, doorX: 345, doorY: 278, desc: "Department chair office." },
  { id: "6730", std: "6730", name: "Restroom (Men & Women)", type: "amenity", capacity: 20, row: 7, col: 3, bay: 3, x: 240, y: 302, w: 75, h: 40, doorX: 345, doorY: 322, desc: "Restroom suite for both male and female." },
  { id: "6771", std: "6771", name: "Office 6771", type: "classroom", capacity: 20, row: 7, col: 7, bay: 1, x: 665, y: 260, w: 85, h: 40, doorX: 655, doorY: 280, desc: "Staff & faculty boardroom." },
  { id: "6770", std: "6770", name: "Department HOD", type: "office", capacity: 15, row: 7, col: 7, bay: 2, x: 665, y: 305, w: 75, h: 38, doorX: 655, doorY: 324, desc: "Head of the Department (HOD) Office." },

  // ---------------- ROW 8: Top North Classroom Bar ----------------
  { id: "6831", std: "6831", name: "Classroom 6831", type: "classroom", capacity: 40, row: 8, col: 3, bay: 1, x: 260, y: 155, w: 75, h: 50, doorX: 345, doorY: 180, desc: "North studio suite." },
  { id: "6851", std: "6851", name: "Classroom 6851", type: "classroom", capacity: 48, row: 8, col: 5, bay: 1, x: 382, y: 155, w: 56, h: 60, doorX: 410, doorY: 225, desc: "Design studio." },
  { id: "6852", std: "6852", name: "Classroom 6852", type: "classroom", capacity: 48, row: 8, col: 5, bay: 2, x: 442, y: 155, w: 56, h: 60, doorX: 470, doorY: 225, desc: "Design studio." },
  { id: "6853", std: "6853", name: "Classroom 6853", type: "classroom", capacity: 48, row: 8, col: 5, bay: 3, x: 502, y: 155, w: 56, h: 60, doorX: 530, doorY: 225, desc: "Design studio." },
  { id: "6854", std: "6854", name: "Classroom 6854", type: "classroom", capacity: 48, row: 8, col: 5, bay: 4, x: 562, y: 155, w: 56, h: 60, doorX: 590, doorY: 225, desc: "Design studio." },
  { id: "6872", std: "6872", name: "Office 6872", type: "classroom", capacity: 20, row: 8, col: 7, bay: 2, x: 665, y: 208, w: 85, h: 46, doorX: 655, doorY: 231, desc: "Staff office." },
  { id: "6871", std: "6871", name: "Office 6871", type: "classroom", capacity: 20, row: 8, col: 7, bay: 1, x: 665, y: 155, w: 85, h: 48, doorX: 655, doorY: 179, desc: "Staff office." },

  // ---------------- ROW 1-2: Grand Auditorium ----------------
  { id: "6151", std: "AUDI", name: "Auditorium", type: "amenity", capacity: 650, row: 1, col: 5, bay: 1, x: 250, y: 950, w: 500, h: 250, doorX: 500, doorY: 900, desc: "Institutional main auditorium with tiered arc seating." }
];

export const CORES_DATA: CoreItem[] = [
  // SOUTH LIFTS (Row 2, Flanking Grand Auditorium)
  { id: "lift_sw", name: "South-West Lift", std: "LIFT SW", type: "lift", row: 2, col: 3, x: 292, y: 840, w: 32, h: 32, doorX: 357, doorY: 875, desc: "Passenger elevator near South-West corridor." },
  { id: "lift_se", name: "South-East Lift", std: "LIFT SE", type: "lift", row: 2, col: 7, x: 678, y: 840, w: 32, h: 32, doorX: 642, doorY: 875, desc: "Passenger elevator near South-East corridor." },

  // MID LIFTS (Between Row 6 and Row 7)
  { id: "lift_mid_w", name: "Mid-West Lift", std: "LIFT W", type: "lift", row: 6, col: 3, x: 292, y: 350, w: 32, h: 32, doorX: 357, doorY: 365, desc: "Passenger elevator near West Wing." },
  { id: "lift_mid_e", name: "Mid-East Lift", std: "LIFT E", type: "lift", row: 6, col: 7, x: 678, y: 350, w: 32, h: 32, doorX: 642, doorY: 365, desc: "Passenger elevator near East Wing." }
];

export const ALL_DESTINATIONS = [...ROOMS_DATA, ...CORES_DATA];

export const GRAPH_NODES: Record<string, GraphNode> = {
  // West Arterial Vertical Corridor (Along Col 3: x = 357)
  "w_r8":      { x: 357, y: 225, label: "Row 8 West Corridor Junction" },
  "w_r7_fac":  { x: 357, y: 280, label: "Row 7 Faculty Offices Walkway" },
  "w_mid_core":{ x: 357, y: 365, label: "Mid-West Lift & Stair Lobby" },
  "w_r6_cross":{ x: 357, y: 430, label: "Row 6 Gallery West Intersection" },
  "w_r5_vloop":{ x: 357, y: 520, label: "Row 5 West Central Flank Walkway" },
  "w_r4_cross":{ x: 357, y: 620, label: "Row 4 Gallery West Intersection" },
  "w_r3_sem":  { x: 357, y: 790, label: "Row 3 Seminar Corridor" },
  "w_r2_core": { x: 357, y: 875, label: "SW Core Elevator & Stair Lobby" },
  "w_r2_prom": { x: 357, y: 900, label: "SW Auditorium Promenade Entrance" },

  // East Arterial Vertical Corridor (Along Col 7: x = 642)
  "e_r8":      { x: 642, y: 225, label: "Row 8 East Corridor Junction" },
  "e_r7_fac":  { x: 642, y: 280, label: "Row 7 East Faculty Walkway" },
  "e_mid_core":{ x: 642, y: 365, label: "Mid-East Lift & Stair Lobby" },
  "e_r6_cross":{ x: 642, y: 430, label: "Row 6 Gallery East Intersection" },
  "e_r5_vloop":{ x: 642, y: 520, label: "Row 5 East Central Flank Walkway" },
  "e_r4_cross":{ x: 642, y: 620, label: "Row 4 Gallery East Intersection" },
  "e_r3_sem":  { x: 642, y: 790, label: "Row 3 East Faculty Walkway" },
  "e_r2_core": { x: 642, y: 875, label: "SE Core Elevator & Stair Lobby" },
  "e_r2_prom": { x: 642, y: 900, label: "SE Auditorium Promenade Entrance" },

  // Row 8 North Concourse (y = 225)
  "r8_c4":     { x: 410, y: 225, label: "Studio 6851 Entry" },
  "r8_c5_mid": { x: 500, y: 225, label: "Row 8 North Center Hall" },
  "r8_c6":     { x: 590, y: 225, label: "Studio 6854 Entry" },

  // Row 6 Main Cross Gallery (y = 430)
  "r6_w_wing_end": { x: 120, y: 430, label: "West Wing Classrooms Corridor" },
  "r6_w_wing_junc":{ x: 202, y: 430, label: "West Wing Connector Junction" },
  "r6_c4":         { x: 417, y: 430, label: "Studio 6651 Entry Gallery" },
  "r6_c5_mid":     { x: 500, y: 430, label: "Central Cross Gallery Concourse" },
  "r6_c6":         { x: 567, y: 430, label: "Studio 6653 Entry Gallery" },
  "r6_e_wing_junc":{ x: 800, y: 430, label: "East Wing Connector Junction" },
  "r6_e_wing_end": { x: 880, y: 430, label: "East Wing Corridor" },

  // Row 4 Lower Cross Gallery (y = 620)
  "r4_w_wing_end": { x: 125, y: 620, label: "West Wing Concourse" },
  "r4_w_wing_junc":{ x: 202, y: 620, label: "West Wing Lower Connector Junction" },
  "r4_c4":         { x: 410, y: 620, label: "Central Hall A Concourse" },
  "r4_c5_mid":     { x: 500, y: 620, label: "Central Row 4 Spine Junction" },
  "r4_c6":         { x: 590, y: 620, label: "Central Hall D Concourse" },
  "r4_e_wing_junc":{ x: 800, y: 620, label: "East Wing Lower Connector Junction" },
  "r4_e_wing_end": { x: 884, y: 620, label: "East Wing Concourse" },

  // Auditorium Main Entrance Portal (Row 2, y = 900)
  "audi_portal":   { x: 500, y: 900, label: "Auditorium Main Foyer Portal" },

  // Row 5 Wing Vertical Connectors (Between Row 6 and Row 4)
  "w_wing_r5":     { x: 202, y: 530, label: "West Restroom Corridor" },
  "e_wing_r5":     { x: 800, y: 530, label: "East Labs Corridor" }
};

export const GRAPH_CONNECTIONS: [string, string, number][] = [
  // West Main Vertical Spine Corridor (x = 357)
  ["w_r8", "w_r7_fac", 55],
  ["w_r7_fac", "w_mid_core", 85],
  ["w_mid_core", "w_r6_cross", 65],
  ["w_r6_cross", "w_r5_vloop", 90],
  ["w_r5_vloop", "w_r4_cross", 100],
  ["w_r4_cross", "w_r3_sem", 170],
  ["w_r3_sem", "w_r2_core", 85],
  ["w_r2_core", "w_r2_prom", 25],

  // East Main Vertical Spine Corridor (x = 642)
  ["e_r8", "e_r7_fac", 55],
  ["e_r7_fac", "e_mid_core", 85],
  ["e_mid_core", "e_r6_cross", 65],
  ["e_r6_cross", "e_r5_vloop", 90],
  ["e_r5_vloop", "e_r4_cross", 100],
  ["e_r4_cross", "e_r3_sem", 170],
  ["e_r3_sem", "e_r2_core", 85],
  ["e_r2_core", "e_r2_prom", 25],

  // Row 8 North Concourse (y = 225)
  ["w_r8", "r8_c4", 53],
  ["r8_c4", "r8_c5_mid", 90],
  ["r8_c5_mid", "r8_c6", 90],
  ["r8_c6", "e_r8", 52],

  // Row 6 Main Cross Gallery (y = 430)
  ["r6_w_wing_end", "r6_w_wing_junc", 82],
  ["r6_w_wing_junc", "w_r6_cross", 155],
  ["w_r6_cross", "r6_c4", 60],
  ["r6_c4", "r6_c5_mid", 83],
  ["r6_c5_mid", "r6_c6", 67],
  ["r6_c6", "e_r6_cross", 75],
  ["e_r6_cross", "r6_e_wing_junc", 158],
  ["r6_e_wing_junc", "r6_e_wing_end", 80],

  // Row 4 Lower Cross Gallery (y = 620)
  ["r4_w_wing_end", "r4_w_wing_junc", 77],
  ["r4_w_wing_junc", "w_r4_cross", 155],
  ["w_r4_cross", "r4_c4", 53],
  ["r4_c4", "r4_c5_mid", 90],
  ["r4_c5_mid", "r4_c6", 90],
  ["r4_c6", "e_r4_cross", 52],
  ["e_r4_cross", "r4_e_wing_junc", 158],
  ["r4_e_wing_junc", "r4_e_wing_end", 84],

  // Row 5 Wing Vertical Connectors (x = 202 and x = 800)
  ["r6_w_wing_junc", "w_wing_r5", 100],
  ["w_wing_r5", "r4_w_wing_junc", 90],
  ["r6_e_wing_junc", "e_wing_r5", 100],
  ["e_wing_r5", "r4_e_wing_junc", 90],

  // South Row 2 Promenade & Grand Auditorium
  ["w_r2_prom", "audi_portal", 143],
  ["audi_portal", "e_r2_prom", 142]
];
