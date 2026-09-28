import { RoomItem } from '../types';
import { ROOMS_DATA as FLOOR_6_DEFAULT_ROOMS } from './floor6Data';

export interface FloorMeta {
  floor: number;
  name: string;
  department: string;
  tagline: string;
  accentColor: string;
}

export const FLOORS_META: Record<number, FloorMeta> = {
  1: {
    floor: 1,
    name: "Ground Floor",
    department: "Auditorium Block",
    tagline: "Veranda & Main Entrance",
    accentColor: "#2563eb"
  },
  2: {
    floor: 2,
    name: "1st Floor",
    department: "Auditorium Block",
    tagline: "Veranda & Open Concourse",
    accentColor: "#0284c7"
  },
  3: {
    floor: 3,
    name: "2nd Floor",
    department: "Auditorium Block",
    tagline: "Central Campus Library",
    accentColor: "#059669"
  },
  4: {
    floor: 4,
    name: "3rd Floor",
    department: "Auditorium Block",
    tagline: "Lights Hall & Lattice Hall",
    accentColor: "#7c3aed"
  },
  5: {
    floor: 5,
    name: "4th Floor",
    department: "Auditorium Block",
    tagline: "Central Computer Center",
    accentColor: "#d97706"
  },
  6: {
    floor: 6,
    name: "5th & 6th Floor",
    department: "Auditorium Block",
    tagline: "Grand Auditorium & Staff Room",
    accentColor: "#e11d48"
  },
};

