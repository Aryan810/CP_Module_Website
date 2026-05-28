import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Api from '../../services/api';

const empty = {
  slug: '', title: '', date: new Date().toISOString().slice(0, 16), location: '',
  banner: '', images: [], tags: [], shortDescription: '', body: '', links: [],
};

export default function AdminEventEdit() {
  const { slug } = useParams();
  const nav = useNavigate();
  const isNew = !slug || slug === 'new';
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    Api.listEvents().then((all) => {
      const e = all.find((x) => x.slug === slug);
      if (e) setForm({ ...empty, ...e });
      else Api.loadStaticEvents().then((s) => {
        const f = s.find((x) => x.slug === slug);
        if (f) setForm({ ...empty, ...f });
      });
    });
  }, [slug, isNew]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setArr = (k, raw) => setForm((p) => ({ ...p, [k]: raw.split(',').map((s) => s.trim()).filter(Boolean) }));

  const save = async () => {
    if (!form.slug.trim()) return setMsg('Slug is required (used in URL).');
    setBusy(true); setMsg('');
    try {
      await Api.saveEvent(form.slug, form);
      setMsg('Saved.');
      nav('/admin/events');
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  return (
    <main className="page-content-area" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>{isNew ? 'New event' : `Edit · ${slug}`}</h1>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <label>Slug (URL id)<input value={form.slug} onChange={(e) => set('slug', e.target.value)} disabled={!isNew} className="form-input" /></label>
        <label>Title<input value={form.title} onChange={(e) => set('title', e.target.value)} className="form-input" /></label>
        <label>Date & time<input type="datetime-local" value={form.date?.slice(0, 16)} onChange={(e) => set('date', new Date(e.target.value).toISOString())} className="form-input" /></label>
        <label>Location<input value={form.location} onChange={(e) => set('location', e.target.value)} className="form-input" /></label>
        <label>Banner image URL<input value={form.banner} onChange={(e) => set('banner', e.target.value)} className="form-input" /></label>
        <label>Gallery images (comma-separated URLs)<input value={(form.images || []).join(', ')} onChange={(e) => setArr('images', e.target.value)} className="form-input" /></label>
        <label>Tags (comma-separated)<input value={(form.tags || []).join(', ')} onChange={(e) => setArr('tags', e.target.value)} className="form-input" /></label>
        <label>Short description<input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className="form-input" /></label>
        <label>Body (Markdown supported)<textarea rows={10} value={form.body} onChange={(e) => set('body', e.target.value)} className="form-input" /></label>
        <label>Links (JSON, e.g. [{`{"label":"Discord","url":"https://…"}`}])
          <textarea rows={3} value={JSON.stringify(form.links || [], null, 2)}
            onChange={(e) => { try { set('links', JSON.parse(e.target.value)); } catch { /* ignore */ } }}
            className="form-input" />
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-cta-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          <button onClick={() => nav(-1)}>Cancel</button>
        </div>
        {msg && <p>{msg}</p>}
      </div>
      <style>{`label{display:flex;flex-direction:column;gap:0.25rem;}
        .form-input{padding:0.5rem;border-radius:6px;border:1px solid #374151;background:#111827;color:inherit;font-family:inherit;}
        button{padding:0.5rem 1rem;border-radius:6px;border:1px solid #374151;background:transparent;color:inherit;cursor:pointer;}
      `}</style>
    </main>
  );
}
