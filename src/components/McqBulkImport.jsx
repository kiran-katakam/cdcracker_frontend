import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Trash2, ArrowRight, FileJson, Pencil } from 'lucide-react';
import Modal from './Modal';
import API from '../api/axios';
import Toast from './Toast';

// ── HTML tag stripper ──────────────────────────────────────────────────────────
function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, '')   // remove tags
    .replace(/&nbsp;/g, ' ')   // decode common entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

// ── Parser ─────────────────────────────────────────────────────────────────────
function parseMcqJson(rawText) {
  const data = JSON.parse(rawText);
  const sections = Array.isArray(data) ? data : [data];
  const extracted = [];
  const errors = [];

  for (const section of sections) {
    const qs = section.questions || [];
    qs.forEach((q, idx) => {
      const questionHtml = q.question_data;
      const answerHtml = q.mcq_questions?.actual_answer?.args?.[0];

      if (!questionHtml) {
        errors.push(`Q${idx + 1}: missing question_data`);
        return;
      }
      if (!answerHtml) {
        errors.push(`Q${idx + 1}: missing actual_answer`);
        return;
      }

      extracted.push({
        question: stripHtml(questionHtml),
        answer: stripHtml(answerHtml),
        _key: q.q_id || `${idx}`,
      });
    });
  }

  return { extracted, errors };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function McqBulkImport({ courseId, assessmentId, onImported }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = paste, 2 = preview
  const [raw, setRaw] = useState('');
  const [questions, setQuestions] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [parseError, setParseError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingKey, setEditingKey] = useState(null); // _key of card being edited

  const updateQuestion = (key, field, value) =>
    setQuestions((qs) => qs.map((q) => q._key === key ? { ...q, [field]: value } : q));

  const reset = () => { setStep(1); setRaw(''); setQuestions([]); setParseErrors([]); setParseError(''); };
  const close = () => { reset(); setOpen(false); };

  const handleParse = () => {
    setParseError('');
    if (!raw.trim()) return setParseError('Paste the JSON first.');
    try {
      const { extracted, errors } = parseMcqJson(raw);
      if (extracted.length === 0) return setParseError('No valid questions found. Check the JSON format.');
      setQuestions(extracted);
      setParseErrors(errors);
      setStep(2);
    } catch {
      setParseError('Invalid JSON — make sure you paste the full array from the portal.');
    }
  };

  const removeQuestion = (key) => setQuestions((qs) => qs.filter((q) => q._key !== key));

  const handleImport = async () => {
    if (questions.length === 0) return;
    setSubmitting(true);
    try {
      const payload = questions.map(({ question, answer }) => ({ question, answer }));
      await API.post(`/courses/${courseId}/assessments/${assessmentId}/mcq/bulk`, { questions: payload });
      setToast({ message: `${payload.length} MCQs imported!`, type: 'success' });
      close();
      onImported?.();
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Import failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button id="bulk-import-mcq-btn" className="btn btn-success btn-sm" onClick={() => setOpen(true)}>
        <FileJson size={14} /> Import JSON
      </button>

      {open && (
        <Modal
          title={step === 1 ? 'Import MCQs from JSON' : `Preview — ${questions.length} questions`}
          onClose={close}
          footer={
            step === 1 ? (
              <>
                <button className="btn btn-ghost" onClick={close}>Cancel</button>
                <button className="btn btn-primary" onClick={handleParse}>
                  <ArrowRight size={14} /> Parse JSON
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn btn-success"
                  onClick={handleImport}
                  disabled={submitting || questions.length === 0}
                >
                  <Upload size={14} />
                  {submitting ? 'Importing…' : `Import ${questions.length} MCQs`}
                </button>
              </>
            )
          }
        >
          {/* ── Step 1: Paste ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>How to get the JSON:</strong>
                {' '}Open the assessment on your portal → open DevTools (F12) → Network tab →
                find the assessment API response → copy the <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>questions</code> array (or the full response).
                The app will extract <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>question_data</code> and <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>actual_answer</code> automatically.
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Paste JSON here</label>
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder={'[\n  {\n    "name": "MCQ",\n    "questions": [...]\n  }\n]'}
                  style={{
                    minHeight: 280,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {parseError && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  background: '#7f1d1d33', border: '1px solid #991b1b',
                  borderRadius: 8, padding: '0.6rem 0.9rem',
                  fontSize: '0.82rem', color: '#fca5a5',
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  {parseError}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Parse warnings */}
              {parseErrors.length > 0 && (
                <div style={{
                  background: '#451a0333', border: '1px solid #92400e',
                  borderRadius: 8, padding: '0.6rem 1rem',
                  fontSize: '0.8rem', color: '#fcd34d',
                }}>
                  <strong>Skipped {parseErrors.length} question(s) due to missing fields:</strong>
                  <ul style={{ marginTop: '0.3rem', paddingLeft: '1rem' }}>
                    {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Review and edit the extracted Q&amp;A pairs. Click <Pencil size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> to edit any question or answer inline.
              </p>

              {/* Question list */}
              <div style={{
                maxHeight: 360,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                paddingRight: '0.25rem',
              }}>
                {questions.map((q, i) => {
                  const isEditing = editingKey === q._key;
                  return (
                    <div
                      key={q._key}
                      style={{
                        border: `1px solid ${isEditing ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 8,
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, paddingTop: 4 }}>
                        Q{i + 1}
                      </span>

                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {isEditing ? (
                          <>
                            <textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(q._key, 'question', e.target.value)}
                              style={{ fontSize: '0.82rem', minHeight: 60, resize: 'vertical' }}
                              autoFocus
                            />
                            <input
                              value={q.answer}
                              onChange={(e) => updateQuestion(q._key, 'answer', e.target.value)}
                              style={{ fontSize: '0.82rem' }}
                              placeholder="Correct answer"
                            />
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{q.question}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle size={12} /> {q.answer}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
                        {isEditing ? (
                          <button
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.2rem 0.5rem' }}
                            onClick={() => setEditingKey(null)}
                            title="Save"
                          >
                            <CheckCircle size={12} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.2rem 0.5rem' }}
                            onClick={() => setEditingKey(q._key)}
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={() => { if (editingKey === q._key) setEditingKey(null); removeQuestion(q._key); }}
                          title="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {questions.length === 0 && (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <p>All questions removed.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
