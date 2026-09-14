'use client';

import type { Assignment } from '@/lib/types';
import { Metric, PageHeader } from './ui';
import { useRole } from './role-context';

export function AssignmentDetail({ assignment }: { assignment: Assignment }) {
  const { isStaff } = useRole();
  const submissionRate = Math.round((assignment.submitted / assignment.total) * 100);

  return (
    <>
      <PageHeader eyebrow={assignment.course} title={assignment.title} subtitle={`Due ${assignment.due} · ${assignment.points} points`} action={isStaff ? <div style={{ display: 'flex', gap: 8 }}><button className="button-secondary">Edit assignment</button><button className="button">Open grading</button></div> : <span className={`status status-${assignment.status}`}>{assignment.status}</span>} />
      {isStaff && <div className="metric-grid"><Metric value={`${assignment.submitted}/${assignment.total}`} label="Submitted" detail={`${submissionRate}% of class`} /><Metric value={`${assignment.graded}/${assignment.total}`} label="Graded" detail={`${Math.max(0, assignment.submitted - assignment.graded)} waiting`} /><Metric value={String(assignment.points)} label="Points" detail="Maximum score" /><Metric value="PDF" label="Submission type" detail="One file" /></div>}
      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-heading"><div><h2>{isStaff ? 'Assignment brief' : 'Instructions'}</h2><p>{isStaff ? 'What students currently see' : 'Read the full brief before submitting'}</p></div>{isStaff && <button className="button-secondary">Edit</button>}</div>
          <div style={{ lineHeight: 1.7, fontSize: 13, color: 'var(--muted)' }}>
            <p>Complete the assigned problems and submit one PDF containing your derivations, interpretation and supporting calculations.</p>
            <h3 style={{ color: 'var(--text)', fontSize: 14 }}>Submission requirements</h3>
            <p>PDF format · maximum 20 MB · one submission per student · resubmission allowed until the deadline.</p>
            <div className="module-card"><div className="resource-row"><span><strong style={{ color: 'var(--text)' }}>problem-set.pdf</strong><br /><small>Assignment handout · 482 KB</small></span><span className="resource-kind">PDF</span></div></div>
          </div>
        </section>
        <aside className="stack">
          {isStaff ? <section className="section-card"><div className="section-heading"><div><h2>Submission progress</h2><p>{assignment.submitted} of {assignment.total} received</p></div></div><div className="progress-track" style={{ height: 10 }}><span style={{ width: `${submissionRate}%`, background: 'var(--green)' }} /></div><div style={{ height: 16 }} /><button className="button" style={{ width: '100%' }}>Grade submissions</button></section> : <section className="section-card"><div className="section-heading"><div><h2>Your submission</h2><p>{assignment.status === 'submitted' || assignment.status === 'graded' ? 'Submission received' : 'Nothing submitted yet'}</p></div></div><div style={{ border: '1px dashed #bfcbd6', borderRadius: 14, padding: 26, textAlign: 'center', background: 'var(--soft)', color: 'var(--muted)', fontSize: 11 }}><strong style={{ display: 'block', color: 'var(--text)', marginBottom: 5 }}>Drop a PDF here</strong>or choose a file from your device</div><div style={{ height: 12 }} /><button className="button" style={{ width: '100%' }}>Submit assignment</button></section>}
        </aside>
      </div>
    </>
  );
}
