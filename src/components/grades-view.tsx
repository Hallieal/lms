'use client';

import { Metric, PageHeader } from '@/components/ui';
import { useRole } from '@/components/role-context';
import type { GradesData } from '@/lib/grades-data';

function numberLabel(value: number | null) {
  return value === null ? '—' : value.toFixed(1);
}

export function GradesView({ data }: { data: GradesData }) {
  const { isStaff } = useRole();

  if (!isStaff) {
    return (
      <>
        <PageHeader eyebrow="Performance" title="Grades" subtitle="A single place for published results from all current courses." />
        <section className="section-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Course</th><th>Assessment</th><th>Score</th><th>Result</th></tr></thead>
              <tbody>
                {data.studentRows.length ? data.studentRows.map((row) => (
                  <tr key={`${row.course}-${row.assessment}`}><td><strong>{row.course}</strong></td><td>{row.assessment}</td><td>{row.score}</td><td>{row.result}</td></tr>
                )) : <tr><td colSpan={4}><p className="empty-state">No published grades yet.</p></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  if (!data.gradebook) {
    return <><PageHeader eyebrow="Teaching" title="Gradebook" subtitle="No submissions are available for grading yet." /><section className="section-card"><p className="empty-state">The gradebook will appear when students submit work.</p></section></>;
  }

  const book = data.gradebook;
  const completion = book.submitted ? Math.round((book.graded / book.submitted) * 1000) / 10 : 0;

  return (
    <>
      <PageHeader eyebrow="Teaching" title="Gradebook" subtitle={`${book.course} · ${book.title}`} action={<div style={{ display: 'flex', gap: 8 }}><button className="button-secondary">Export CSV</button><button className="button">Publish grades</button></div>} />
      <div className="metric-grid"><Metric value={String(book.submitted)} label="Submitted" detail="Received" /><Metric value={String(book.graded)} label="Graded" detail={`${completion}% complete`} /><Metric value={numberLabel(book.mean)} label="Mean score" detail={`out of ${book.maxPoints}`} /><Metric value={numberLabel(book.median)} label="Median" detail={`out of ${book.maxPoints}`} /></div>
      <section className="section-card">
        <div className="section-heading"><div><h2>Student submissions</h2><p>RLS-protected course gradebook</p></div></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Student ID</th><th>Score / {book.maxPoints}</th><th>Submitted</th><th>Status</th></tr></thead><tbody>
          {book.rows.length ? book.rows.map((row) => <tr key={row.studentId}><td><strong>{row.name}</strong></td><td>{row.studentId.slice(0, 8)}</td><td><input className="grade-input" defaultValue={row.score} aria-label={`Grade for ${row.name}`} /></td><td>{row.submitted}</td><td><span className={`status ${row.status === 'graded' ? 'status-graded' : 'status-open'}`}>{row.status === 'graded' ? 'Graded' : 'Missing'}</span></td></tr>) : <tr><td colSpan={5}><p className="empty-state">No student submissions.</p></td></tr>}
        </tbody></table></div>
      </section>
    </>
  );
}
