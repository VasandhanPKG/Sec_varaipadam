# SecMap: College Indoor Navigation & 3D Interactive Mapping

**SecMap** is a high-performance indoor navigation and 3D mapping web application for college campus buildings (Saveetha Engineering College). Built with **Next.js (App Router)**, **React**, **Three.js / React Three Fiber**, and **TailwindCSS**, it operates completely client-side using robust **TypeScript data structures** and in-memory/localStorage state.

---

## 🏛️ Key Features

- **Pure Frontend Standalone Architecture**: No external backend or database server required. All building levels (Floors 1–6), sections, classrooms, labs, vertical cores, and corridor graph nodes are modeled in typed TypeScript lists.
- **Interactive 2D Blueprint Canvas**: Accurate architectural floor plan canvas with live room inspection, dynamic section matrix layout balancing, and animated circulation pathways.
- **Realistic 3D Isometric View**: 3D multi-level campus building scene with real-time floor isolation and 3D glowing route tubes through vertical elevator shafts and stairwells.
- **Multi-Floor Dijkstra Indoor Pathfinding**: Computes single-floor and multi-floor routes with automatic elevator/stairway transitions and turn-by-turn guidance.
- **Admin Section Studio**: Interactive floor-by-floor space management with automatic 4-digit spatial coding (`[F][R][C][N]`) and section rebalancing.
- **Instant Search & Autocomplete**: Search across classrooms, labs, faculty rooms, and vertical cores across all 6 floors.

---

## 📁 Project Structure

```
SecMap/
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── admin/
    │   │   │   └── page.tsx              # Admin Section Studio (Floors 1–6)
    │   │   ├── globals.css               # Architectural styling & custom scrollbars
    │   │   ├── layout.tsx                # App root layout with RoomsProvider
    │   │   ├── not-found.tsx             # 404 page
    │   │   └── page.tsx                  # Main 2D/3D Navigation Map
    │   ├── components/
    │   │   ├── 2d/
    │   │   │   └── BlueprintCanvas.tsx   # SVG Blueprint viewer with route overlays
    │   │   ├── 3d/
    │   │   │   └── Building3DScene.tsx   # Three.js 3D Multi-Floor Building Scene
    │   │   ├── navigation/
    │   │   │   └── DirectionsDrawer.tsx  # Turn-by-turn routing drawer
    │   │   └── ui/
    │   │       └── Header.tsx            # Header with search & view toggles
    │   ├── context/
    │   │   └── RoomsContext.tsx          # Multi-floor state & localStorage provider
    │   ├── data/
    │   │   ├── buildingFloorsData.ts     # Floors 1–6 metadata & default room generator
    │   │   ├── floor6Data.ts             # Level 06 blueprint template & graph waypoints
    │   │   └── sectionsData.ts           # Architectural section matrix & auto-layout
    │   ├── lib/
    │   │   └── pathfinding.ts            # Dijkstra shortest path & multi-floor routing
    │   └── types/
    │       └── index.ts                  # TypeScript models & navigation interfaces
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```
