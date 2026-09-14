import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { DoorClosed, Plus, Edit2, Trash2, Check, X, ShieldCheck } from 'lucide-react';

export const ClassroomsModule: React.FC = () => {
  const { classrooms, scheduleSlots, addClassroom, updateClassroom, deleteClassroom } = useSchedule();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');

  const resetForm = () => {
    setRoomNumber('');
    setEditingId(null);
  };

  const handleEdit = (room: typeof classrooms[0]) => {
    setEditingId(room.id);
    setRoomNumber(room.roomNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    if (editingId) {
      updateClassroom(editingId, { roomNumber });
    } else {
      addClassroom({ roomNumber });
    }
    resetForm();
  };

  // Check how many active schedule sessions are in each room
  const getRoomUsageCount = (classroomId: string) => {
    return scheduleSlots.filter(s => s.classroomId === classroomId).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950 flex items-center gap-2">
          <DoorClosed className="w-7 h-7 text-blue-900" />
          Classrooms & Rooms Directory
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Streamlined classroom management keeping active Room Numbers & IDs for automated locking during scheduled sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md h-fit">
          <h2 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5 text-blue-900" /> : <Plus className="w-5 h-5 text-amber-500" />}
            {editingId ? 'Edit Room Identifier' : 'Add New Classroom'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number / ID</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 101, Lab 201, Aud 301"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-900 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Save Room' : 'Add Room'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-3 rounded-lg text-sm flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Classrooms List Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {classrooms.map(room => {
            const usageCount = getRoomUsageCount(room.id);
            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-900/40 transition shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-md text-sm font-bold bg-blue-50 text-blue-900 border border-blue-200">
                      {room.roomNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Auto-Locking Active
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Total Scheduled Sessions: <strong className="text-slate-900">{usageCount} sessions</strong></p>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Classroom"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteClassroom(room.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Classroom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {classrooms.length === 0 && (
            <div className="col-span-2 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No classrooms defined yet. Add your first room using the form.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
