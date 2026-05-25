import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const EMPTY = { name: '', startDate: '', endDate: '', courseType: 'mixed' };

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

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    API.get('/courses').then((r) => setCourses(r.data));
  }, []);
  useEffect(load, [load]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      startDate: c.startDate?.slice(0, 10) || '',
      endDate: c.endDate?.slice(0, 10) || '',
      courseType: c.courseType,
    });
    setModal('edit');
  };

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
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Courses</h2>
          <p className="text-muted text-sm">{courses.length} total</p>
        </div>
        <button id="create-course" className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Course
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No courses yet.</td></tr>
            ) : courses.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td><span className="badge badge-blue">{c.courseType}</span></td>
                <td className="text-sm text-muted">{c.startDate?.slice(0, 10) || '—'}</td>
                <td className="text-sm text-muted">{c.endDate?.slice(0, 10) || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleting(c)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <Modal
          title={modal === 'create' ? 'New Course' : 'Edit Course'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>
                {modal === 'create' ? 'Create' : 'Save'}
              </button>
            </>
          }
        >
          <CourseForm value={form} onChange={setForm} />
        </Modal>
      )}

      {/* Delete confirm */}
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
          <p>Are you sure you want to delete <strong>{deleting.name}</strong>? This cannot be undone.</p>
        </Modal>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
