import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { Classroom } from '../types';
import { School, Plus, Trash2, Edit3, Save, X, Users, Clock, MapPin } from 'lucide-react';

export const ClassroomsModule: React.FC = () => {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useSchedule();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [building, setBuilding] = useState('Science Wing - Bldg A');
  const [availableFrom, setAvailableFrom] = useState('08:00');
  const [availableTo, setAvailableTo] = useState('16:00');

  const resetForm = () => {
    setRoomNumber('');
    setName('');
    setCapacity(30);
    setBuilding('Science Wing - Bldg A');
    setAvailableFrom('08:00');
    setAvailableTo('16:00');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (c: Classroom) => {
    setEditingId(c.id);
    setRoomNumber(c.roomNumber);
    setName(c.name);
    setCapacity(c.capacity);
    setBuilding(c.building);
    setAvailableFrom(c.availableFrom);
    setAvailableTo(c.availableTo);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !name.trim()) return;

    if (editingId) {
      updateClassroom({
        id: editingId,
        roomNumber,
        name,
        capacity,
        building,
        availableFrom,
        availableTo
      });
    } else {
      addClassroom({
        roomNumber,
        name,
        capacity,
        building,
        availableFrom,
        availableTo
      });
    }
    resetForm();
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2><School className="icon" /> Classrooms & Labs Module</h2>
          <p>Configure room names, numbers, seat capacities, building wings, and operational availability windows.</p>
        </div>
        {!isAdding && !editingId && (
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus className="icon-sm" /> Add New Classroom
          </button>
        )}
      </div>

      {/* Add / Edit Form Panel */}
      {(isAdding || editingId) && (
        <form className="crud-form-panel" onSubmit={handleSave}>
          <h3>{editingId ? 'Edit Classroom Details' : 'Add New Classroom'}</h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Room Number / ID</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 101"
              />
            </div>

            <div className="form-group">
              <label>Classroom Name / Description</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Physics & Robotics Lab"
              />
            </div>

            <div className="form-group">
              <label>Building / Campus Location</label>
              <input
                type="text"
                required
                value={building}
                onChange={e => setBuilding(e.target.value)}
                placeholder="e.g. Science Wing - Bldg A"
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Seat Capacity (Students)</label>
              <input
                type="number"
                min="10"
                max="200"
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value) || 30)}
              />
            </div>

            <div className="form-group">
              <label>Operational Hours From</label>
              <input
                type="time"
                value={availableFrom}
                onChange={e => setAvailableFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Operational Hours To</label>
              <input
                type="time"
                value={availableTo}
                onChange={e => setAvailableTo(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X className="icon-sm" /> Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="icon-sm" /> {editingId ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      )}

      {/* Classrooms Grid List */}
      <div className="classrooms-grid">
        {classrooms.map(room => (
          <div key={room.id} className="classroom-card">
            <div className="room-card-header">
              <div className="room-title">
                <span className="room-badge">{room.roomNumber}</span>
                <h3>{room.name}</h3>
              </div>
              <div className="card-top-actions">
                <button className="btn-icon" onClick={() => handleStartEdit(room)} title="Edit">
                  <Edit3 className="icon-xs" />
                </button>
                <button className="btn-icon danger" onClick={() => deleteClassroom(room.id)} title="Delete">
                  <Trash2 className="icon-xs" />
                </button>
              </div>
            </div>

            <div className="room-details-list">
              <div className="detail-item">
                <MapPin className="icon-xs text-muted" />
                <span><strong>Building:</strong> {room.building}</span>
              </div>
              <div className="detail-item">
                <Users className="icon-xs text-muted" />
                <span><strong>Capacity:</strong> {room.capacity} Students</span>
              </div>
              <div className="detail-item">
                <Clock className="icon-xs text-muted" />
                <span><strong>Available:</strong> {room.availableFrom} - {room.availableTo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
