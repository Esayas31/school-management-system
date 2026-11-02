import { useState } from 'react';
import { useResource, PageHeader, State, Modal, EntityForm, errMsg, unwrap, api } from './shared';
import { useEffect } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const fields = [
  { name: 'day', label: 'Day', type: 'select', options: DAYS, required: true },
  { name: 'startTime', label: 'Start', type: 'time', required: true },
  { name: 'endTime', label: 'End', type: 'time', required: true },
  { name: 'subjectId', label: 'Subject', type: 'select', optionsFrom: '/subjects', required: true },
  { name: 'teacherId', label: 'Teacher', type: 'select', optionsFrom: '/teachers', required: true },
];

export default function Timetable() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = unwrap(await api.get('/classes'));
        setClasses(list);
        if (list[0]) setClassId(list[0]._id || list[0].id);
      } catch { /* the table below shows its own error */ }
    })();
  }, []);

  const { items, loading, error, save, remove } = useResource('/timetable', { classId });

  const slotsFor = (day) =>
    items.filter((s) => s.day === day).sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));

  const onSubmit = async (values) => {
    await save({ ...values, classId }, editing._id || editing.id);
    setEditing(null);
  };

  const onDelete = async (s) => {
    if (!window.confirm('Remove this period from the timetable?')) return;
    try { await remove(s._id || s.id); } catch (e) { window.alert(errMsg(e)); }
  };

  return (
    <div className="adm">
      <PageHeader title="Timetable" actionLabel="Add period" onAction={() => classId && setEditing({})} />
      <div className="adm-tools">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Select class">
          {classes.length === 0 && <option value="">No classes yet</option>}
          {classes.map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.name} {c.section}</option>
          ))}
        </select>
      </div>

      <State loading={loading && !!classId} error={error} />

      {classId && !loading && !error && (
        <div className="adm-grid-tt">
          {DAYS.map((day) => (
            <div className="adm-day" key={day}>
              <h3>{day}</h3>
              {slotsFor(day).length === 0 && <small>No periods</small>}
              {slotsFor(day).map((s) => (
                <div className="adm-slot" key={s._id || s.id}>
                  <strong>{s.startTime} to {s.endTime}</strong>
                  <small>{s.subjectId?.name ?? s.subject?.name}</small>
                  <small>{s.teacherId?.name ?? s.teacher?.name}</small>
                  <button onClick={() => setEditing(s)}>Edit</button>
                  <button className="danger" onClick={() => onDelete(s)}>Remove</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id || editing.id ? 'Edit period' : 'Add period'} onClose={() => setEditing(null)}>
          <EntityForm fields={fields} initial={editing} onSubmit={onSubmit} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
