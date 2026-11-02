import { CrudPage, fmtDate } from './shared';

const columns = [
  { key: 'name', label: 'Exam' },
  { key: 'type', label: 'Type' },
  { key: 'subject', label: 'Subject', render: (r) => r.subjectId?.name ?? r.subject?.name ?? '' },
  { key: 'class', label: 'Class', render: (r) => r.classId?.name ?? r.class?.name ?? '' },
  { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
  { key: 'maxMarks', label: 'Max marks' },
];

const fields = [
  { name: 'name', label: 'Exam name', required: true },
  { name: 'type', label: 'Type', type: 'select', options: ['Quiz', 'Midterm', 'Final'], required: true },
  { name: 'subjectId', label: 'Subject', type: 'select', optionsFrom: '/subjects', required: true },
  { name: 'classId', label: 'Class', type: 'select', optionsFrom: '/classes', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'maxMarks', label: 'Maximum marks', type: 'number', required: true },
];

export default function Exams() {
  return (
    <CrudPage
      title="Exams"
      singular="exam"
      path="/exams"
      columns={columns}
      fields={fields}
      searchKeys={['name', 'type']}
    />
  );
}
