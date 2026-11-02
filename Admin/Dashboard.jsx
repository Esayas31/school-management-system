import { useEffect, useState } from 'react';
import { api, unwrap, errMsg, money, PageHeader, State } from './shared';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(unwrap(res));
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || error) {
    return <div className="adm"><PageHeader title="Dashboard" /><State loading={loading} error={error} /></div>;
  }

  const d = data || {};
  const attendance = Math.round(Number(d.attendanceRate || 0));
  const collected = Number(d.feesCollected || 0);
  const pending = Number(d.feesPending || 0);
  const collectedPct = collected + pending ? Math.round((collected / (collected + pending)) * 100) : 0;

  return (
    <div className="adm">
      <PageHeader title="Dashboard" />

      <div className="adm-stats">
        <div className="adm-stat"><span>Students</span><strong>{d.students ?? 0}</strong></div>
        <div className="adm-stat"><span>Teachers</span><strong>{d.teachers ?? 0}</strong></div>
        <div className="adm-stat"><span>Classes</span><strong>{d.classes ?? 0}</strong></div>
        <div className="adm-stat"><span>Upcoming exams</span><strong>{d.upcomingExams ?? 0}</strong></div>
      </div>

      <div className="adm-panel">
        <h2>Attendance today: {attendance}%</h2>
        <div className="adm-bar" role="img" aria-label={`Attendance ${attendance} percent`}><div style={{ width: `${attendance}%` }} /></div>
      </div>

      <div className="adm-panel">
        <h2>Fees collected: {collectedPct}%</h2>
        <div className="adm-bar" role="img" aria-label={`Fees collected ${collectedPct} percent`}><div style={{ width: `${collectedPct}%` }} /></div>
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>{money(collected)} collected, {money(pending)} outstanding</p>
      </div>

      <div className="adm-panel">
        <h2>Recent announcements</h2>
        {(d.announcements || []).length === 0 && <p className="adm-empty">No announcements yet.</p>}
        {(d.announcements || []).map((a) => (
          <p key={a._id || a.id} style={{ margin: '6px 0' }}><strong>{a.title}</strong> {a.date ? `(${new Date(a.date).toLocaleDateString()})` : ''}</p>
        ))}
      </div>
    </div>
  );
}
