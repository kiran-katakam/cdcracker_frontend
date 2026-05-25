import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Zap, Package, Shield,
  ArrowRight, BookOpen, ClipboardList, CheckCircle,
  Play,
} from 'lucide-react';
import API from '../api/axios';

const FEATURES = [
  {
    icon: '🔍', color: '#1d3a6b', iconColor: '#7eb3ff',
    title: 'Instant Search',
    desc: 'Search through MCQ answers and questions in real time — no page reloads, no endless scrolling.',
  },
  {
    icon: '⚡', color: '#451a03', iconColor: '#fcd34d',
    title: 'One-Click Code Copy',
    desc: 'Every code solution has a copy button. Get it to your clipboard instantly, formatted and ready.',
  },
  {
    icon: '📦', color: '#14532d', iconColor: '#4ade80',
    title: 'Bulk MCQ Import',
    desc: 'Paste your portal\'s JSON response and we extract every question and correct answer automatically.',
  },
  {
    icon: '🎯', color: '#3b0764', iconColor: '#c084fc',
    title: 'No Account Needed',
    desc: 'Students browse everything freely. Zero friction — just open the app and find what you need.',
  },
];

const VIDEOS = [
  { title: 'Getting Started', subtitle: 'Browse courses & find answers', duration: '2 min' },
  { title: 'Importing MCQ Data', subtitle: 'Paste JSON, get answers instantly', duration: '3 min' },
  { title: 'Admin Setup', subtitle: 'Create courses and upload content', duration: '4 min' },
];

export default function LandingPage() {
  const [courseCount, setCourseCount] = useState('—');

  useEffect(() => {
    API.get('/courses').then((r) => setCourseCount(r.data.length)).catch(() => {});
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div>
            <div className="landing-eyebrow">
              ✦ Built for VIT-AP students
            </div>
            <h1 className="landing-h1">
              The smarter way<br />
              to <span className="gradient-text">study faster</span>
            </h1>
            <p className="landing-sub">
              CDCracker gives you instant access to coding solutions and MCQ answers from
              your university assessments — clean, searchable, and without the portal's pain.
            </p>
            <div className="landing-ctas">
              <Link to="/courses" className="btn btn-primary btn-lg">
                Browse Courses <ArrowRight size={16} />
              </Link>
              <Link to="/admin/login" className="btn btn-ghost btn-lg">
                Admin Login
              </Link>
            </div>
          </div>

          {/* Mockup */}
          <div className="landing-mockup">
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: '#ef4444' }} />
              <div className="mockup-dot" style={{ background: '#f59e0b' }} />
              <div className="mockup-dot" style={{ background: '#22c55e' }} />
              <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 8, marginLeft: 8 }} />
            </div>
            <div className="mockup-body">
              {[
                { label: 'Data Structures', type: 'Mixed', color: '#4ade80' },
                { label: 'Aptitude', type: 'MCQ', color: '#c084fc' },
                { label: 'Full Stack Dev', type: 'Coding', color: '#7eb3ff' },
                { label: 'DBMS', type: 'Mixed', color: '#4ade80' },
              ].map((c) => (
                <div className="mockup-row" key={c.label}>
                  <BookOpen size={14} color="var(--text-muted)" />
                  <span style={{ flex: 1 }}>{c.label}</span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, color: c.color,
                    background: c.color + '22', padding: '0.15rem 0.5rem', borderRadius: 999,
                  }}>
                    {c.type}
                  </span>
                </div>
              ))}
              <div style={{
                marginTop: '0.5rem', padding: '0.6rem 0.8rem',
                background: 'var(--accent-dim)', borderRadius: 8,
                border: '1px solid rgba(79,142,247,0.3)',
                fontSize: '0.78rem', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CheckCircle size={13} />
                Answer: <strong>91</strong> — The HCF and LCM of two numbers…
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          {[
            { value: courseCount, label: 'Courses Available' },
            { value: '100%', label: 'Free for Students' },
            { value: '0', label: 'Accounts Required' },
            { value: '1-click', label: 'Code Copy' },
          ].map((s) => (
            <div className="stat-item" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-eyebrow">Why CDCracker</div>
          <h2 className="section-heading">Everything you need, nothing you don't</h2>
          <p className="section-subheading">
            Designed around how students actually study — quickly, at the last minute, with zero patience for bad UX.
          </p>
          <div className="grid grid-2 gap-4">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ background: f.color + '44' }}>
                  <span>{f.icon}</span>
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="steps-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <div className="section-eyebrow">How It Works</div>
            <h2 className="section-heading">Three clicks to your answer</h2>
          </div>
          <div className="steps-grid">
            {[
              {
                n: '1', icon: <BookOpen size={20} />, title: 'Find Your Course',
                desc: 'Browse or search the course list. Every assessment is organized by subject.',
              },
              {
                n: '2', icon: <ClipboardList size={20} />, title: 'Open the Assessment',
                desc: 'Select the quiz or test. Coding solutions and MCQ answers are on separate tabs.',
              },
              {
                n: '3', icon: <CheckCircle size={20} />, title: 'Get the Answer',
                desc: 'Copy the code or read the answer. Search MCQs by keyword to find exactly what you need.',
              },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-number">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video Tutorials ── */}
      <section className="video-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-eyebrow">Tutorials</div>
          <h2 className="section-heading">See it in action</h2>
          <p className="section-subheading">Short walkthroughs to get you up to speed.</p>
          <div className="grid grid-3 gap-4">
            {VIDEOS.map((v) => (
              <div className="video-card" key={v.title}>
                <div className="video-thumb">
                  <div className="play-btn">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
                <div className="video-info">
                  <div className="video-title">{v.title}</div>
                  <div className="video-duration">{v.subtitle} · {v.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="landing-cta-section">
        <h2>Start browsing — no account needed</h2>
        <p>Just pick a course and find your answers. It's that simple.</p>
        <Link to="/courses" className="btn btn-primary btn-lg">
          Browse Courses <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
