import React, { useCallback, useEffect, useMemo, useState } from 'react';

const empty = { fullName: '', email: '', course: 'BSIT', yearLevel: '2', status: 'ACTIVE' };

async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
  } catch {
    throw new Error('API unreachable. Please start the backend and MySQL.');
  }
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status}).`);
  return body;
}

function Form({ value, onChange, onSave, onCancel, editing, busy }) {
  return <form onSubmit={onSave} className="student-form">
    <label htmlFor="name">Full name</label>
    <input id="name" name="fullName" value={value.fullName} onChange={onChange} placeholder="e.g. Maria Santos" autoComplete="off" required minLength={2} maxLength={100} />
    <label htmlFor="email">Email address</label>
    <input id="email" name="email" value={value.email} onChange={onChange} type="email" placeholder="maria@example.com" autoComplete="off" required maxLength={150} />
    <div className="form-columns"><div><label htmlFor="course">Course</label><input id="course" name="course" value={value.course} onChange={onChange} maxLength={80} minLength={2} required /></div>
      <div><label htmlFor="year">Year level</label><select id="year" name="yearLevel" value={value.yearLevel} onChange={onChange}>{[1,2,3,4].map(x=><option key={x} value={x}>Year {x}</option>)}</select></div></div>
    <label htmlFor="status">Status</label><select id="status" name="status" value={value.status} onChange={onChange}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
    <div className="form-actions"><button type="submit" className="button primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : '+ Add student'}</button>{editing && <button type="button" className="button secondary" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}

function StudentDesk() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [term, setTerm] = useState('');
  const [online, setOnline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      await api('/health');
      const result = await api('/students');
      setStudents(result);
      setOnline(true);
      setError('');
    } catch (err) {
      setOnline(false);
      setError(err.message);
      setStudents([]);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const visible = useMemo(() => students.filter(student =>
    [student.fullName, student.email, student.course].some(value => String(value).toLowerCase().includes(term.trim().toLowerCase()))
  ), [students, term]);
  const active = students.filter(x=>x.status === 'ACTIVE').length;
  function change(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }
  function cancel() { setForm(empty); setEditId(null); }
  async function save(e) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      await api(editId ? `/students/${editId}` : '/students', { method: editId ? 'PUT' : 'POST', body: JSON.stringify({ ...form, yearLevel: Number(form.yearLevel) }) });
      setNotice(editId ? 'Student updated.' : 'Student added.'); cancel(); await reload();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function edit(s) {
    setEditId(s.id);
    setForm({ fullName:s.fullName,email:s.email,course:s.course,yearLevel:String(s.yearLevel),status:s.status });
    setNotice(''); setError('');
    document.getElementById('student-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function remove(s) {
    if (!window.confirm(`Delete ${s.fullName}'s record?`)) return;
    setBusy(true); setError(''); setNotice('');
    try { await api(`/students/${s.id}`, { method: 'DELETE' }); if (editId === s.id) cancel(); setNotice('Student deleted.'); await reload(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="desk section" id="student-app"><div className="container">
    <div className="section-header"><div><div className="label">02 / STUDENT RECORDS</div><h2>Manage your <em>students.</em></h2><p>Full CRUD with Express, Prisma ORM and MySQL.</p></div><span className={`connect ${online === true ? 'good' : online === false ? 'bad' : ''}`} role="status"><i></i>{online === null ? 'Checking…' : online ? 'MySQL connected' : 'Database offline'}</span></div>
    <div className="metrics"><div className="metric"><span>All students</span><strong>{online ? students.length : '—'}</strong></div><div className="metric"><span>Active</span><strong>{online ? active : '—'}</strong></div><div className="metric"><span>Inactive</span><strong>{online ? students.length - active : '—'}</strong></div></div>
    {error && <div role="alert" className="message danger">{error}</div>}
    {notice && <div role="status" className="message success">{notice}</div>}
    <div className="work-area">
      <div className="panel form-panel" id="student-form"><div className="panel-header"><div><div className="label">STUDENT FORM</div><h3>{editId ? 'Edit record' : 'Add new student'}</h3></div><span className="panel-symbol">+</span></div><Form value={form} onChange={change} onSave={save} onCancel={cancel} editing={editId !== null} busy={busy} /></div>
      <div className="panel list-panel"><div className="panel-header"><div><div className="label">STUDENT LIST</div><h3>Student records</h3></div><button type="button" title="Refresh student records" className="refresh" onClick={reload} disabled={loading}>↻</button></div>
        <label className="search-label" htmlFor="search">Search students</label><input className="search" id="search" placeholder="Search by name, email or course..." value={term} onChange={e=>setTerm(e.target.value)} />
        <div className="table-scroller"><table><thead><tr><th>Student</th><th>Course</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {visible.length === 0 ? <tr><td colSpan="5" className="empty">{loading ? 'Loading records…' : online ? 'No students found.' : 'Start MySQL and the backend to load records.'}</td></tr>
          : visible.map(s => <tr key={s.id}><td><strong>{s.fullName}</strong><small>{s.email}</small></td><td>{s.course}</td><td>{s.yearLevel}</td><td><span className={`status ${s.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{s.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td><td><div className="actions"><button type="button" disabled={busy} onClick={()=>edit(s)}>Edit</button><button type="button" className="remove" disabled={busy} onClick={()=>remove(s)}>Delete</button></div></td></tr>)}
        </tbody></table></div><div className="records-note">Showing {visible.length} of {students.length} records</div>
      </div>
    </div>
    <p className="privacy">For classroom demonstrations, use fictional student information only. This project has no user login and should not be exposed publicly without security controls.</p>
  </div></section>;
}

function App() {
  return <><header className="topbar"><div className="container top-inner"><a href="#home" className="brand"><span>JI</span><b>STUDENT DESK</b></a><nav><a href="#about">About</a><a href="#student-app">Student App</a><a href="https://github.com/Johniversonulleras/John-IversonPortfolio" target="_blank" rel="noopener noreferrer">Portfolio ↗</a></nav></div></header>
    <main>
      <section className="hero" id="home"><div className="container hero-grid"><div><div className="hero-tag"><i></i> FULL-STACK STUDENT PROJECT</div><p className="intro">WELCOME TO MY PROJECT</p><h1>Student <em>Management</em> System.</h1><p className="hero-desc">A simple way to organize student records. Create, view, update, delete, and search in one place.</p><div className="hero-links"><a className="button primary" href="#student-app">Open student app ↗</a><a className="button ghost" href="#about">About this project ↓</a></div><div className="authored">CREATED BY <strong>JOHN IVERSON ULLERAS</strong></div></div><div className="hero-graphic"><div className="shape shape-a"></div><div className="shape shape-b"></div><div className="device"><div className="device-head"><span>JI.</span><small>STUDENTS</small><b>● ● ●</b></div><div className="device-card"><div className="device-title">Student Records</div><div className="device-row"><i></i><span></span><b></b></div><div className="device-row"><i></i><span></span><b></b></div><div className="device-row"><i></i><span></span><b></b></div></div></div></div></div></section>
      <section id="about" className="about section"><div className="container about-grid"><div><div className="label">01 / ABOUT THIS PROJECT</div><h2>Built for <em>learning.</em></h2></div><div><p>The Student Management System is my practical project in full-stack development. The frontend is built in React, while an Express API uses Prisma ORM to store records in MySQL.</p><div className="tech"><span>React</span><span>Express</span><span>Prisma ORM</span><span>MySQL</span></div></div></div></section>
      <StudentDesk />
    </main><footer><div className="container foot-inner"><span>© 2026 John Iverson Ulleras</span><span>React · Express · Prisma ORM · MySQL</span></div></footer>
  </>;
}
export default App;
