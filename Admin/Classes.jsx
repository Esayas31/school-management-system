import { CrudPage } from './shared';

const columns = [
  { key: 'name', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'academicYear', label: 'Academic year' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'teacher', label: 'Class teacher', render: (r) => r.classTeacherId?.name ?? r.classTeacher?.name ?? '' },
];

const fields = [
  { name: 'name', label: 'Class name (for example Grade 7)', required: true },
  { name: 'section', label: 'Section', required: true },
  { name: 'academicYear', label: 'Academic year', required: true },
  { name: 'capacity', label: 'Capacity', type: 'number' },
  { name: 'classTeacherId', label: 'Class teacher', type: 'select', optionsFrom: '/teachers' },
];

export default function Classes() {
  return (
    <CrudPage
      title="Classes"
      singular="class"
      path="/classes"
      columns={columns}
      fields={fields}
      searchKeys={['name', 'section', 'academicYear']}
    />
  );
}
