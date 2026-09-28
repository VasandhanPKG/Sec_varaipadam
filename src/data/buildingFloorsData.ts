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
    department: "Mechanical Engineering",
    tagline: "Workshops, Thermal & Dynamics Labs (0481-0872)",
    accentColor: "#2563eb"
  },
  2: {
    floor: 2,
    name: "1st Floor",
    department: "Information Technology (IT)",
    tagline: "Software Laboratories & Systems Studios (1411-1873)",
    accentColor: "#0284c7"
  },
  3: {
    floor: 3,
    name: "3rd Floor",
    department: "ECE / AIDS",
    tagline: "Electronics & AI Data Science Laboratories (2411-3562)",
    accentColor: "#059669"
  },
  4: {
    floor: 4,
    name: "4th Floor",
    department: "Chemical Engineering",
    tagline: "Chemical Processes & Materials Laboratories (4331-4682)",
    accentColor: "#7c3aed"
  },
  5: {
    floor: 5,
    name: "5th Floor",
    department: "Biomedical Engineering",
    tagline: "Biomedical Systems & Diagnostic Hub (5331-5874)",
    accentColor: "#d97706"
  },
  6: {
    floor: 6,
    name: "6th Floor",
    department: "MBA (Management Studies)",
    tagline: "MBA Executive Studios & Grand Auditorium (6411-6683)",
    accentColor: "#e11d48"
  },
};

