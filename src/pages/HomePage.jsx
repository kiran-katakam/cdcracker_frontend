import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Calendar, Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const typeColors = { mcq: 'badge-purple', coding: 'badge-blue', mixed: 'badge-green' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_COURSE = { name: '', startDate: '', endDate: '', courseType: 'mixed' };

function CourseForm({ value, onChange }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Course Name</label>
        <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g. Data Structures" required />
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
        <select value={value.courseType} onChange={(e) => onChange({ ...value, courseType: e.target.value })}>
          <option value="mcq">MCQ</option>
          <option value="coding">Coding</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
    </>
  );
}

export default function HomePage() {
  const { admin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    API.get('/courses')
      .then((r) => setCourses(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = (e) => { e.preventDefault(); setForm(EMPTY_COURSE); setModal('create'); };
  const openEdit = (e, c) => {
    e.preventDefault();
    setEditing(c);
    setForm({ name: c.name, startDate: c.startDate?.slice(0, 10) || '', endDate: c.endDate?.slice(0, 10) || '', courseType: c.courseType });
    setModal('edit');
  };
  const openDelete = (e, c) => { e.preventDefault(); setDeleting(c); };

  const submit = async () => {
    try {
      if (modal === 'create') {
        await API.post('/courses', form);
        setToast({ message: 'Course created!', type: 'success' });
      } else {
        await API.put(`/courses/${editing._id}`, form);
        setToast({ message: 'Course updated!', type: 'success' });
      }
      setModal(null);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Error', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/courses/${deleting._id}`);
      setToast({ message: 'Course deleted', type: 'success' });
      setDeleting(null);
      load();
    } catch {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Hero */}
      <div className="page-hero">
        <h1>Academic Assessments</h1>
        <p>Browse courses and access coding solutions &amp; MCQ answers in seconds.</p>
        <div className="search-wrap" style={{ marginTop: '1.25rem', maxWidth: 420 }}>
          <Search size={16} className="search-icon" />
          <input
            id="search-courses"
            type="text"
            placeholder="Search courses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Courses', value: courses.length },
          { label: 'MCQ', value: courses.filter(c => c.courseType !== 'coding').length },
          { label: 'Coding', value: courses.filter(c => c.courseType !== 'mcq').length },
        ].map((s) => (
          <div key={s.label} className="card" style={{ flex: '1 1 140px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="section-header">
        <span className="section-title">All Courses</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="text-sm text-muted">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          {admin && (
            <button id="add-course-btn" className="btn btn-primary btn-sm" onClick={openCreate}>
              <Plus size={14} /> Add Course
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <p>No courses found{query ? ` for "${query}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-2 gap-4">
          {filtered.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="card card-link"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{course.name}</span>
                <span className={`badge ${typeColors[course.courseType] || 'badge-gray'}`}>
                  <Tag size={10} />{course.courseType || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <span><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{formatDate(course.startDate)}</span>
                <span>→ {formatDate(course.endDate)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View assessments →</span>
                {admin && (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => openEdit(e, course)}
                      title="Edit course"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => openDelete(e, course)}
                      title="Delete course"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <Modal
          title={modal === 'create' ? 'New Course' : 'Edit Course'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>{modal === 'create' ? 'Create' : 'Save'}</button>
            </>
          }
        >
          <CourseForm value={form} onChange={setForm} />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <Modal
          title="Delete Course"
          onClose={() => setDeleting(null)}
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
