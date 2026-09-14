import React, { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import type { Subject } from '../types';
import { BookOpen, Plus, Trash2, Edit3, Save, X } from 'lucide-react';

export const SubjectsModule: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSchedule();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 9');
  const [weeklyFrequency, setWeeklyFrequency] = useState(4);
  const [color, setColor] = useState('#3b82f6');

  const resetForm = () => {
    setName('');
    setCode('');
    setGradeLevel('Grade 9');
    setWeeklyFrequency(4);
    setColor('#3b82f6');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setGradeLevel(sub.gradeLevel);
    setWeeklyFrequency(sub.weeklyFrequency);
    setColor(sub.color);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingId) {
      updateSubject({
        id: editingId,
        name,
        code,
        gradeLevel,
        weeklyFrequency,
        color
      });
    } else {
      addSubject({
        name,
        code,
        gradeLevel,
        weeklyFrequency,
        color
      });
    }
    resetForm();
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2><BookOpen className="icon" /> Subjects & Curriculum Module</h2>
          <p>Define subject parameters, target grade levels, and required weekly frequencies for automated master schedule allocation.</p>
        </div>
        {!isAdding && !editingId && (
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            <Plus className="icon-sm" /> Add New Subject
          </button>
        )}
      </div>

      {/* Add / Edit Form Panel */}
      {(isAdding || editingId) && (
        <form className="crud-form-panel" onSubmit={handleSave}>
          <h3>{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Subject Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Advanced Mathematics"
              />
            </div>

            <div className="form-group">
              <label>Course Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. MATH201"
              />
            </div>

            <div className="form-group">
              <label>Grade / Year Level</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Required Weekly Frequency (Periods/Week)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={weeklyFrequency}
                onChange={e => setWeeklyFrequency(parseInt(e.target.value) || 1)}
              />
              <small className="help-text">Number of times this subject must be taught per week per section.</small>
            </div>

            <div className="form-group">
              <label>Badge Color Tag</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="color-input"
                />
                <span className="color-hex-label">{color}</span>
              </div>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X className="icon-sm" /> Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="icon-sm" /> {editingId ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      )}

      {/* Subjects Table / Cards View */}
      <div className="data-table-card">
        <table className="crud-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Course Code</th>
              <th>Subject Name</th>
              <th>Grade Level</th>
              <th>Weekly Frequency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-td">No subjects defined yet. Click "Add New Subject" above.</td>
              </tr>
            ) : (
              subjects.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <span className="color-dot" style={{ backgroundColor: sub.color }} />
                  </td>
                  <td><strong>{sub.code}</strong></td>
                  <td>{sub.name}</td>
                  <td><span className="badge-pill gray">{sub.gradeLevel}</span></td>
                  <td>
                    <span className="badge-pill blue">{sub.weeklyFrequency} Periods / Wk</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => handleStartEdit(sub)} title="Edit">
                        <Edit3 className="icon-xs" />
                      </button>
                      <button className="btn-icon danger" onClick={() => deleteSubject(sub.id)} title="Delete">
                        <Trash2 className="icon-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
