import { CrudPage, Badge } from './shared';

const columns = [
  { key: 'employeeNo', label: 'Employee no.' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
];

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'employeeNo', label: 'Employee number', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'qualification', label: 'Qualification' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

export default function Teachers() {
  return (
    <CrudPage
      title="Teachers"
      singular="teacher"
      path="/teachers"
      columns={columns}
      fields={fields}
      searchKeys={['name', 'employeeNo', 'email']}
    />
  );
}
