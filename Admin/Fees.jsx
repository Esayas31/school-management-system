import { CrudPage, Badge, money, fmtDate } from './shared';

const columns = [
  { key: 'student', label: 'Student', render: (r) => r.studentId?.name ?? r.student?.name ?? '' },
  { key: 'title', label: 'Fee' },
  { key: 'amount', label: 'Amount', render: (r) => money(r.amount) },
  { key: 'paid', label: 'Paid', render: (r) => money(r.paid) },
  { key: 'dueDate', label: 'Due', render: (r) => fmtDate(r.dueDate) },
  { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
];

const fields = [
  { name: 'studentId', label: 'Student', type: 'select', optionsFrom: '/students', required: true },
  { name: 'title', label: 'Fee title (for example Term 1 tuition)', required: true },
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'dueDate', label: 'Due date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Unpaid', 'Partial', 'Paid'] },
];

const summary = (items) => {
  const total = items.reduce((s, f) => s + Number(f.amount || 0), 0);
  const paid = items.reduce((s, f) => s + Number(f.paid || 0), 0);
  return (
    <div className="adm-stats">
      <div className="adm-stat"><span>Total billed</span><strong>{money(total)}</strong></div>
      <div className="adm-stat"><span>Collected</span><strong>{money(paid)}</strong></div>
      <div className="adm-stat"><span>Outstanding</span><strong>{money(total - paid)}</strong></div>
    </div>
  );
};

export default function Fees() {
  return (
    <CrudPage
      title="Fees"
      singular="fee"
      path="/fees"
      columns={columns}
      fields={fields}
      searchKeys={['title', 'status']}
      summary={summary}
    />
  );
}