export function generateDefaultRoomsForFloor(floor: number): RoomItem[] {
  if (floor === 6) {
    return FLOOR_6_DEFAULT_ROOMS.map((r) => {
      let updatedName = r.name;
      let updatedDesc = r.desc;
      if (r.id === "6151") {
        updatedName = "Main Auditorium";
        updatedDesc = "5th & 6th Floor Grand Auditorium with Tiered Seating.";
      } else if (["6871", "6872", "6771", "6731", "6732"].includes(r.id)) {
        updatedName = `Staff Room (${r.id})`;
        updatedDesc = `6th Floor Faculty & Department Staff Room.`;
      }
      return {
        ...r,
        name: updatedName,
        desc: updatedDesc,
        floor: 6,
      };
    });
  }

  const floorNamePrefixes: Record<number, Record<string, string>> = {
    // GROUND FLOOR: VERANDA
    1: {
      "83": "Ground Floor Veranda West",
      "85_1": "Veranda Bay 1",
      "85_2": "Veranda Bay 2",
      "85_3": "Veranda Bay 3",
      "85_4": "Veranda Bay 4",
      "87_1": "Ground Floor Veranda East",
      "87_2": "Veranda Walkway",
      "73_1": "Reception & Enquiries",
      "73_2": "Security Desk",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Entrance Foyer",
      "77_2": "Administrative Office",
      "61_1": "Veranda Hall 101",
      "61_2": "Veranda Hall 102",
      "61_3": "Veranda Hall 103",
      "65_1": "Veranda Concourse North",
      "65_2": "Veranda Concourse Central",
      "65_3": "Veranda Concourse South",
      "68_1": "Veranda Arcade East",
      "68_2": "Veranda Promenade",
      "68_3": "Visitor Lounge",
      "51_1": "Veranda Lounge West",
      "51_2": "Open Gallery",
      "54_1": "Veranda Studio 101",
      "54_2": "Veranda Studio 102",
      "56_1": "Veranda Pavilion 1",
      "56_2": "Veranda Pavilion 2",
      "58_1": "Ground Veranda East Wing",
      "58_2": "Ground Veranda West Wing",
      "41_1": "Veranda Corridor 1",
      "41_2": "Veranda Corridor 2",
      "45_1": "Veranda Foyer A",
      "45_2": "Veranda Foyer B",
      "45_3": "Veranda Foyer C",
      "45_4": "Veranda Foyer D",
      "48_1": "Veranda Arcade A",
      "48_2": "Veranda Arcade B",
      "48_3": "Veranda Arcade C",
      "33_1": "Ground Staff Room 1",
      "33_2": "Ground Staff Room 2",
      "37_1": "Veranda Helpdesk",
      "37_2": "Information Center",
      "15": "Ground Floor Main Veranda & Foyer"
    },

    // 1ST FLOOR: VERANDA
    2: {
      "83": "1st Floor Veranda Lounge",
      "85_1": "1st Floor Veranda Bay 1",
      "85_2": "1st Floor Veranda Bay 2",
      "85_3": "1st Floor Veranda Bay 3",
      "85_4": "1st Floor Veranda Bay 4",
      "87_1": "1st Floor Veranda Gallery",
      "87_2": "Veranda Study Promenade",
      "73_1": "Veranda Office 201",
      "73_2": "Veranda Office 202",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Veranda Conference Foyer",
      "77_2": "Veranda Floor Office",
      "61_1": "Veranda Class 201",
      "61_2": "Veranda Class 202",
      "61_3": "Veranda Class 203",
      "65_1": "1st Floor Veranda Walkway A",
      "65_2": "1st Floor Veranda Walkway B",
      "65_3": "1st Floor Veranda Walkway C",
      "68_1": "Veranda East Corridor 1",
      "68_2": "Veranda East Corridor 2",
      "68_3": "Veranda Terrace",
      "51_1": "Veranda West Corridor 1",
      "51_2": "Veranda West Corridor 2",
      "54_1": "Veranda Suite 201",
      "54_2": "Veranda Suite 202",
      "56_1": "Veranda Balcony North",
      "56_2": "Veranda Balcony South",
      "58_1": "1st Floor Veranda Arcade",
      "58_2": "1st Floor Veranda Pavilion",
      "41_1": "Veranda Passage 201",
      "41_2": "Veranda Passage 202",
      "45_1": "1st Floor Veranda Hall 1",
      "45_2": "1st Floor Veranda Hall 2",
      "45_3": "1st Floor Veranda Hall 3",
      "45_4": "1st Floor Veranda Hall 4",
      "48_1": "1st Floor Veranda Wing A",
      "48_2": "1st Floor Veranda Wing B",
      "48_3": "1st Floor Veranda Wing C",
      "33_1": "Staff Cabin 201",
      "33_2": "Staff Cabin 202",
      "37_1": "Veranda Meeting Room",
      "37_2": "Veranda Project Bay",
      "15": "1st Floor Main Veranda Foyer"
    },

    // 2ND FLOOR: LIBRARY
    3: {
      "83": "Library Reading Lounge",
      "85_1": "Library Reference Section",
      "85_2": "Library Book Stack Area A",
      "85_3": "Library Book Stack Area B",
      "85_4": "Library Periodicals & Journals",
      "87_1": "Digital Library & E-Learning",
      "87_2": "Research Scholars Reading Room",
      "73_1": "Librarian Office",
      "73_2": "Library Technical Processing",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Library Discussion Hall",
      "77_2": "Circulation & Issue Desk",
      "61_1": "Library Study Hall 1",
      "61_2": "Library Study Hall 2",
      "61_3": "Library Study Hall 3",
      "65_1": "Library Audio-Visual Section",
      "65_2": "Library Archive Bay",
      "65_3": "Library Reprography & Printing",
      "68_1": "Library Silent Reading Zone 1",
      "68_2": "Library Silent Reading Zone 2",
      "68_3": "Library Group Study Pod",
      "51_1": "Library Competitive Exam Corner",
      "51_2": "Library Rare Books Archive",
      "54_1": "Library Seminar Foyer",
      "54_2": "Library Thesis & Projects Section",
      "56_1": "E-Resource Access Terminal 1",
      "56_2": "E-Resource Access Terminal 2",
      "58_1": "Library OPAC Search Hub",
      "58_2": "Library Book Return Station",
      "41_1": "Faculty Reading Hall",
      "41_2": "Library Quiet Study Wing",
      "45_1": "Central Library Hall A",
      "45_2": "Central Library Hall B",
      "45_3": "Central Library Hall C",
      "45_4": "Central Library Hall D",
      "48_1": "Library Media Center",
      "48_2": "Library Stack Wing 1",
      "48_3": "Library Stack Wing 2",
      "33_1": "Library Staff Room 1",
      "33_2": "Library Staff Room 2",
      "37_1": "Library Administrative Desk",
      "37_2": "Library Property Counter",
      "15": "Grand Campus Central Library"
    },

    // 3RD FLOOR: LIGHTS HALL & LATTICE HALL
    4: {
      "83": "Lights Hall Foyer",
      "85_1": "Lights Hall (Main Auditorium Suite)",
      "85_2": "Lights Hall Stage & AV Control",
      "85_3": "Lattice Hall (Conference Suite)",
      "85_4": "Lattice Hall Presentation Bay",
      "87_1": "Lights Hall Delegate Lounge",
      "87_2": "Lattice Hall Seminar Room",
      "73_1": "Hall Coordinator Office",
      "73_2": "Audio-Visual Operations",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Lights Hall Green Room",
      "77_2": "Lattice Hall Green Room",
      "61_1": "Seminar Hall 401",
      "61_2": "Seminar Hall 402",
      "61_3": "Seminar Hall 403",
      "65_1": "Lights Hall Audio Studio",
      "65_2": "Lattice Hall Video Production",
      "65_3": "Conference Hall 401",
      "68_1": "Executive Briefing Room",
      "68_2": "Guest Speaker Suite",
      "68_3": "Media & Press Lounge",
      "51_1": "Lighting & Acoustics Control",
      "51_2": "Stage Props & Storage",
      "54_1": "Symposium Room 401",
      "54_2": "Symposium Room 402",
      "56_1": "Lights Hall Exhibition Area",
      "56_2": "Lattice Hall Display Gallery",
      "58_1": "VIP Reception Room",
      "58_2": "Event Registration Desk",
      "41_1": "Broadcast Control Room",
      "41_2": "Sound Editing Suite",
      "45_1": "Lights Hall Section A",
      "45_2": "Lights Hall Section B",
      "45_3": "Lattice Hall Section A",
      "45_4": "Lattice Hall Section B",
      "48_1": "Mini Seminar Room 1",
      "48_2": "Mini Seminar Room 2",
      "48_3": "Mini Seminar Room 3",
      "33_1": "Staff Room (Lights Hall)",
      "33_2": "Staff Room (Lattice Hall)",
      "37_1": "Event Management Desk",
      "37_2": "Auditorium Block Office",
      "15": "Lights Hall & Lattice Hall Concourse"
    },

    // 4TH FLOOR: COMPUTER CENTER
    5: {
      "83": "Computer Center Student Lounge",
      "85_1": "Computer Center Lab 1 (AI & ML)",
      "85_2": "Computer Center Lab 2 (Software Dev)",
      "85_3": "Computer Center Lab 3 (Cloud & DevOps)",
      "85_4": "Computer Center Lab 4 (Cybersecurity)",
      "87_1": "High Performance Computing Cluster",
      "87_2": "Campus Server Datacenter",
      "73_1": "Director (Computer Center)",
      "73_2": "Network Administrator Office",
      "73_3": "Restroom (Men & Women)",
      "77_1": "IT Systems Support Cell",
      "77_2": "Central Computing Council",
      "61_1": "Programming Lab 501",
      "61_2": "Programming Lab 502",
      "61_3": "Programming Lab 503",
      "65_1": "Data Analytics Hub",
      "65_2": "Deep Learning Workstation Lab",
      "65_3": "Virtualization & Cloud Lab",
      "68_1": "Campus Network NOC",
      "68_2": "Hardware & Maintenance Bay",
      "68_3": "Software Testing Center",
      "51_1": "IoT Simulation Lab",
      "51_2": "Database Management Lab",
      "54_1": "Web Development Studio",
      "54_2": "Mobile Computing Lab",
      "56_1": "Robotics Simulation Terminal",
      "56_2": "Parallel Computing Bay",
      "58_1": "Cyber Defense Operations",
      "58_2": "Campus Wi-Fi Core Station",
      "41_1": "Algorithms Lab 1",
      "41_2": "Algorithms Lab 2",
      "45_1": "Computer Center Terminal A",
      "45_2": "Computer Center Terminal B",
      "45_3": "Computer Center Terminal C",
      "45_4": "Computer Center Terminal D",
      "48_1": "Tech Seminar Hall 1",
      "48_2": "Tech Seminar Hall 2",
      "48_3": "Tech Seminar Hall 3",
      "33_1": "Computer Center Staff Room 1",
      "33_2": "Computer Center Staff Room 2",
      "37_1": "IT Placement Preparation Lab",
      "37_2": "Industry Collaboration Studio",
      "15": "Central Campus Computer Center"
    }
  };

  const names = floorNamePrefixes[floor] || floorNamePrefixes[1];

  return FLOOR_6_DEFAULT_ROOMS.map((template) => {
    const roomId = `${floor}${template.row || 4}${template.col || 5}${template.bay || 1}`;
    const key = `${template.row || 4}${template.col || 5}${template.bay ? `_${template.bay}` : ''}`;
    const fallbackKey = `${template.row || 4}${template.col || 5}`;
    const roomName = names[key] || names[fallbackKey] || `${template.name.replace(/6\d\d/, `${floor}01`)} [L${floor}]`;

    return {
      ...template,
      id: roomId,
      std: template.std ? `${floor}${template.std.substring(1)}` : roomId,
      name: roomName,
      floor,
      desc: `${roomName} in Auditorium Block Floor ${floor}.`,
    };
  });
}

export function getInitialBuildingFloors(): Record<number, RoomItem[]> {
  return {
    1: generateDefaultRoomsForFloor(1),
    2: generateDefaultRoomsForFloor(2),
    3: generateDefaultRoomsForFloor(3),
    4: generateDefaultRoomsForFloor(4),
    5: generateDefaultRoomsForFloor(5),
    6: generateDefaultRoomsForFloor(6),
  };
}
