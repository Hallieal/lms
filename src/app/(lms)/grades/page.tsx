'use client';

import { gradeRows } from '@/lib/mock-data';
import { Metric, PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';

const roster = [
  ['Anna Petrova', 'anna.petrova@nes.ru', '19.0', 'Sep 11 · 19:42'],
  ['Mikhail Sokolov', 'mikhail.sokolov@nes.ru', '18.5', 'Sep 11 · 21:04'],
  ['Daria Volkova', 'daria.volkova@nes.ru', '20.0', 'Sep 10 · 23:18'],
  ['Ivan Morozov', 'ivan.morozov@nes.ru', '17.5', 'Sep 11 · 22:51'],
  ['Sofia Lebedeva', 'sofia.lebedeva@nes.ru', '18.0', 'Sep 11 · 20:16'],
  ['Nikita Orlov', 'nikita.orlov@nes.ru', '', 'Missing'],
] as const;

export default function GradesPage() {
  const { isStaff } = useRole();

  if (!isStaff) {
    return (
      <>
        <PageHeader eyebrow="Performance" title="Grades" subtitle="A single place for results from all current courses." />
        <section className="section-card"><div className="table-wrap"><table className="data-table"><thead><tr><th>Course</th><th>Assessment</th><th>Score</th><th>Result</th></tr></thead><tbody>{gradeRows.map((row) => <tr key={`${row[0]}-${row[1]}`}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></table></div></section>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Teaching" title="Gradebook" subtitle="Econometrics II · Problem Set 2: Panel Data" action={<div style={{ display: 'flex', gap: 8 }}><button className="button-secondary">Export CSV</button><button className="button">Publish grades</button></div>} />
      <div className="metric-grid"><Metric value="73/74" label="Submitted" detail="98.6%" /><Metric value="73" label="Graded" detail="1 remaining" /><Metric value="17.8" label="Mean score" detail="out of 20" /><Metric value="19.1" label="Median" detail="out of 20" /></div>
      <section className="section-card"><div className="section-heading"><div><h2>Student submissions</h2><p>Editable prototype gradebook</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Email</th><th>Score / 20</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{roster.map((row) => <tr key={row[1]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td><input className="grade-input" defaultValue={row[2]} aria-label={`Grade for ${row[0]}`} /></td><td>{row[3]}</td><td><span className={`status ${row[2] ? 'status-graded' : 'status-open'}`}>{row[2] ? 'Graded' : 'Missing'}</span></td></tr>)}</tbody></table></div></section>
    </>
  );
}
