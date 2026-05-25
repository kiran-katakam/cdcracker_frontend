import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const LANGS = ['java', 'python', 'c', 'c++', 'sql'];
const EMPTY = { courseId: '', assessmentId: '', code: '', language: 'python' };

function CodingForm({ value, onChange, courses, assessments }) {
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Course</label>
          <select value={value.courseId} onChange={(e) => onChange({ ...value, courseId: e.target.value, assessmentId: '' })} required>
            <option value="">Select…</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Assessment</label>
          <select value={value.assessmentId} onChange={(e) => onChange({ ...value, assessmentId: e.target.value })} required disabled={!value.courseId}>
            <option value="">Select…</option>
            {assessments.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </div>
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
          style={{ minHeight: 200, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
          required
        />
      </div>
    </>
  );
}

export default function ManageCoding() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assessmentMap, setAssessmentMap] = useState({});
  const [assessments, setAssessments] = useState([]);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    const { data: cList } = await API.get('/courses');
    setCourses(cList);

    const aMap = {};
    const allQ = [];
    for (const c of cList) {
      const { data: aList } = await API.get(`/courses/${c._id}/assessments`).catch(() => ({ data: [] }));
      aMap[c._id] = aList;
      for (const a of aList) {
        const { data: qList } = await API.get(`/courses/${c._id}/assessments/${a._id}/coding`).catch(() => ({ data: [] }));
        qList.forEach((q) => allQ.push({ ...q, courseName: c.name, assessmentName: a.name }));
      }
    }
    setAssessmentMap(aMap);
    setQuestions(allQ);
  }, []);
  useEffect(() => { load(); }, [load]);

  // When courseId changes in form, update assessments dropdown
  useEffect(() => {
    setAssessments(assessmentMap[form.courseId] || []);
  }, [form.courseId, assessmentMap]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (q) => {
    setEditing(q);
    setForm({ courseId: q.courseId, assessmentId: q.assessmentId, code: q.code, language: q.language });
    setModal('edit');
  };

  const submit = async () => {
    if (!form.courseId || !form.assessmentId) return setToast({ message: 'Select course and assessment', type: 'error' });
    try {
      const payload = { code: form.code, language: form.language };
      if (modal === 'create') {
        await API.post(`/courses/${form.courseId}/assessments/${form.assessmentId}/coding`, payload);
        setToast({ message: 'Question created!', type: 'success' });
      } else {
        await API.put(`/courses/${form.courseId}/assessments/${form.assessmentId}/coding/${editing._id}`, payload);
        setToast({ message: 'Updated!', type: 'success' });
      }
      setModal(null);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.message || 'Error', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/courses/${deleting.courseId}/assessments/${deleting.assessmentId}/coding/${deleting._id}`);
      setToast({ message: 'Deleted', type: 'success' });
      setDeleting(null);
      load();
    } catch { setToast({ message: 'Delete failed', type: 'error' }); }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Coding Questions</h2>
          <p className="text-muted text-sm">{questions.length} total</p>
        </div>
        <button id="create-coding" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Question</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Language</th><th>Course</th><th>Assessment</th><th>Preview</th><th></th></tr></thead>
          <tbody>
            {questions.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No coding questions yet.</td></tr>
            ) : questions.map((q) => (
              <tr key={q._id}>
                <td><span className="badge badge-amber">{q.language}</span></td>
                <td className="text-sm text-muted">{q.courseName}</td>
                <td className="text-sm text-muted">{q.assessmentName}</td>
                <td className="text-sm font-mono" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.code?.slice(0, 60)}…</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleting(q)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'New Coding Question' : 'Edit Coding Question'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>{modal === 'create' ? 'Create' : 'Save'}</button>
            </>
          }
        >
          <CodingForm value={form} onChange={setForm} courses={courses} assessments={assessments} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Question" onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </>
          }
        >
          <p>Delete this coding question? This cannot be undone.</p>
        </Modal>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
