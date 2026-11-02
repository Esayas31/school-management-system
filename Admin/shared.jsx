import { useState, useEffect, useCallback } from 'react';
import api from '../frontend/Api/client'; // adjust path if your client lives elsewhere
import './admin.css';

export { api };

export const unwrap = (res) => res?.data?.data ?? res?.data ?? [];
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export const money = (n) => Number(n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

/* Loads a list from the API and gives create, update and delete helpers */
export function useResource(path, params) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(params || {});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(unwrap(await api.get(path, { params: JSON.parse(key) })));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [path, key]);

  useEffect(() => { load(); }, [load]);

  const save = async (data, id) => {
    if (id) await api.put(`${path}/${id}`, data);
    else await api.post(path, data);
    await load();
  };
  const remove = async (id) => { await api.delete(`${path}/${id}`); await load(); };

  return { items, loading, error, reload: load, save, remove };
}

export function PageHeader({ title, actionLabel, onAction }) {
  return (
    <div className="adm-head">
      <h1>{title}</h1>
      {actionLabel && <button className="primary" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

export function Badge({ value }) {
  if (!value) return null;
  return <span className={`badge ${String(value).toLowerCase()}`}>{value}</span>;
}

export function State({ loading, error, empty, emptyText = 'Nothing here yet.' }) {
  if (loading) return <div className="adm-loading">Loading…</div>;
  if (error) return <div className="adm-error">{error}</div>;
  if (empty) return <div className="adm-empty">{emptyText}</div>;
  return null;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="adm-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="adm-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id || r.id}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
              {(onEdit || onDelete) && (
                <td className="actions">
                  {onEdit && <button onClick={() => onEdit(r)}>Edit</button>}
                  {onDelete && <button className="danger" onClick={() => onDelete(r)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/*
  fields: [{ name, label, type, required, options, optionsFrom, optionLabel }]
  type: text | email | number | date | time | select
  options: ['a','b'] or [{value,label}]
  optionsFrom: '/classes' loads select options from the API (optionLabel = field to show)
*/
export function EntityForm({ fields, initial = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState(initial);
  const [remote, setRemote] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fields.filter((f) => f.optionsFrom).forEach(async (f) => {
      try {
        const list = unwrap(await api.get(f.optionsFrom));
        setRemote((p) => ({
          ...p,
          [f.name]: list.map((o) => ({ value: o._id || o.id, label: o[f.optionLabel || 'name'] })),
        }));
      } catch { setRemote((p) => ({ ...p, [f.name]: [] })); }
    });
  }, [fields]);

  const change = (name, value) => setValues((p) => ({ ...p, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try { await onSubmit(values); } catch (ex) { setErr(errMsg(ex)); setSaving(false); }
  };

  const optionsFor = (f) =>
    (f.optionsFrom ? remote[f.name] || [] : f.options || []).map((o) =>
      typeof o === 'string' ? { value: o, label: o } : o);

  return (
    <form onSubmit={submit}>
      {fields.map((f) => (
        <label className="adm-field" key={f.name}>
          <span>{f.label}</span>
          {f.type === 'select' ? (
            <select value={values[f.name] ?? ''} required={f.required} onChange={(e) => change(f.name, e.target.value)}>
              <option value="">Select…</option>
              {optionsFor(f).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={f.type || 'text'}
              value={values[f.name] ?? ''}
              required={f.required}
              onChange={(e) => change(f.name, e.target.value)}
            />
          )}
        </label>
      ))}
      {err && <div className="adm-form-error">{err}</div>}
      <div className="adm-form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="primary" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}

/* One reusable page for list + search + add + edit + delete */
export function CrudPage({ title, singular, path, columns, fields, searchKeys = ['name'], summary }) {
  const { items, loading, error, save, remove } = useResource(path);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (new) | record

  const shown = items.filter((r) =>
    searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(query.toLowerCase())));

  const onDelete = async (r) => {
    if (!window.confirm(`Delete this ${singular}? This cannot be undone.`)) return;
    try { await remove(r._id || r.id); } catch (e) { window.alert(errMsg(e)); }
  };

  const onSubmit = async (values) => {
    await save(values, editing._id || editing.id);
    setEditing(null);
  };

  return (
    <div className="adm">
      <PageHeader title={title} actionLabel={`Add ${singular}`} onAction={() => setEditing({})} />
      {summary && !loading && !error && summary(items)}
      <div className="adm-tools">
        <input placeholder={`Search ${title.toLowerCase()}`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`Search ${title}`} />
      </div>
      <State loading={loading} error={error} empty={!loading && !error && shown.length === 0}
             emptyText={query ? 'No matches for that search.' : `No ${title.toLowerCase()} yet. Add the first ${singular}.`} />
      {!loading && !error && shown.length > 0 && (
        <DataTable columns={columns} rows={shown} onEdit={setEditing} onDelete={onDelete} />
      )}
      {editing && (
        <Modal title={editing._id || editing.id ? `Edit ${singular}` : `Add ${singular}`} onClose={() => setEditing(null)}>
          <EntityForm fields={fields} initial={editing} onSubmit={onSubmit} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
