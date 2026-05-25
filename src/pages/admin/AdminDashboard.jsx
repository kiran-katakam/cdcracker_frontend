import { useState, useEffect } from 'react';
import { BookOpen, ClipboardList, Code2, HelpCircle } from 'lucide-react';
import API from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, assessments: 0, coding: 0, mcq: 0 });

  useEffect(() => {
    // Fetch counts — best-effort
    API.get('/courses').then((r) => {
      const courses = r.data;
      setStats((s) => ({ ...s, courses: courses.length }));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Courses', value: stats.courses, icon: <BookOpen size={22} />, color: '#4f8ef7' },
    { label: 'Assessments', value: stats.assessments, icon: <ClipboardList size={22} />, color: '#8b5cf6' },
    { label: 'Coding Questions', value: stats.coding, icon: <Code2 size={22} />, color: '#f59e0b' },
    { label: 'MCQ Questions', value: stats.mcq, icon: <HelpCircle size={22} />, color: '#22c55e' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Dashboard</h2>
        <p className="text-muted text-sm">Overview of your platform content.</p>
      </div>

      <div className="grid grid-2 gap-4" style={{ marginBottom: '2.5rem' }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: c.color + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: c.color, flexShrink: 0,
            }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Quick Start</h3>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>1. Create a <strong style={{ color: 'var(--text-primary)' }}>Course</strong> under Courses</li>
          <li>2. Add <strong style={{ color: 'var(--text-primary)' }}>Assessments</strong> to the course</li>
          <li>3. Upload <strong style={{ color: 'var(--text-primary)' }}>Coding Questions</strong> or <strong style={{ color: 'var(--text-primary)' }}>MCQs</strong> for each assessment</li>
        </ul>
      </div>
    </div>
  );
}
