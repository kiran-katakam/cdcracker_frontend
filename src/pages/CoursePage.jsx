import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ClipboardList, Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const typeColors = { mcq: 'badge-purple', coding: 'badge-blue', mixed: 'badge-green' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY = { name: '', startDate: '', endDate: '', assessmentType: 'mixed' };

function AssessmentForm({ value, onChange }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Assessment Name</label>
        <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g. Week 3 Quiz" required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input type="date" value={value.startDate} onChange={(e) => onChange({ ...value, startDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input type="date" value={value.endDate} onChange={(e) => onChange({ ...value, endDate: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select value={value.assessmentType} onChange={(e) => onChange({ ...value, assessmentType: e.target.value })}>
          <option value="mcq">MCQ</option>
          <option value="coding">Coding</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
    </>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const { admin } = useAuth();
  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    Promise.all([
      API.get(`/courses/${courseId}`),
      API.get(`/courses/${courseId}/assessments`),
    ])
      .then(([c, a]) => { setCourse(c.data); setAssessments(a.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [courseId]);

  const openCreate = (e) => { e.preventDefault(); setForm(EMPTY); setModal('create'); };
  const openEdit = (e, a) => {
    e.preventDefault();
    setEditing(a);
    setForm({ name: a.name, startDate: a.startDate?.slice(0, 10) || '', endDate: a.endDate?.slice(0, 10) || '', assessmentType: a.assessmentType });
    setModal('edit');
  };
  const openDelete = (e, a) => { e.preventDefault(); setDeleting(a); };

  const submit = async () => {
    try {
      if (modal === 'create') {
        await API.post(`/courses/${courseId}/assessments`, form);
        setToast({ message: 'Assessment created!', type: 'success' });
      } else {
        await API.put(`/courses/${courseId}/assessments/${editing._id}`, form);
        setToast({ message: 'Assessment updated!', type: 'success' });
      }
      setModal(null);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Error', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/courses/${courseId}/assessments/${deleting._id}`);
      setToast({ message: 'Deleted', type: 'success' });
      setDeleting(null);
      load();
    } catch { setToast({ message: 'Delete failed', type: 'error' }); }
  };

  if (loading) return <div className="spinner" />;
  if (!course) return <div className="empty-state"><p>Course not found.</p></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="breadcrumb">
        <Link to="/courses">Home</Link>
        <span>/</span>
        <span>{course.name}</span>
      </div>

      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1>{course.name}</h1>
          <span className={`badge ${typeColors[course.courseType] || 'badge-gray'}`}>
            <Tag size={10} />{course.courseType}
          </span>
        </div>
        <p style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />{formatDate(course.startDate)} → {formatDate(course.endDate)}</span>
          <span style={{ color: 'var(--text-muted)' }}>{assessments.length} assessment{assessments.length !== 1 ? 's' : ''}</span>
        </p>
      </div>

      <div className="section-header">
        <span className="section-title">Assessments</span>
        {admin && (
          <button id="add-assessment-btn" className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} /> Add Assessment
          </button>
        )}
      </div>

      {assessments.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <p>No assessments available yet.</p>
        </div>
      ) : (
        <div className="grid grid-2 gap-4">
          {assessments.map((a) => (
            <Link
              key={a._id}
              to={`/courses/${courseId}/assessments/${a._id}`}
              className="card card-link"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600 }}>{a.name}</span>
                <span className={`badge ${typeColors[a.assessmentType] || 'badge-gray'}`}>{a.assessmentType}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                {formatDate(a.startDate)} → {formatDate(a.endDate)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Open assessment →</span>
                {admin && (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => openEdit(e, a)} title="Edit"><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={(e) => openDelete(e, a)} title="Delete"><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'create' ? 'New Assessment' : 'Edit Assessment'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>{modal === 'create' ? 'Create' : 'Save'}</button>
            </>
          }
        >
          <AssessmentForm value={form} onChange={setForm} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Assessment" onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </>
          }
        >
          <p>Delete <strong>{deleting.name}</strong>? This cannot be undone.</p>
        </Modal>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
