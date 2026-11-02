import { CrudPage, Badge } from './shared';

const className = (r) => r.classId?.name ?? r.class?.name ?? '';

const columns = [
  { key: 'admissionNo', label: 'Admission no.' },
  { key: 'name', label: 'Name' },
  { key: 'class', label: 'Class', render: className },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
];

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'admissionNo', label: 'Admission number', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'dob', label: 'Date of birth', type: 'date' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
  { name: 'classId', label: 'Class', type: 'select', optionsFrom: '/classes', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
];

export default function Students() {
  return (
    <CrudPage
      title="Students"
      singular="student"
      path="/students"
      columns={columns}
      fields={fields}
      searchKeys={['name', 'admissionNo', 'email']}
    />
  );
}
