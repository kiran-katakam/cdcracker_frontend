import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShieldCheck, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';


const SUPPORT_FORM_ID = 'xvzywkqj';
const ACCESS_FORM_ID  = 'mbdbzgaj';

function useFormspree(formId) {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (data) => {
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json?.errors?.[0]?.message || 'Submission failed. Try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Check your connection.');
      setStatus('error');
    }
  };

  return { status, errorMsg, submit, reset: () => setStatus('idle') };
}

// ── Support / Feedback Form ────────────────────────────────────────────────────
function SupportForm() {
  const { status, errorMsg, submit } = useFormspree(SUPPORT_FORM_ID);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(form);
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Message sent!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          We'll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="support-name">Name</label>
          <input
            id="support-name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="support-email">Email</label>
          <input
            id="support-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="support-message">Message / Issue</label>
        <textarea
          id="support-message"
          placeholder="Describe the issue or feedback…"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ minHeight: 120 }}
          required
        />
      </div>

      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          background: '#7f1d1d33', border: '1px solid #991b1b',
          borderRadius: 8, padding: '0.6rem 0.9rem',
          fontSize: '0.82rem', color: '#fca5a5', marginBottom: '1rem',
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === 'submitting'}
        style={{ justifyContent: 'center' }}
      >
        <Send size={15} />
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

// ── Admin Access Request Form ──────────────────────────────────────────────────
const VIT_EMAIL_RE = /^[a-zA-Z0-9._%+-]+@vitapstudent\.ac\.in$/;

function AccessForm() {
  const { status, errorMsg, submit } = useFormspree(ACCESS_FORM_ID);
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', reason: '' });
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e) => {
    const v = e.target.value;
    setForm({ ...form, email: v });
    setEmailError(v && !VIT_EMAIL_RE.test(v) ? 'Must be a @vitapstudent.ac.in email' : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!VIT_EMAIL_RE.test(form.email)) {
      setEmailError('Must be a @vitapstudent.ac.in email');
      return;
    }
    submit({
      'Full Name': form.fullName,
      'VIT Email': form.email,
      'Mobile': form.mobile,
      'Reason for Access': form.reason,
    });
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Request submitted!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Requests are reviewed manually. You'll be contacted within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="access-name">Full Name</label>
          <input
            id="access-name"
            type="text"
            placeholder="As on VIT records"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="access-email">VIT Email</label>
          <input
            id="access-email"
            type="email"
            placeholder="yourname@vitapstudent.ac.in"
            value={form.email}
            onChange={handleEmailChange}
            required
          />
          {emailError && (
            <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
              {emailError}
            </span>
          )}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="access-mobile">Mobile Number</label>
        <input
          id="access-mobile"
          type="tel"
          placeholder="+91 XXXXX XXXXX"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="access-reason">Why do you need admin access?</label>
        <textarea
          id="access-reason"
          placeholder="Explain what content you'd like to add or manage…"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          style={{ minHeight: 100 }}
          required
        />
      </div>

      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          background: '#7f1d1d33', border: '1px solid #991b1b',
          borderRadius: 8, padding: '0.6rem 0.9rem',
          fontSize: '0.82rem', color: '#fca5a5', marginBottom: '1rem',
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === 'submitting' || !!emailError}
          style={{ justifyContent: 'center' }}
        >
          <Send size={15} />
          {status === 'submitting' ? 'Submitting…' : 'Submit Request'}
        </button>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Requests are reviewed manually. You'll be contacted within 48 hours.
        </p>
      </div>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: 820 }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          marginBottom: '0.5rem',
        }}>
          Contact &amp; Support
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Got a bug, feedback, or want to help add content? Reach out below.
        </p>
      </div>

      {/* Section 1 — Support / Feedback */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--accent-dim)', border: '1px solid rgba(79,142,247,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={18} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>General Support &amp; Feedback</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Report a bug, suggest a feature, or just say something.
            </p>
          </div>
        </div>
        <SupportForm />
      </div>

      {/* Section 2 — Admin Access */}
      <div
        id="admin-request"
        className="card"
        style={{ borderColor: 'rgba(139,92,246,0.3)', scrollMarginTop: '80px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#3b076422', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={18} color="#c084fc" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Request Admin Access</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Want to contribute courses and answers? Fill this out.
            </p>
          </div>
        </div>

        {/* Info callout */}
        <div style={{
          background: '#3b076415',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 8,
          padding: '0.7rem 1rem',
          fontSize: '0.82rem',
          color: '#c084fc',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
        }}>
          <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          Only <strong>@vitapstudent.ac.in</strong> email addresses are accepted. Admin access lets you add and manage courses, assessments, and questions.
        </div>

        <AccessForm />
      </div>

    </div>
  );
}
