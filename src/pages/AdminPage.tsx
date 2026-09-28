import React, { useState, useMemo } from 'react';
import { Header } from '../components/ui/Header';
import { BlueprintCanvas } from '../components/2d/BlueprintCanvas';
import { useRooms } from '../context/RoomsContext';
import { RoomItem, SpaceType, EntityItem } from '../types';
import {
  SECTIONS_CONFIG,
  ALL_SECTIONS_LIST,
} from '../data/sectionsData';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  PlusCircle,
  Trash2,
  Building2,
  Layers,
  RotateCcw,
  Search,
  LayoutGrid,
  Sparkles,
  Edit3,
  User as UserIcon,
  GraduationCap,
  FlaskConical,
  Briefcase,
  Coffee,
  X,
  Check,
  Sliders,
  Maximize2,
  ArrowRight,
  Info,
} from 'lucide-react';

export function AdminPage() {
  const {
    currentFloor,
    setCurrentFloor,
    currentFloorMeta,
    rooms,
    addRoomToSection,
    removeRoomFromSection,
    updateRoom,
    resetFloorToDefault,
  } = useRooms();

  const { user } = useAuth();

  // Active Selected Entity for editing / inspecting
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Search & Type Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SpaceType>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'split' | 'table' | 'canvas_only'>('split');

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSectionKey, setAddSectionKey] = useState<string>('65');
  const [addName, setAddName] = useState('');
  const [addType, setAddType] = useState<SpaceType>('classroom');
  const [addCapacity, setAddCapacity] = useState(40);
  const [addDesc, setAddDesc] = useState('');

  // Quick Edit State (for selected room)
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<SpaceType>('classroom');
  const [editCapacity, setEditCapacity] = useState(40);
  const [editDesc, setEditDesc] = useState('');
  const [isEditingActive, setIsEditingActive] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find currently selected room object
  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return rooms[0] || null;
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

  // Sync edit form when selected room changes
  React.useEffect(() => {
    if (selectedRoom) {
      setEditName(selectedRoom.name);
      setEditType(selectedRoom.type);
      setEditCapacity(selectedRoom.capacity || 40);
      setEditDesc(selectedRoom.desc || '');
      setIsEditingActive(false);
    }
  }, [selectedRoom?.id]);

  // Filtered rooms list
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (r.desc && r.desc.toLowerCase().includes(searchFilter.toLowerCase()));
      const matchesType = typeFilter === 'all' || r.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [rooms, searchFilter, typeFilter]);

  // Category counts on current floor
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      classrooms: rooms.filter((r) => r.type === 'classroom').length,
      labs: rooms.filter((r) => r.type === 'lab').length,
      offices: rooms.filter((r) => r.type === 'office' || r.type === 'core').length,
      amenities: rooms.filter((r) => r.type === 'amenity').length,
    };
  }, [rooms]);

  // Handle Save Edited Room
  const handleSaveRoomEdits = () => {
    if (!selectedRoom) return;
    if (!editName.trim()) {
      showToast('⚠️ Please provide a valid room name.');
      return;
    }

    updateRoom(
      selectedRoom.id,
      {
        name: editName.trim(),
        type: editType,
        capacity: Number(editCapacity) || 40,
        desc: editDesc.trim(),
      },
      currentFloor
    );

    setIsEditingActive(false);
    showToast(`✅ Room ${selectedRoom.id} (${editName.trim()}) updated successfully!`);
  };

  // Handle Delete Room
  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (confirm(`Are you sure you want to delete ${roomName} [${roomId}] from Floor ${currentFloor}?`)) {
      removeRoomFromSection(roomId, currentFloor);
      showToast(`🗑️ Room ${roomId} removed. Space rebalanced.`);
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
      }
    }
  };

  // Handle Add New Room Form Submit
  const handleAddNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      showToast('⚠️ Please enter a room name.');
      return;
    }

    const sec = SECTIONS_CONFIG[addSectionKey] || SECTIONS_CONFIG['65'];
    const created = addRoomToSection(
      addSectionKey,
      {
        name: addName.trim(),
        type: addType,
        capacity: Number(addCapacity) || 40,
        desc: addDesc.trim() || `${addName.trim()} located in ${sec.name} (Floor ${currentFloor}).`,
      },
      currentFloor
    );

    setIsAddModalOpen(false);
    setSelectedRoomId(created.id);
    setAddName('');
    setAddDesc('');
    showToast(`🎉 Room ${created.id} (${created.name}) created on Floor ${currentFloor}!`);
  };

  // Helper to render type icons & colors
  const getTypeBadge = (type: SpaceType) => {
    switch (type) {
      case 'classroom':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            <span>Classroom</span>
          </span>
        );
      case 'lab':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FlaskConical className="w-3 h-3 text-emerald-600" />
            <span>Laboratory</span>
          </span>
        );
      case 'office':
      case 'core':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
            <Briefcase className="w-3 h-3 text-purple-600" />
            <span>Faculty</span>
          </span>
        );
      case 'amenity':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <Coffee className="w-3 h-3 text-amber-600" />
            <span>Amenity</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
            <span>{type}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <Header />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subheader: Floor Switcher, Department Info & Quick Actions */}
      <div className="bg-[#fcfaf6] border-b border-[#ded4c0] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        {/* Left: Floor Title & Department */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1e354d] flex items-center justify-center text-[#ded4c0] shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#11202f]">
                Floor {currentFloor} Settings & Classrooms
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#dbe4eb] text-[#1e354d] border border-[#cad7e2]">
                {currentFloorMeta?.department || 'Academic Floor'}
              </span>
              {user && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hidden xl:inline-flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-emerald-600" />
                  <span>{user.displayName}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748b] hidden sm:block">
              Select any class on the floor to edit its name, category, capacity, or add/remove spaces with 1-click.
            </p>
          </div>
        </div>

        {/* Center: Floor Level Switcher */}
        <div className="flex items-center gap-1 bg-[#faf8f3] p-1 rounded-2xl border border-[#ded4c0]">
          <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider hidden md:flex">
            <Layers className="w-3.5 h-3.5 text-[#1e354d]" />
            <span>Floor:</span>
          </div>
          {[1, 2, 3, 4, 5, 6].map((fl) => (
            <button
              key={fl}
              onClick={() => {
                setCurrentFloor(fl);
                setSelectedRoomId(null);
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition ${
                currentFloor === fl
                  ? 'bg-[#1e354d] text-white shadow-md shadow-[#1e354d]/20 scale-105'
                  : 'text-[#475569] hover:bg-white hover:text-[#11202f]'
              }`}
            >
              L{fl}
            </button>
          ))}
        </div>

        {/* Right: Add Class Button & View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Space</span>
          </button>

          <div className="flex items-center gap-1 bg-[#faf8f3] p-1 rounded-xl border border-[#ded4c0] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'split' ? 'bg-[#1e354d] text-white shadow-xs' : 'text-[#475569] hover:text-[#11202f]'
              }`}
              title="Split View: Management Panel + Interactive Blueprint"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'table' ? 'bg-[#1e354d] text-white shadow-xs' : 'text-[#475569] hover:text-[#11202f]'
              }`}
              title="Full Spaces Registry Table"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Registry</span>
            </button>
            <button
              onClick={() => setActiveTab('canvas_only')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                activeTab === 'canvas_only' ? 'bg-[#1e354d] text-white shadow-xs' : 'text-[#475569] hover:text-[#11202f]'
              }`}
              title="Full Blueprint Preview"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: SPLIT VIEW (Management Sidebar + Interactive Blueprint) */}
        {activeTab === 'split' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Classroom Selection, Filters & Active Settings */}
            <div className="w-full lg:w-[460px] xl:w-[500px] p-4 sm:p-5 overflow-y-auto border-r border-[#ded4c0]/70 bg-white space-y-4 flex-shrink-0 flex flex-col">
              
              {/* Floor Stats Pill Row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total</span>
                  <span className="font-mono text-sm font-black text-slate-800">{stats.total}</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-600 uppercase block">Classes</span>
                  <span className="font-mono text-sm font-black text-blue-700">{stats.classrooms}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Labs</span>
                  <span className="font-mono text-sm font-black text-emerald-700">{stats.labs}</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-200 text-center">
                  <span className="text-[10px] font-bold text-purple-600 uppercase block">Offices</span>
                  <span className="font-mono text-sm font-black text-purple-700">{stats.offices}</span>
                </div>
              </div>

              {/* Selected Room Settings Inspector Card */}
              {selectedRoom ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                        {selectedRoom.id}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          Floor {currentFloor} Selected Space
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                          {selectedRoom.name}
                        </h3>
                      </div>
                    </div>
                    {getTypeBadge(selectedRoom.type)}
                  </div>

                  {/* Inspector Details / Inline Editing */}
                  {isEditingActive ? (
                    <div className="space-y-3 pt-2 border-t border-blue-200/60">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                          Space / Classroom Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            Category / Type
                          </label>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as SpaceType)}
                            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                          >
                            <option value="classroom">Classroom</option>
                            <option value="lab">Laboratory</option>
                            <option value="office">Faculty Office</option>
                            <option value="amenity">Amenity / Restroom</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            Capacity (Seats)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={600}
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                          Description / Equipment
                        </label>
                        <textarea
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleSaveRoomEdits}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={() => setIsEditingActive(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-blue-200/60 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Capacity:</span>
                        <span className="font-bold text-slate-900">{selectedRoom.capacity || 40} seats</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Zone Location:</span>
                        <span className="font-medium text-slate-900">
                          {SECTIONS_CONFIG[`${selectedRoom.row}${selectedRoom.col}`]?.name || `Section ${selectedRoom.row}${selectedRoom.col}`}
                        </span>
                      </div>
                      {selectedRoom.desc && (
                        <p className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-xl border border-blue-100">
                          "{selectedRoom.desc}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setIsEditingActive(true)}
                          className="flex-1 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(selectedRoom.id, selectedRoom.name)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                          title="Delete space"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  Select any classroom from the list or click directly on the blueprint to view and edit its settings.
                </div>
              )}

              {/* Search & Category Filter */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Floor {currentFloor} Spaces ({filteredRooms.length})
                  </label>
                  <button
                    onClick={() => {
                      if (confirm(`Reset Floor ${currentFloor} to default architectural layout?`)) {
                        resetFloorToDefault(currentFloor);
                        showToast(`🔄 Reset Floor ${currentFloor} to defaults.`);
                      }
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Floor</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by name, room code..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none transition"
                  />
                </div>

                {/* Category Pills Filter */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'classroom', label: 'Classrooms' },
                    { key: 'lab', label: 'Labs' },
                    { key: 'office', label: 'Faculty' },
                    { key: 'amenity', label: 'Amenities' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setTypeFilter(cat.key as any)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                        typeFilter === cat.key
                          ? 'bg-[#1e354d] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classrooms List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[340px] lg:max-h-none">
                {filteredRooms.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No matching spaces found on Floor {currentFloor}.
                  </div>
                ) : (
                  filteredRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-400/50'
                            : 'bg-slate-50/60 hover:bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div
                            className={`w-10 h-7 rounded-lg font-mono font-bold text-[11px] flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {room.id}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs truncate">{room.name}</h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="capitalize">{room.type}</span>
                              <span>•</span>
                              <span>{room.capacity || 40} seats</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoomId(room.id);
                              setIsEditingActive(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100/50"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoom(room.id, room.name);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Interactive Live Blueprint Canvas */}
            <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
              <div className="absolute top-4 left-6 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-200 shadow-md text-xs font-semibold text-blue-800 flex items-center gap-2 pointer-events-none">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>
                  Floor {currentFloor} Blueprint — {selectedRoom ? `Selected: ${selectedRoom.name} (${selectedRoom.id})` : 'Click any room to edit'}
                </span>
              </div>

              <BlueprintCanvas
                activeRoute={null}
                selectedEntity={selectedRoom as EntityItem}
                onSelectEntity={(ent) => {
                  setSelectedRoomId(ent.id);
                }}
                onClearRoute={() => {}}
                onOpenInspector={() => {}}
              />
            </div>
          </div>
        )}

        {/* TAB 2: FULL TABLE REGISTRY */}
        {activeTab === 'table' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Floor {currentFloor} Spaces Registry ({filteredRooms.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete registry of classrooms, laboratories, studios, and faculty rooms
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search rooms..."
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Room</span>
                </button>
              </div>
            </div>

            {/* Spaces Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Room Code</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Zone / Wing</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{room.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{room.name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {SECTIONS_CONFIG[`${room.row}${room.col}`]?.name || `Row ${room.row} Col ${room.col}`}
                      </td>
                      <td className="py-3 px-4">{getTypeBadge(room.type)}</td>
                      <td className="py-3 px-4 text-slate-600">{room.capacity || 40} seats</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{room.desc || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              setActiveTab('split');
                              setIsEditingActive(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id, room.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FULLSCREEN CANVAS PREVIEW */}
        {activeTab === 'canvas_only' && (
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            <BlueprintCanvas
              activeRoute={null}
              selectedEntity={selectedRoom as EntityItem}
              onSelectEntity={(ent) => {
                setSelectedRoomId(ent.id);
              }}
              onClearRoute={() => {}}
              onOpenInspector={() => {}}
            />
          </div>
        )}
      </div>

      {/* Add New Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-[#fcfaf6] border-b border-[#ded4c0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Add New Space to Floor {currentFloor}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Auto-assigns coordinates and balances wing layout
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewRoom} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Space / Classroom Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Collaborative Design Studio 605"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Wing / Zone Location on Floor {currentFloor}
                </label>
                <select
                  value={addSectionKey}
                  onChange={(e) => setAddSectionKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                >
                  {ALL_SECTIONS_LIST.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} (Sec {sec.row}{sec.col})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as SpaceType)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="classroom">Classroom / Lecture</option>
                    <option value="lab">Specialized Lab</option>
                    <option value="office">Faculty / Staff Cabin</option>
                    <option value="amenity">Amenity / Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={addCapacity}
                    onChange={(e) => setAddCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description / Features (Optional)
                </label>
                <textarea
                  rows={2}
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  placeholder="e.g. Equipped with smart display and high-performance workstations."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Space</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
