import { useState } from 'react';
import { api, unwrap, errMsg, PageHeader, State, DataTable, useResource } from './shared';

const REPORTS = {
  attendance: {
    label: 'Attendance',
    columns: [
      { key: 'student', label: 'Student', render: (r) => r.student?.name ?? r.studentName ?? '' },
      { key: 'present', label: 'Present' },
      { key: 'absent', label: 'Absent' },
      { key: 'rate', label: 'Rate', render: (r) => `${Math.round(Number(r.rate || 0))}%` },
    ],
  },
  results: {
    label: 'Exam results',
    columns: [
      { key: 'student', label: 'Student', render: (r) => r.student?.name ?? r.studentName ?? '' },
      { key: 'exam', label: 'Exam', render: (r) => r.exam?.name ?? r.examName ?? '' },
      { key: 'marks', label: 'Marks' },
      { key: 'grade', label: 'Grade' },
    ],
  },
  fees: {
    label: 'Fees',
    columns: [
      { key: 'student', label: 'Student', render: (r) => r.student?.name ?? r.studentName ?? '' },
      { key: 'amount', label: 'Billed' },
      { key: 'paid', label: 'Paid' },
      { key: 'status', label: 'Status' },
    ],
  },
};

export default function Reports() {
  const [type, setType] = useState('attendance');
  const [classId, setClassId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [downloading, setDownloading] = useState('');

  const classes = useResource('/classes');
  const params = { classId: classId || undefined, from: from || undefined, to: to || undefined };
  const report = useResource(`/dashboard/reports/${type}`, params);

  const download = async (format) => {
    setDownloading(format);
    try {
      const res = await api.get(`/dashboard/reports/${type}`, { params: { ...params, format }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.alert(errMsg(e));
    } finally {
      setDownloading('');
    }
  };

  const rows = unwrap({ data: report.items });

  return (
    <div className="adm">
      <PageHeader title="Reports" />

      <div className="adm-tools">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Report type">
          {Object.entries(REPORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class">
          <option value="">All classes</option>
          {classes.items.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.name} {c.section}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        <button disabled={!!downloading} onClick={() => download('pdf')}>{downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}</button>
        <button disabled={!!downloading} onClick={() => download('xlsx')}>{downloading === 'xlsx' ? 'Preparing…' : 'Download Excel'}</button>
      </div>

      <State loading={report.loading} error={report.error}
             empty={!report.loading && !report.error && rows.length === 0}
             emptyText="No records match these filters." />
      {!report.loading && !report.error && rows.length > 0 && (
        <DataTable columns={REPORTS[type].columns} rows={rows} />
      )}
    </div>
  );
}
