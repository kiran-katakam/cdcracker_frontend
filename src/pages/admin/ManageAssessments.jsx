import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const EMPTY = { courseId: '', name: '', startDate: '', endDate: '', assessmentType: 'mixed' };

function AssessmentForm({ value, onChange, courses }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">Course</label>
        <select value={value.courseId} onChange={(e) => onChange({ ...value, courseId: e.target.value })} required>
          <option value="">Select course…</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
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

export default function ManageAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const { data: cList } = await API.get('/courses');
    setCourses(cList);
    const allAssessments = await Promise.all(
      cList.map((c) =>
        API.get(`/courses/${c._id}/assessments`).then((r) =>
          r.data.map((a) => ({ ...a, courseName: c.name }))
        ).catch(() => [])
      )
    );
    setAssessments(allAssessments.flat());
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      courseId: a.courseId,
      name: a.name,
      startDate: a.startDate?.slice(0, 10) || '',
      endDate: a.endDate?.slice(0, 10) || '',
      assessmentType: a.assessmentType,
    });
    setModal('edit');
  };

  const submit = async () => {
    if (!form.courseId) return setToast({ message: 'Select a course', type: 'error' });
    try {
      if (modal === 'create') {
        await API.post(`/courses/${form.courseId}/assessments`, form);
        setToast({ message: 'Assessment created!', type: 'success' });
      } else {
        await API.put(`/courses/${form.courseId}/assessments/${editing._id}`, form);
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
      await API.delete(`/courses/${deleting.courseId}/assessments/${deleting._id}`);
      setToast({ message: 'Deleted', type: 'success' });
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
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Assessments</h2>
          <p className="text-muted text-sm">{assessments.length} total</p>
        </div>
        <button id="create-assessment" className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Assessment
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Course</th><th>Type</th><th>Start</th><th>End</th><th></th></tr>
          </thead>
          <tbody>
            {assessments.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No assessments yet.</td></tr>
            ) : assessments.map((a) => (
              <tr key={a._id}>
                <td style={{ fontWeight: 500 }}>{a.name}</td>
                <td className="text-sm text-muted">{a.courseName}</td>
                <td><span className="badge badge-purple">{a.assessmentType}</span></td>
                <td className="text-sm text-muted">{a.startDate?.slice(0, 10) || '—'}</td>
                <td className="text-sm text-muted">{a.endDate?.slice(0, 10) || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleting(a)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <AssessmentForm value={form} onChange={setForm} courses={courses} />
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