export function generateDefaultRoomsForFloor(floor: number): RoomItem[] {
  if (floor === 6) {
    // 6TH FLOOR — MBA
    return FLOOR_6_DEFAULT_ROOMS.map((r) => {
      let updatedName = r.name;
      let updatedDesc = r.desc;
      if (r.id === "6151") {
        updatedName = "Main Auditorium";
        updatedDesc = "Grand Auditorium with Tiered Seating.";
      } else if (["6871", "6872", "6771", "6731", "6732"].includes(r.id)) {
        updatedName = `MBA Staff Room (${r.id})`;
        updatedDesc = `6th Floor MBA Faculty & Department Staff Room.`;
      } else if (r.name.startsWith("Classroom")) {
        updatedName = `MBA ${r.id}`;
        updatedDesc = `MBA Lecture Studio ${r.id}.`;
      }
      return {
        ...r,
        name: updatedName,
        desc: updatedDesc,
        floor: 6,
      };
    });
  }

  // Define floor department prefixes and room titles
  const floorNamePrefixes: Record<number, Record<string, string>> = {
    // GROUND FLOOR — MECHANICAL ENGINEERING (0481-0872)
    1: {
      "83": "Mech Student Affairs Suite",
      "85_1": "Mech CAD Lab (0851)",
      "85_2": "Mech Simulation Bay (0852)",
      "85_3": "Thermal Engineering Lab (0853)",
      "85_4": "Fluid Mechanics Bay (0854)",
      "87_1": "Mech Metrology Lab (0871)",
      "87_2": "Dynamics Research Lab (0872)",
      "73_1": "Mech Faculty Office (0731)",
      "73_2": "Senior Faculty Cabin (0732)",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Mechanical Conference Hall (0771)",
      "77_2": "Department HOD (0772)",
      "61_1": "Mech Workshop Studio (0611)",
      "61_2": "Mech Workshop Studio (0612)",
      "61_3": "Mech Workshop Studio (0613)",
      "65_1": "Manufacturing Systems (0651)",
      "65_2": "CNC Prototyping Bay (0652)",
      "65_3": "Robotics & Automation",
      "68_1": "Kinematics Lab (0681)",
      "68_2": "Rapid Prototyping Bay",
      "68_3": "Automotive Engineering",
      "51_1": "Restroom Men (0511)",
      "51_2": "Restroom Women (0512)",
      "54_1": "Design Drafting Studio (0541)",
      "54_2": "Engineering Graphics (0542)",
      "56_1": "Mechanical Testing Pen",
      "56_2": "Additive Manufacturing",
      "57_1": "Foundry Lab (0571)",
      "57_2": "Welding Tech Bay (0572)",
      "58_1": "Machine Tools Workshop (0581)",
      "58_2": "Heavy Machines Lab (0582)",
      "41_1": "Mech Lecture Hall (0411)",
      "41_2": "Mech Lecture Hall (0412)",
      "45_1": "Mech Classroom (0451)",
      "45_2": "Mech Classroom (0452)",
      "45_3": "Mech Classroom (0453)",
      "45_4": "Mech Classroom (0454)",
      "48_1": "Mech Lecture Theater (0481)",
      "48_2": "Mech Lecture Theater (0482)",
      "48_3": "Mech Seminar Room (0483)",
      "33_1": "Staff Cabin South (0331)",
      "33_2": "Staff Cabin South (0332)",
      "37_1": "Project Demo Hall (0371)",
      "37_2": "Mech Department Archive (0372)",
      "15": "Mechanical Engineering Foyer"
    },

    // 1ST FLOOR — IT (1411-1873)
    2: {
      "83": "IT Student Lounge (1831)",
      "85_1": "Software Engineering Lab (1851)",
      "85_2": "Web Technologies Hub (1852)",
      "85_3": "Cloud Computing Studio (1853)",
      "85_4": "Distributed Systems Bay (1854)",
      "87_1": "IT Resource Center (1871)",
      "87_2": "Database Management Lab (1872)",
      "87_3": "Big Data Analytics (1873)",
      "73_1": "IT Faculty Cabin (1731)",
      "73_2": "IT Faculty Cabin (1732)",
      "73_3": "Restroom (Men & Women)",
      "77_1": "IT Boardroom (1771)",
      "77_2": "Department HOD (IT) (1772)",
      "61_1": "IT Lecture Hall (1611)",
      "61_2": "IT Lecture Hall (1612)",
      "61_3": "IT Lecture Hall (1613)",
      "65_1": "Full Stack Dev Studio (1651)",
      "65_2": "Mobile Computing Lab (1652)",
      "65_3": "Virtualization Center",
      "68_1": "Cyber Security Operations (1681)",
      "68_2": "Ethical Hacking Lab (1682)",
      "68_3": "Network Protocol Lab (1683)",
      "51_1": "Restroom Men (1511)",
      "51_2": "Restroom Women (1512)",
      "54_1": "IT Innovation Studio (1541)",
      "54_2": "Systems Design Room (1542)",
      "56_1": "Algorithms Studio (1561)",
      "56_2": "Parallel Computing (1562)",
      "56_3": "Data Structures Hub (1563)",
      "58_1": "IT Hardware Bay (1581)",
      "58_2": "Network Server Room (1582)",
      "41_1": "IT Classroom (1411)",
      "41_2": "IT Classroom (1412)",
      "45_1": "IT Seminar Hall (1451)",
      "45_2": "IT Seminar Hall (1452)",
      "45_3": "IT Seminar Hall (1453)",
      "45_4": "IT Seminar Hall (1454)",
      "48_1": "Lecture Theater (1481)",
      "48_2": "Lecture Theater (1482)",
      "48_3": "Lecture Theater (1483)",
      "33_1": "IT Staff Room (1331)",
      "33_2": "IT Staff Room (1332)",
      "37_1": "IT Placement Preparation (1371)",
      "37_2": "Industry Relations (1372)",
      "15": "Information Technology Concourse"
    },

    // 3RD FLOOR — ECE / AIDS (2411-3562)
    3: {
      "83": "AIDS Research Lounge",
      "85_1": "AI & Deep Learning Hub (2851)",
      "85_2": "Machine Learning Lab (2852)",
      "85_3": "Data Analytics Studio (2853)",
      "85_4": "Neural Computing Center (2854)",
      "87_0": "Computer Vision Lab (2870)",
      "87_1": "NLP Research Bay (2871)",
      "87_2": "Cognitive Computing Hub (2872)",
      "73_1": "Faculty Suite (2731)",
      "73_2": "Senior Faculty Cabin (2732)",
      "73_3": "Research Advisor Room (2733)",
      "77_1": "AIDS Council Hall (2771)",
      "77_2": "Department HOD (2772)",
      "61_1": "AIDS Lecture Hall (2611)",
      "61_2": "AIDS Lecture Hall (2612)",
      "61_3": "AIDS Lecture Hall (2613)",
      "65_1": "ECE Signal Processing (3561)",
      "65_2": "ECE VLSI Design Center (3562)",
      "65_3": "Digital Circuits Studio",
      "68_1": "Data Science Studio (2681)",
      "68_2": "Big Data Cluster (2682)",
      "68_3": "Cloud Analytics Lab (2683)",
      "51_1": "Restroom Men (2511)",
      "51_2": "Restroom Women (2512)",
      "54_1": "AIDS Discussion Suite (2541)",
      "54_2": "AIDS Discussion Suite (2542)",
      "56_1": "ECE Embedded Systems (2561)",
      "56_2": "ECE Microprocessors (2562)",
      "58_1": "AIDS Testing Lab (2581)",
      "58_2": "Intelligent Systems Lab (2582)",
      "41_1": "AIDS Classroom (2411)",
      "41_2": "AIDS Classroom (2412)",
      "45_1": "Classroom 3451",
      "45_2": "Classroom 3452",
      "45_3": "Classroom 3453",
      "45_4": "Classroom 3454",
      "48_1": "AIDS Seminar Hall (2481)",
      "48_2": "AIDS Seminar Hall (2482)",
      "48_3": "AIDS Seminar Hall (2483)",
      "33_1": "Staff Cabin 3331",
      "33_2": "Staff Cabin 3332",
      "37_1": "AIDS Project Bay (2371)",
      "37_2": "AIDS Project Bay (2372)",
      "15": "ECE & AIDS Digital Convention Arena"
    },

    // 4TH FLOOR — CHEMICAL ENGINEERING (4331-4682)
    4: {
      "83": "Chemical Student Lounge",
      "85_1": "Chemical Reactions Lab (4851)",
      "85_2": "Mass Transfer Studio (4852)",
      "85_3": "Heat Transfer Lab (4853)",
      "85_4": "Thermodynamics Hub (4854)",
      "87_1": "Petrochemical Lab (4871)",
      "87_2": "Polymer Technology Bay (4872)",
      "73_1": "Faculty Suite (4731)",
      "73_2": "Faculty Suite (4732)",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Chemical Council Hall (4771)",
      "77_2": "Department HOD (Chemical) (4772)",
      "61_1": "Chemical Lecture Hall (4611)",
      "61_2": "Chemical Lecture Hall (4612)",
      "61_3": "Chemical Lecture Hall (4613)",
      "61_4": "Chemical Lecture Hall (4614)",
      "65_1": "Process Control Studio (4651)",
      "65_2": "Instrumentation Bay (4652)",
      "65_3": "Industrial Chemistry Lab (4653)",
      "68_1": "Chemical Engineering Lab (4681)",
      "68_2": "Environmental Engineering (4682)",
      "68_3": "Fluid Particle Dynamics",
      "51_1": "Restroom Men (4511)",
      "51_2": "Restroom Women (4512)",
      "54_1": "Chemical Process Studio (4541)",
      "54_2": "Chemical Modeling Lab (4542)",
      "54_3": "Process Safety Hub (4543)",
      "56_1": "Biochemical Process Lab (4561)",
      "56_2": "Biocatalysis Bay (4562)",
      "58_1": "Nanotechnology Lab (4581)",
      "58_2": "Material Science Bay (4582)",
      "41_1": "Chemical Classroom (4411)",
      "41_2": "Chemical Classroom (4412)",
      "41_3": "Chemical Classroom (4413)",
      "41_4": "Chemical Classroom (4414)",
      "45_1": "Chemical Hall (4451)",
      "45_2": "Chemical Hall (4452)",
      "45_3": "Chemical Hall (4453)",
      "45_4": "Chemical Hall (4454)",
      "48_1": "Chemical Seminar Hall (4481)",
      "48_2": "Chemical Seminar Hall (4482)",
      "48_3": "Chemical Seminar Hall (4483)",
      "33_1": "Chemical Staff Room (4331)",
      "33_2": "Chemical Staff Room (4332)",
      "37_1": "Chemical Project Studio (4371)",
      "37_2": "Chemical Project Studio (4372)",
      "15": "Chemical Engineering Theater"
    },

    // 5TH FLOOR — BIOMEDICAL (5331-5874)
    5: {
      "83": "Biomedical Student Lounge",
      "85_1": "Biomedical Studio (5851)",
      "85_2": "Bio-Signal Processing Lab (5852)",
      "85_3": "Medical Electronics Studio (5853)",
      "85_4": "Biomechanics Research Bay (5854)",
      "87_1": "Biomedical Instrumentation (5871)",
      "87_2": "Diagnostic Devices Lab (5872)",
      "87_3": "Bio-Sensors & Telemedicine (5873)",
      "87_4": "Clinical Engineering Studio (5874)",
      "73_1": "Biomedical Faculty Suite (5731)",
      "73_2": "Biomedical Faculty Suite (5732)",
      "73_3": "Restroom (Men & Women)",
      "77_1": "Biomedical Council Hall (5771)",
      "77_2": "Department HOD (Biomedical) (5772)",
      "61_1": "Biomedical Lecture Hall (5611)",
      "61_2": "Biomedical Lecture Hall (5612)",
      "61_3": "Biomedical Lecture Hall (5613)",
      "65_1": "Medical Imaging Studio (5651)",
      "65_2": "CT & MRI Simulation Hub (5652)",
      "65_3": "Ultrasound Systems Lab (5653)",
      "68_1": "Bio-Optics Laboratory (5681)",
      "68_2": "Medical Nanotech Bay (5682)",
      "68_3": "Rehabilitation Engineering (5683)",
      "68_4": "Prosthetics & Orthotics (5684)",
      "51_1": "Restroom Men (5511)",
      "51_2": "Restroom Women (5512)",
      "54_1": "Biomedical Discussion Suite (5411)",
      "54_2": "Biomedical Discussion Suite (5412)",
      "56_1": "Bio-Material Testing Lab (5561)",
      "56_2": "Physiological Modeling Lab (5562)",
      "58_1": "Medical Robotics Lab (5581)",
      "58_2": "Bio-Signal Analysis Hub (5582)",
      "41_1": "Biomedical Classroom (5411)",
      "41_2": "Biomedical Classroom (5412)",
      "45_1": "Biomedical Hall (5451)",
      "45_2": "Biomedical Hall (5452)",
      "45_3": "Biomedical Hall (5453)",
      "45_4": "Biomedical Hall (5454)",
      "48_1": "Biomedical Lecture Theater (5481)",
      "48_2": "Biomedical Lecture Theater (5482)",
      "48_3": "Biomedical Lecture Theater (5483)",
      "33_1": "Biomedical Staff Cabin (5331)",
      "33_2": "Biomedical Staff Cabin (5332)",
      "37_1": "Biomedical Project Lab (5371)",
      "37_2": "Biomedical Project Lab (5372)",
      "15": "Biomedical Science Auditorium Foyer"
    }
  };

  const names = floorNamePrefixes[floor] || floorNamePrefixes[1];

  return FLOOR_6_DEFAULT_ROOMS.map((template) => {
    // Generate floor-specific room code:
    // For Ground Floor (floor 1), also support 0-prefixed codes (e.g. 0481, 0851)
    let roomId = `${floor}${template.row || 4}${template.col || 5}${template.bay || 1}`;
    if (floor === 1) {
      roomId = `0${template.row || 4}${template.col || 5}${template.bay || 1}`;
    } else if (floor === 2) {
      roomId = `1${template.row || 4}${template.col || 5}${template.bay || 1}`;
    } else if (floor === 3) {
      // 3rd Floor supports 2xxx AIDS / 3xxx ECE
      if (template.row === 5 && template.col === 6) {
        roomId = `356${template.bay || 1}`;
      } else {
        roomId = `2${template.row || 4}${template.col || 5}${template.bay || 1}`;
      }
    }

    const key = `${template.row || 4}${template.col || 5}${template.bay ? `_${template.bay}` : ''}`;
    const fallbackKey = `${template.row || 4}${template.col || 5}`;
    const roomName = names[key] || names[fallbackKey] || `${template.name.replace(/6\d\d/, `${floor}01`)}`;

    return {
      ...template,
      id: roomId,
      std: template.std ? `${floor === 1 ? '0' : floor}${template.std.substring(1)}` : roomId,
      name: roomName,
      floor,
      desc: `${roomName} on Floor ${floor} (${FLOORS_META[floor]?.department || 'Academic'}).`,
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
