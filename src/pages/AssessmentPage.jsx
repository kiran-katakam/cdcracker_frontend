import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Code2, HelpCircle, Copy, CheckCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import McqBulkImport from '../components/McqBulkImport';

const LANG_COLORS = {
  java: 'badge-amber', python: 'badge-blue', c: 'badge-gray', 'c++': 'badge-purple', sql: 'badge-green',
};
const LANGS = ['java', 'python', 'c', 'c++', 'sql'];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn btn-ghost btn-sm" onClick={copy} title="Copy code">
      {copied ? <CheckCircle size={14} color="var(--success)" /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Coding modals ──────────────────────────────────────────────────────────────
const EMPTY_CODE = { question: '', code: '', language: 'python' };

function CodingForm({ value, onChange }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Question / Title</label>
        <input
          value={value.question}
          onChange={(e) => onChange({ ...value, question: e.target.value })}
          placeholder="e.g. Reverse a linked list"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Language</label>
        <select value={value.language} onChange={(e) => onChange({ ...value, language: e.target.value })}>
          {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Code</label>
        <textarea
          value={value.code}
          onChange={(e) => onChange({ ...value, code: e.target.value })}
          placeholder="Paste code here…"
          style={{ minHeight: 220, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
          required
        />
      </div>
    </>
  );
}

// ── MCQ modals ─────────────────────────────────────────────────────────────────
const EMPTY_MCQ = { question: '', answer: '' };

function McqForm({ value, onChange }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Question</label>
        <textarea
          value={value.question}
          onChange={(e) => onChange({ ...value, question: e.target.value })}
          placeholder="Enter the MCQ question…"
          style={{ minHeight: 80 }}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Correct Answer</label>
        <input
          value={value.answer}
          onChange={(e) => onChange({ ...value, answer: e.target.value })}
          placeholder="Correct answer"
          required
        />
      </div>
    </>
  );
}

export default function AssessmentPage() {
  const { courseId, assessmentId } = useParams();
  const { admin } = useAuth();

  const [course, setCourse] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [coding, setCoding] = useState([]);
  const [mcq, setMcq] = useState([]);
  const [tab, setTab] = useState('coding');

  // Intercept Ctrl+F / Cmd+F → focus MCQ search instead of browser find
  const mcqSearchRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setTab('mcq');
        // Defer focus until after React re-renders the MCQ tab
        setTimeout(() => mcqSearchRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const [mcqSearch, setMcqSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Admin modal state
  const [codeModal, setCodeModal] = useState(null); // null | 'create' | 'edit'
  const [mcqModal, setMcqModal] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [editingMcq, setEditingMcq] = useState(null);
  const [codeForm, setCodeForm] = useState(EMPTY_CODE);
  const [mcqForm, setMcqForm] = useState(EMPTY_MCQ);
  const [deletingCode, setDeletingCode] = useState(null);
  const [deletingMcq, setDeletingMcq] = useState(null);
  const [toast, setToast] = useState(null);

  const loadMeta = () =>
    Promise.all([
      API.get(`/courses/${courseId}`),
      API.get(`/courses/${courseId}/assessments/${assessmentId}`),
    ]).then(([c, a]) => {
      setCourse(c.data);
      setAssessment(a.data);
      if (a.data?.assessmentType === 'mcq') setTab('mcq');
    });

  const loadCoding = () =>
    API.get(`/courses/${courseId}/assessments/${assessmentId}/coding`)
      .then((r) => setCoding(r.data));

  const loadMcq = () =>
    API.get(`/courses/${courseId}/assessments/${assessmentId}/mcq`)
      .then((r) => setMcq(r.data));

  useEffect(() => {
    Promise.all([loadMeta(), loadCoding(), loadMcq()]).finally(() => setLoading(false));
  }, [courseId, assessmentId]);

  // Filtered views
  const filteredCoding = coding.filter((q) => langFilter === 'all' || q.language === langFilter);
  const filteredMcq = mcq.filter((q) =>
    q.question.toLowerCase().includes(mcqSearch.toLowerCase()) ||
    q.answer.toLowerCase().includes(mcqSearch.toLowerCase())
  );
  const langs = [...new Set(coding.map((q) => q.language))];

  // ── Coding CRUD ─────────────────────────────────────────────────────────────
  const openCreateCode = () => { setCodeForm(EMPTY_CODE); setCodeModal('create'); };
  const openEditCode = (q) => { setEditingCode(q); setCodeForm({ question: q.question || '', code: q.code, language: q.language }); setCodeModal('edit'); };
  const submitCode = async () => {
    try {
      const base = `/courses/${courseId}/assessments/${assessmentId}/coding`;
      if (codeModal === 'create') {
        await API.post(base, codeForm);
        setToast({ message: 'Question added!', type: 'success' });
      } else {
        await API.put(`${base}/${editingCode._id}`, codeForm);
        setToast({ message: 'Updated!', type: 'success' });
      }
      setCodeModal(null);
      loadCoding();
    } catch (e) { setToast({ message: e.response?.data?.message || 'Error', type: 'error' }); }
  };
  const confirmDeleteCode = async () => {
    try {
      await API.delete(`/courses/${courseId}/assessments/${assessmentId}/coding/${deletingCode._id}`);
      setToast({ message: 'Deleted', type: 'success' });
      setDeletingCode(null);
      loadCoding();
    } catch { setToast({ message: 'Delete failed', type: 'error' }); }
  };

  // ── MCQ CRUD ─────────────────────────────────────────────────────────────────
  const openCreateMcq = () => { setMcqForm(EMPTY_MCQ); setMcqModal('create'); };
  const openEditMcq = (q) => { setEditingMcq(q); setMcqForm({ question: q.question, answer: q.answer }); setMcqModal('edit'); };
  const submitMcq = async () => {
    try {
      const base = `/courses/${courseId}/assessments/${assessmentId}/mcq`;
      if (mcqModal === 'create') {
        await API.post(base, mcqForm);
        setToast({ message: 'MCQ added!', type: 'success' });
      } else {
        await API.put(`${base}/${editingMcq._id}`, mcqForm);
        setToast({ message: 'Updated!', type: 'success' });
      }
      setMcqModal(null);
      loadMcq();
    } catch (e) { setToast({ message: e.response?.data?.message || 'Error', type: 'error' }); }
  };
  const confirmDeleteMcq = async () => {
    try {
      await API.delete(`/courses/${courseId}/assessments/${assessmentId}/mcq/${deletingMcq._id}`);
      setToast({ message: 'Deleted', type: 'success' });
      setDeletingMcq(null);
      loadMcq();
    } catch { setToast({ message: 'Delete failed', type: 'error' }); }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <div className="skeleton skeleton-line w-1-4" />
        <div className="skeleton skeleton-line" style={{ width: 8 }} />
        <div className="skeleton skeleton-line w-1-4" />
      </div>
      <div className="skeleton skeleton-line w-1-2" style={{ height: 32, marginBottom: '0.75rem' }} />
      <div className="skeleton skeleton-line w-1-4" style={{ marginBottom: '2rem' }} />
      {[1, 2, 3].map((i) => (
        <div className="skeleton-card" key={i} style={{ marginBottom: '1rem' }}>
          <div className="skeleton skeleton-line w-1-4" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line w-3-4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="breadcrumb">
        <Link to="/courses">Home</Link>
        <span>/</span>
        <Link to={`/courses/${courseId}`}>{course?.name}</Link>
        <span>/</span>
        <span>{assessment?.name}</span>
      </div>

      <div className="page-hero">
        <h1>{assessment?.name}</h1>
        <p>
          {coding.length} coding question{coding.length !== 1 ? 's' : ''}
          {' · '}
          {mcq.length} MCQ{mcq.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pill Tabs */}
      <div className="tabs-pill">
        <button id="tab-coding" className={`tab-pill${tab === 'coding' ? ' active' : ''}`} onClick={() => setTab('coding')}>
          <Code2 size={14} />
          Coding ({coding.length})
        </button>
        <button id="tab-mcq" className={`tab-pill${tab === 'mcq' ? ' active' : ''}`} onClick={() => setTab('mcq')}>
          <HelpCircle size={14} />
          MCQ ({mcq.length})
        </button>
      </div>

      {/* ── Coding Tab ── */}
      {tab === 'coding' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Language filter */}
            {langs.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', ...langs].map((l) => (
                  <button
                    key={l}
                    className={`btn btn-sm ${langFilter === l ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setLangFilter(l)}
                  >
                    {l === 'all' ? 'All' : l}
                  </button>
                ))}
              </div>
            )}
            {admin && (
              <button id="add-coding-btn" className="btn btn-primary btn-sm" onClick={openCreateCode}>
                <Plus size={14} /> Add Question
              </button>
            )}
          </div>

          {filteredCoding.length === 0 ? (
            <div className="empty-state"><Code2 size={40} /><p>No coding questions.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredCoding.map((q, i) => (
                <div key={q._id} className="code-block">
                  <div className="code-block-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', flexShrink: 0 }}>#{i + 1}</span>
                      <span className={`badge ${LANG_COLORS[q.language] || 'badge-gray'}`} style={{ flexShrink: 0 }}>{q.language}</span>
                      {q.question && (
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.question}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <CopyButton text={q.code} />
                      {admin && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditCode(q)} title="Edit"><Pencil size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeletingCode(q)} title="Delete"><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="code-block-body">
                    <pre>{q.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MCQ Tab ── */}
      {tab === 'mcq' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="search-wrap" style={{ maxWidth: 400, flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input
                id="mcq-search"
                ref={mcqSearchRef}
                type="text"
                placeholder="Search questions or answers… (Ctrl+F)"
                value={mcqSearch}
                onChange={(e) => setMcqSearch(e.target.value)}
              />
            </div>
            {admin && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <McqBulkImport
                  courseId={courseId}
                  assessmentId={assessmentId}
                  onImported={loadMcq}
                />
                <button id="add-mcq-btn" className="btn btn-primary btn-sm" onClick={openCreateMcq}>
                  <Plus size={14} /> Add MCQ
                </button>
              </div>
            )}
          </div>

          {filteredMcq.length === 0 ? (
            <div className="empty-state"><HelpCircle size={40} /><p>No MCQs found.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredMcq.map((q, i) => (
                <div key={q._id} className="mcq-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div className="mcq-question">
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Q{i + 1}.</span>
                        {q.question}
                      </div>
                      <div className="mcq-answer">
                        <CheckCircle size={14} />
                        {q.answer}
                      </div>
                    </div>
                    {admin && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditMcq(q)} title="Edit"><Pencil size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeletingMcq(q)} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Coding Modals ── */}
      {codeModal && (
        <Modal
          title={codeModal === 'create' ? 'Add Coding Question' : 'Edit Coding Question'}
          onClose={() => setCodeModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setCodeModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitCode}>{codeModal === 'create' ? 'Add' : 'Save'}</button>
            </>
          }
        >
          <CodingForm value={codeForm} onChange={setCodeForm} />
        </Modal>
      )}
      {deletingCode && (
        <Modal title="Delete Question" onClose={() => setDeletingCode(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeletingCode(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteCode}>Delete</button>
            </>
          }
        >
          <p>Delete this coding question? This cannot be undone.</p>
        </Modal>
      )}

      {/* ── MCQ Modals ── */}
      {mcqModal && (
        <Modal
          title={mcqModal === 'create' ? 'Add MCQ' : 'Edit MCQ'}
          onClose={() => setMcqModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setMcqModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitMcq}>{mcqModal === 'create' ? 'Add' : 'Save'}</button>
            </>
          }
        >
          <McqForm value={mcqForm} onChange={setMcqForm} />
        </Modal>
      )}
      {deletingMcq && (
        <Modal title="Delete MCQ" onClose={() => setDeletingMcq(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeletingMcq(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteMcq}>Delete</button>
            </>
          }
        >
          <p>Delete this MCQ? This cannot be undone.</p>
        </Modal>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
