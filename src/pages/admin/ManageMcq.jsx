import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import API from '../../api/axios';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const EMPTY = { courseId: '', assessmentId: '', question: '', answer: '' };

function McqForm({ value, onChange, courses, assessments }) {
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
        <label className="form-label">Answer</label>
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

export default function ManageMcq() {
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
        const { data: qList } = await API.get(`/courses/${c._id}/assessments/${a._id}/mcq`).catch(() => ({ data: [] }));
        qList.forEach((q) => allQ.push({ ...q, courseName: c.name, assessmentName: a.name }));
      }
    }
    setAssessmentMap(aMap);
    setQuestions(allQ);
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setAssessments(assessmentMap[form.courseId] || []);
  }, [form.courseId, assessmentMap]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (q) => {
    setEditing(q);
    setForm({ courseId: q.courseId, assessmentId: q.assessmentId, question: q.question, answer: q.answer });
    setModal('edit');
  };

  const submit = async () => {
    if (!form.courseId || !form.assessmentId) return setToast({ message: 'Select course and assessment', type: 'error' });
    try {
      const payload = { question: form.question, answer: form.answer };
      if (modal === 'create') {
        await API.post(`/courses/${form.courseId}/assessments/${form.assessmentId}/mcq`, payload);
        setToast({ message: 'MCQ created!', type: 'success' });
      } else {
        await API.put(`/courses/${form.courseId}/assessments/${form.assessmentId}/mcq/${editing._id}`, payload);
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
      await API.delete(`/courses/${deleting.courseId}/assessments/${deleting.assessmentId}/mcq/${deleting._id}`);
      setToast({ message: 'Deleted', type: 'success' });
      setDeleting(null);
      load();
    } catch { setToast({ message: 'Delete failed', type: 'error' }); }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>MCQ Questions</h2>
          <p className="text-muted text-sm">{questions.length} total</p>
        </div>
        <button id="create-mcq" className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add MCQ</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Question</th><th>Answer</th><th>Course</th><th>Assessment</th><th></th></tr></thead>
          <tbody>
            {questions.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No MCQs yet.</td></tr>
            ) : questions.map((q) => (
              <tr key={q._id}>
                <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</td>
                <td className="text-sm text-success" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.answer}</td>
                <td className="text-sm text-muted">{q.courseName}</td>
                <td className="text-sm text-muted">{q.assessmentName}</td>
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
          title={modal === 'create' ? 'New MCQ' : 'Edit MCQ'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>{modal === 'create' ? 'Create' : 'Save'}</button>
            </>
          }
        >
          <McqForm value={form} onChange={setForm} courses={courses} assessments={assessments} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete MCQ" onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
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
