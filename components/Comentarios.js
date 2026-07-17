import { useState, useEffect, useCallback } from 'react';

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'elym';
const ES = SITE_ID === 'elym';

const T = {
  title: ES ? 'Comentarios' : 'Comments',
  empty: ES
    ? 'Todavía no hay comentarios. ¡Sé la primera en opinar!'
    : 'No comments yet. Be the first to share your thoughts!',
  loading: ES ? 'Cargando comentarios…' : 'Loading comments…',
  name: ES ? 'Tu nombre' : 'Your name',
  placeholder: ES
    ? '¿Qué te pareció? Cuidado con los spoilers 👀'
    : 'What did you think? Watch out for spoilers 👀',
  send: ES ? 'Publicar comentario' : 'Post comment',
  sending: ES ? 'Enviando…' : 'Sending…',
  success: ES
    ? '¡Gracias! Tu comentario quedó pendiente de aprobación y aparecerá pronto.'
    : 'Thank you! Your comment is awaiting approval and will appear soon.',
  reply: ES ? 'Responder' : 'Reply',
  cancel: ES ? 'Cancelar' : 'Cancel',
  replyingTo: ES ? 'Respondiendo a' : 'Replying to',
  error: ES ? 'Algo salió mal. Inténtalo de nuevo.' : 'Something went wrong. Please try again.',
};

const C = {
  crema: '#F5F0E8',
  matcha: '#7A9E7E',
  matchaClaro: '#C8DBC9',
  dorado: '#C9A84C',
  blossom: '#E8C4B0',
  mocha: '#6B4F3A',
  negro: '#2C2C2C',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(ES ? 'es-CL' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function initials(name) {
  return name.trim().charAt(0).toUpperCase();
}

function buildTree(list) {
  const map = new Map();
  const roots = [];
  list.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  list.forEach((c) => {
    const node = map.get(c.id);
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id).replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function Comment({ comment, onReply, depth = 0 }) {
  return (
    <div style={{ marginLeft: depth > 0 ? 28 : 0, marginTop: 20 }}>
      <div
        style={{
          background: depth > 0 ? 'transparent' : C.crema,
          border: depth > 0 ? `1px solid ${C.matchaClaro}` : 'none',
          borderRadius: 12,
          padding: '16px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: C.matcha,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {initials(comment.author_name)}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 16,
                color: C.negro,
                lineHeight: 1.2,
              }}
            >
              {comment.author_name}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: C.mocha,
                opacity: 0.7,
              }}
            >
              {formatDate(comment.created_at)}
            </div>
          </div>
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            lineHeight: 1.65,
            color: C.negro,
            margin: '0 0 10px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {comment.content}
        </p>

        <button
          onClick={() => onReply(comment)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: C.matcha,
            fontWeight: 500,
          }}
        >
          {T.reply}
        </button>
      </div>

      {comment.replies.map((r) => (
        <Comment key={r.id} comment={r} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function Comentarios({ slug }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // Recuerda el nombre para que no lo escriba cada vez
  useEffect(() => {
    const saved = window.localStorage.getItem('comment_author_name');
    if (saved) setName(saved);
  }, []);

  async function handleSubmit() {
    setMessage(null);
    setSending(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          author_name: name,
          content,
          parent_id: replyTo?.id || null,
          website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || T.error });
      } else {
        window.localStorage.setItem('comment_author_name', name.trim());
        setMessage({ type: 'success', text: T.success });
        setContent('');
        setReplyTo(null);
      }
    } catch {
      setMessage({ type: 'error', text: T.error });
    } finally {
      setSending(false);
    }
  }

  const tree = buildTree(comments);
  const canSubmit = name.trim().length >= 2 && content.trim().length >= 2 && !sending;

  return (
    <section style={{ maxWidth: 720, margin: '64px auto 0', padding: '0 16px' }}>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          color: C.negro,
          margin: '0 0 4px',
        }}
      >
        {T.title}
        {comments.length > 0 && (
          <span style={{ color: C.dorado, fontSize: 20 }}> ({comments.length})</span>
        )}
      </h2>
      <div style={{ height: 2, width: 56, background: C.dorado, marginBottom: 28 }} />

      {/* ---------- Formulario ---------- */}
      <div
        style={{
          background: C.crema,
          border: `1px solid ${C.matchaClaro}`,
          borderRadius: 14,
          padding: 22,
          position: 'relative',
        }}
      >
        {replyTo && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: C.mocha,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>
              {T.replyingTo} <strong>{replyTo.author_name}</strong>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: C.matcha,
                cursor: 'pointer',
                fontSize: 13,
                padding: 0,
              }}
            >
              {T.cancel}
            </button>
          </div>
        )}

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={T.name}
          maxLength={40}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 8,
            border: `1px solid ${C.matchaClaro}`,
            background: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: C.negro,
            marginBottom: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={T.placeholder}
          maxLength={2000}
          rows={4}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 8,
            border: `1px solid ${C.matchaClaro}`,
            background: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: C.negro,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Honeypot — invisible para humanas, irresistible para bots */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: C.mocha,
              opacity: 0.6,
            }}
          >
            {content.length}/2000
          </span>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? C.matcha : C.matchaClaro,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '11px 22px',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {sending ? T.sending : T.send}
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              background: message.type === 'success' ? C.matchaClaro : C.blossom,
              color: message.type === 'success' ? C.mocha : '#8B3A2F',
            }}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* ---------- Lista ---------- */}
      <div style={{ marginTop: 32 }}>
        {loading ? (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: C.mocha,
              opacity: 0.7,
            }}
          >
            {T.loading}
          </p>
        ) : tree.length === 0 ? (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: C.mocha,
              opacity: 0.7,
              textAlign: 'center',
              padding: '24px 0',
            }}
          >
            {T.empty}
          </p>
        ) : (
          tree.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              onReply={(target) => {
                setReplyTo(target);
                window.scrollTo({ top: window.scrollY - 300, behavior: 'smooth' });
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
