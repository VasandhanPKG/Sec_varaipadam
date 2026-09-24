import React, { useState, useMemo } from 'react';
import { Header } from '../components/ui/Header';
import { BlueprintCanvas } from '../components/2d/BlueprintCanvas';
import { useRooms } from '../context/RoomsContext';
import { RoomItem, SpaceType } from '../types';
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

  // Active Selected Section for Section Management (Default to Section 65: Row 6, Col 5)
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('65');

  // Form State for Adding Class to Selected Section
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<SpaceType>('classroom');
  const [newRoomCapacity, setNewRoomCapacity] = useState(40);
  const [newRoomDesc, setNewRoomDesc] = useState('');

  // Editing modal / inline state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState(40);
  const [editType, setEditType] = useState<SpaceType>('classroom');

  // Search & Status
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTypeFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'section_manager' | 'all_rooms' | 'preview'>('section_manager');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentSection = SECTIONS_CONFIG[selectedSectionKey] || SECTIONS_CONFIG['65'];

  // Get all rooms that currently belong to the selected section on active floor
  const sectionRooms = useMemo(() => {
    return rooms.filter(
      (r) => r.row === currentSection.row && r.col === currentSection.col
    );
  }, [rooms, currentSection]);

  // Handle adding class into current section on active floor
  const handleAddClassToSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      showToast('⚠️ Please enter a room name.');
      return;
    }

    const created = addRoomToSection(selectedSectionKey, {
      name: newRoomName.trim(),
      type: newRoomType,
      capacity: Number(newRoomCapacity) || 40,
      desc: newRoomDesc.trim() || `${newRoomName} in Section ${currentSection.row}${currentSection.col} (Floor ${currentFloor}).`,
    }, currentFloor);

    showToast(`✅ Room ${created.id} (${created.name}) added to Floor ${currentFloor} Section ${selectedSectionKey}!`);
    setNewRoomName('');
    setNewRoomDesc('');
  };

  // Handle removing class from section
  const handleRemoveClass = (roomId: string, roomName: string) => {
    if (confirm(`Remove ${roomName} [${roomId}] from Floor ${currentFloor} Section ${selectedSectionKey}?`)) {
      removeRoomFromSection(roomId, currentFloor);
      showToast(`🗑️ Room ${roomId} removed. Remaining rooms rebalanced.`);
    }
  };

  // Handle saving room edits
  const handleSaveEdit = (roomId: string) => {
    updateRoom(roomId, {
      name: editName.trim(),
      capacity: Number(editCapacity) || 30,
      type: editType,
    }, currentFloor);
    setEditingRoomId(null);
    showToast(`💾 Room ${roomId} updated on Floor ${currentFloor}.`);
  };

  const startEdit = (room: RoomItem) => {
    setEditingRoomId(room.id);
    setEditName(room.name);
    setEditCapacity(room.capacity || 40);
    setEditType(room.type);
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || r.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <Header />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Subheader / Floor Bar */}
      <div className="bg-[#fcfaf6] border-b border-[#ded4c0] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1e354d] flex items-center justify-center text-[#ded4c0] shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#11202f]">
                Floor {currentFloor} Studio
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#dbe4eb] text-[#1e354d] border border-[#cad7e2]">
                {currentFloorMeta?.department || 'Department'}
              </span>
              {user && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hidden xl:inline-flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-emerald-600" />
                  <span>{user.displayName} ({user.role})</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b] font-sans hidden sm:block">
              Add and remove classrooms independently for each floor with automatic spatial distribution
            </p>
          </div>
        </div>

        {/* Floor Level Quick Switcher */}
        <div className="flex items-center gap-1 bg-[#faf8f3] p-1 rounded-2xl border border-[#ded4c0]">
          <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider hidden md:flex">
            <Layers className="w-3.5 h-3.5 text-[#1e354d]" />
            <span>Floor:</span>
          </div>
          {[1, 2, 3, 4, 5, 6].map((fl) => (
            <button
              key={fl}
              onClick={() => setCurrentFloor(fl)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition ${
                currentFloor === fl
                  ? 'bg-[#1e354d] text-white shadow-md shadow-[#1e354d]/20 scale-105'
                  : 'text-[#475569] hover:bg-white hover:text-[#11202f]'
              }`}
            >
              Floor {fl}
            </button>
          ))}
        </div>

        {/* View mode tabs */}
        <div className="flex items-center gap-1.5 bg-[#faf8f3] p-1 rounded-xl border border-[#ded4c0] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('section_manager')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'section_manager'
                ? 'bg-[#1e354d] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#11202f]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Section Manager</span>
          </button>
          <button
            onClick={() => setActiveTab('all_rooms')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'all_rooms'
                ? 'bg-[#1e354d] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#11202f]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">All Floor Spaces</span> ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-[#1e354d] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#11202f]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: SECTION MANAGER */}
        {activeTab === 'section_manager' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Section Selector & Classrooms Management */}
            <div className="w-full lg:w-[480px] xl:w-[520px] p-4 sm:p-5 overflow-y-auto border-r border-blue-100 bg-white space-y-4 sm:space-y-5 flex-shrink-0">
              {/* Section Selector Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Section Matrix on Floor {currentFloor} (Row × Col)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_SECTIONS_LIST.map((sec) => {
                    const count = rooms.filter((r) => r.row === sec.row && r.col === sec.col).length;
                    const isSelected = selectedSectionKey === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setSelectedSectionKey(sec.id)}
                        className={`p-2.5 rounded-xl border text-left transition relative ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-xs">
                            Sec {sec.row}{sec.col}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {count} {count === 1 ? 'room' : 'rooms'}
                          </span>
                        </div>
                        <div
                          className={`text-[10px] truncate mt-1 ${
                            isSelected ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          R{sec.row} C{sec.col}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Selected Section Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                      Floor {currentFloor} • Section {currentSection.row}{currentSection.col}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">
                      {currentSection.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-black text-blue-700">
                      {sectionRooms.length}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Active Classes
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  Adding or deleting classes in this section automatically recalculates room widths and assigns 4-digit codes ({currentFloor}{currentSection.row}{currentSection.col}1, {currentFloor}{currentSection.row}{currentSection.col}2...).
                </p>
              </div>

              {/* Quick Add Class Form */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <span>Add Class to Floor {currentFloor} Section {currentSection.row}{currentSection.col}</span>
                </h4>

                <form onSubmit={handleAddClassToSection} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Classroom / Space Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder={`e.g. Lab ${currentFloor}${currentSection.row}${currentSection.col}${sectionRooms.length + 1}`}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Category
                      </label>
                      <select
                        value={newRoomType}
                        onChange={(e) => setNewRoomType(e.target.value as SpaceType)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm"
                      >
                        <option value="classroom">Classroom</option>
                        <option value="lab">Lab</option>
                        <option value="amenity">Amenity / Lounge</option>
                        <option value="core">Faculty Office</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Capacity (Seats)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={600}
                        value={newRoomCapacity}
                        onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add to Floor {currentFloor} Section {currentSection.row}{currentSection.col}</span>
                  </button>
                </form>
              </div>

              {/* Classrooms List in this Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">
                    Classes in Section {currentSection.row}{currentSection.col} ({sectionRooms.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Click delete to reduce classes
                  </span>
                </div>

                {sectionRooms.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    No classrooms currently in this section. Add one above!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sectionRooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition space-y-2"
                      >
                        {editingRoomId === room.id ? (
                          /* Inline Edit Mode */
                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                Room Name
                              </label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                  Category
                                </label>
                                <select
                                  value={editType}
                                  onChange={(e) => setEditType(e.target.value as SpaceType)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                                >
                                  <option value="classroom">Classroom</option>
                                  <option value="lab">Lab</option>
                                  <option value="amenity">Amenity</option>
                                  <option value="core">Faculty</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                  Seats
                                </label>
                                <input
                                  type="number"
                                  value={editCapacity}
                                  onChange={(e) => setEditCapacity(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleSaveEdit(room.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingRoomId(null)}
                                className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode Card */
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-11 h-9 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                                {room.id}
                              </div>
                              <div>
                                <h5 className="font-bold text-xs text-slate-900">
                                  {room.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] uppercase font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                                    {room.type}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {room.capacity} seats
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => startEdit(room)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Edit Room"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveClass(room.id, room.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete from section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Interactive Blueprint Canvas */}
            <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
              <div className="absolute top-4 left-6 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-200 shadow-md text-xs font-semibold text-blue-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Floor {currentFloor} Blueprint Preview — Section {currentSection.row}{currentSection.col} Selected</span>
              </div>
              <BlueprintCanvas
                activeRoute={null}
                selectedEntity={sectionRooms[0] || null}
                onSelectEntity={() => {}}
                onClearRoute={() => {}}
                onOpenInspector={() => {}}
              />
            </div>
          </div>
        )}

        {/* TAB 2: LIST & MANAGE ALL ROOMS ON ACTIVE FLOOR */}
        {activeTab === 'all_rooms' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Floor {currentFloor} Spaces ({rooms.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentFloorMeta?.department || 'Department'} — registry of classrooms, labs, and studios
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search rooms..."
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Reset Floor ${currentFloor} back to default template?`)) {
                      resetFloorToDefault(currentFloor);
                      showToast(`🔄 Reset Floor ${currentFloor} to default template.`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Floor {currentFloor}</span>
                </button>
              </div>
            </div>

            {/* Spaces Table */}
            <div className="border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-blue-100">
                  <tr>
                    <th className="py-3 px-4">Room Number</th>
                    <th className="py-3 px-4">Section (Row × Col)</th>
                    <th className="py-3 px-4">Room Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-blue-50/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {room.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        Sec {room.row}{room.col}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {room.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                          {room.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {room.capacity || '-'} seats
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveClass(room.id, room.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FULLSCREEN PREVIEW */}
        {activeTab === 'preview' && (
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            <BlueprintCanvas
              activeRoute={null}
              selectedEntity={null}
              onSelectEntity={() => {}}
              onClearRoute={() => {}}
              onOpenInspector={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminPage;
