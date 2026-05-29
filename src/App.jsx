import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FaLinkedin, FaYoutube, FaGithub, FaExternalLinkAlt, FaFolderOpen, FaFileAlt, FaMousePointer } from 'react-icons/fa';
import heroImage from './assets/santosh.png';
import './App.css';

// ─── Project data ─────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'phone-local-agent',
    title: 'Phone Local Agent',
    date: 'May 2026',
    badge: 'New',
    repo: 'https://github.com/shantoshdurai/Phone-Local-Agent',
    tags: ['Dart', 'On-device AI', 'Automation'],
    desc: 'An on-device AI agent that understands your phone and carries out actions on your behalf — built with Dart for fast, private, fully local automation.',
  },
  {
    id: 'fluxtube',
    title: 'FluxTube',
    date: 'May 2026',
    repo: 'https://github.com/shantoshdurai/fluxtube',
    tags: ['Python', 'Flask', 'YouTube'],
    desc: 'A YouTube video creation and downloading tool with a clean Flask web UI.',
  },
  {
    id: 'manim-workflow',
    title: 'Manim Animation Workflow',
    date: 'April 2026',
    repo: 'https://github.com/shantoshdurai/Manim-Animation-Workflow',
    tags: ['Python', 'Manim'],
    desc: 'My Manim-based animation pipeline for producing high-quality educational and explainer videos for YouTube.',
  },
  {
    id: 'open-simulation',
    title: 'Open Simulation',
    date: 'April 2026',
    repo: 'https://github.com/shantoshdurai/Open-Simulation',
    tags: ['JavaScript', '3D', 'AI'],
    desc: 'An AI-driven simulation set in an interactive 3D world.',
  },
  {
    id: 'ai-inventory',
    title: 'AI Inventory Demand Forecasting',
    date: 'April 2026',
    repo: 'https://github.com/shantoshdurai/ai-inventory-demand-forecasting',
    tags: ['Python', 'XGBoost', 'Prophet', 'Streamlit'],
    desc: 'ML-powered demand forecasting for MSMEs using XGBoost, Prophet & Streamlit.',
  },
  {
    id: 'synapse',
    title: 'Synapse',
    date: 'April 2026',
    repo: 'https://github.com/shantoshdurai/synapse',
    tags: ['C++'],
    desc: 'Your thoughts, connected like a brain.',
  },
  {
    id: 'ghosttalker',
    title: 'GhostTalker',
    date: 'January 2026',
    repo: 'https://github.com/shantoshdurai/GhostTalker',
    demo: 'https://huggingface.co/spaces/Santoshp123/GhostTalker',
    tags: ['F5-TTS', 'Voice Cloning', 'HuggingFace'],
    desc: 'Zero-shot voice cloning powered by F5-TTS with live HuggingFace Spaces demo.',
  },
  {
    id: 'classnow',
    title: 'ClassNow App',
    date: 'January 2026',
    repo: 'https://github.com/shantoshdurai/ClassNow-app',
    tags: ['Flutter', 'Firebase', 'Gemini'],
    desc: 'AI-powered university class management app built with Flutter, Firebase & Gemini. Won prizes in competitions, considered as my final year project.',
  },
  {
    id: 'flower-classifier',
    title: 'Flower Species Classifier',
    date: 'November 2025',
    repo: 'https://github.com/shantoshdurai/flower-species-classifier',
    demo: 'https://santoshp123-flower-species-classifiers.hf.space/',
    tags: ['Python', 'MobileNetV2', 'Deep Learning'],
    desc: 'Deep learning image classification model using MobileNetV2 transfer learning.',
  },
  {
    id: 'university-chatbot',
    title: 'University Chatbot Langchain',
    date: 'September 2025',
    repo: 'https://github.com/shantoshdurai/university-chatbot-langchain',
    demo: 'https://university-chatbot-langchain.vercel.app/',
    tags: ['LangChain', 'Ollama', 'RAG'],
    desc: 'RAG-based university chatbot built with LangChain and Ollama (llama3.1:8b).',
  },
  {
    id: 'react-portfolio',
    title: 'React Portfolio',
    date: 'February 2026',
    repo: 'https://github.com/shantoshdurai/portfolio',
    demo: 'https://shantoshdurai.github.io/portfolio/',
    tags: ['React', 'Vite'],
    desc: 'Personal portfolio site that auto-loads GitHub projects dynamically.',
  },
];

const GITHUB_USER = 'shantoshdurai';

// Repos to keep out of the auto-synced list (profile readme, duplicates, throwaways).
const HIDE_REPOS = new Set([
  'shantoshdurai',
  'shantoshdurai.github.io',
  'happy-birthday',
  '3d-blender-archive',
  'dusky',
  'whisper',
]);

const prettifyRepoName = (name) =>
  name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const monthYear = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const repoSlug = (url) => url.split('/').pop().toLowerCase();

// Merge the curated list with live GitHub data: enrich curated entries with star
// counts, then append any other owned, described, non-fork repo not already shown.
function mergeProjects(repos) {
  const byName = {};
  repos.forEach((r) => { byName[r.name.toLowerCase()] = r; });

  const curatedSlugs = new Set(PROJECTS.map((p) => repoSlug(p.repo)));
  const enriched = PROJECTS.map((p) => {
    const r = byName[repoSlug(p.repo)];
    return r ? { ...p, stars: r.stargazers_count } : p;
  });

  const extras = repos
    .filter((r) =>
      !r.fork &&
      !r.archived &&
      r.description &&
      !curatedSlugs.has(r.name.toLowerCase()) &&
      !HIDE_REPOS.has(r.name.toLowerCase())
    )
    .map((r) => ({
      id: r.name,
      title: prettifyRepoName(r.name),
      date: monthYear(r.pushed_at),
      repo: r.html_url,
      demo: r.homepage || undefined,
      tags: r.language ? [r.language] : [],
      desc: r.description,
      stars: r.stargazers_count,
    }));

  return [...enriched, ...extras];
}

// ─── Theme Toggle ─────────────────────────────────────────────
function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
      {theme === 'light' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}

// ─── Custom Cursor — arrow pointer + hover ring ───────────────
function CustomCursor() {
  const arrowRef = useRef(null);
  const ringRef  = useRef(null);
  const mouse    = useRef({ x: -100, y: -100 });
  const ring     = useRef({ x: -100, y: -100 });
  const raf      = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, .tool-card, .comment-card, .timeline-content, .timeline-link, .theme-toggle, .social-link, .nav-btn, .hero-cta';

    // The arrow tracks the pointer 1:1 (no lag) via a GPU transform.
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (arrowRef.current) {
        arrowRef.current.style.transform =
          `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onOver = (e) => {
      const active = !!e.target.closest(INTERACTIVE);
      arrowRef.current?.classList.toggle('is-active', active);
      ringRef.current?.classList.toggle('is-active', active);
    };

    const onDown = () => arrowRef.current?.classList.add('is-down');
    const onUp   = () => arrowRef.current?.classList.remove('is-down');

    // The ring eases toward the pointer, blooming only over clickable targets.
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.18;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={arrowRef} className="cursor-arrow">
        <FaMousePointer className="cursor-arrow-icon" />
      </div>
    </>
  );
}

// ─── Scroll Progress Bar ──────────────────────────────────────
function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress = max > 0 ? el.scrollTop / max : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
      }
      raf = null;
    };
    const onScroll = () => { if (raf == null) raf = requestAnimationFrame(update); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={barRef} className="scroll-progress" />;
}

// ─── Scroll Fade-In ───────────────────────────────────────────
function FadeIn({ children, delay = 0, style, className = '', ...rest }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── YouTube Comments ─────────────────────────────────────────
function YouTubeComments() {
  const [comments, setComments] = useState([]);
  const channelId = 'UCokhrwUBEeCxIgQJTmUv-JA';
  const apiKey = 'AIzaSyDViYz1jaDASHXT0vLf-GgAjAYXekCoU-s';
  const myChannelHandle = '@santastuffs';

  useEffect(() => {
    async function fetchComments() {
      try {
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=${channelId}&maxResults=50&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          let items = data.items.map(item => {
            const topLevelComment = {
              id: item.id,
              videoId: item.snippet.videoId,
              author: item.snippet.topLevelComment.snippet.authorDisplayName,
              date: new Date(item.snippet.topLevelComment.snippet.publishedAt).toLocaleDateString(),
              text: item.snippet.topLevelComment.snippet.textDisplay,
              avatar: item.snippet.topLevelComment.snippet.authorProfileImageUrl
            };

            const replies = [];
            if (item.replies?.comments?.length > 0) {
              item.replies.comments.forEach(reply => {
                replies.push({
                  author: reply.snippet.authorDisplayName,
                  date: new Date(reply.snippet.publishedAt).toLocaleDateString(),
                  text: reply.snippet.textDisplay,
                  avatar: reply.snippet.authorProfileImageUrl
                });
              });
            }

            return { ...topLevelComment, replies };
          });

          items = items.filter(item => !item.author.includes(myChannelHandle.replace('@', '')));
          const emojiOnlyRegex = /^[\p{Emoji}\s]+$/u;
          items = items.filter(item => {
            const plain = item.text.replace(/<[^>]*>/g, '').trim();
            return plain.length > 0 && !emojiOnlyRegex.test(plain);
          });
          items = items.sort(() => 0.5 - Math.random());
          setComments(items.slice(0, 10));
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }

    if (apiKey && channelId && channelId !== 'UC_YOUR_CHANNEL_ID') fetchComments();
  }, [channelId, apiKey]);

  const duplicatedComments = [...comments, ...comments];

  return (
    <section className="youtube-section" id="youtube">
      <div className="youtube-title-container">
        <h2 className="youtube-title">Comments from</h2>
        <div className="youtube-icon-red">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      </div>
      <div className="comments-ticker-wrapper">
        <div className="comments-ticker">
          {duplicatedComments.length > 0 && duplicatedComments.map((comment, index) => (
            <div
              key={`${comment.id}-${index}`}
              className="comment-card"
              onClick={() => window.open(`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`, '_blank')}
            >
              <a
                href={`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="comment-external-link"
                onClick={e => e.stopPropagation()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              <div className="comment-header">
                <img src={comment.avatar} alt="Avatar" className="comment-avatar" />
                <div className="comment-meta">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">{comment.date}</span>
                </div>
              </div>
              <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }} />
              {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies">
                  {comment.replies.slice(0, 2).map((reply, replyIndex) => (
                    <div key={replyIndex} className="reply-card">
                      <div className="reply-header">
                        <img src={reply.avatar} alt="Avatar" className="reply-avatar" />
                        <div className="reply-meta">
                          <span className="reply-author">{reply.author}</span>
                          <span className="reply-date">{reply.date}</span>
                        </div>
                      </div>
                      <p className="reply-text" dangerouslySetInnerHTML={{ __html: reply.text }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Project Detail Modal ─────────────────────────────────────
function ProjectModal({ project, onClose }) {
  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="project-modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="project-modal-date">
          {project.date}
          {project.stars > 0 && <span className="project-stars"> · ★ {project.stars}</span>}
        </div>
        <h3 className="project-modal-title">{project.title}</h3>

        {project.tags && (
          <div className="project-modal-tags">
            {project.tags.map((t) => (
              <span key={t} className="project-tag">{t}</span>
            ))}
          </div>
        )}

        <p className="project-modal-desc">{project.desc}</p>

        <div className="project-modal-actions">
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className="project-modal-btn primary">
            <FaGithub size={15} /> View Repository
          </a>
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-modal-btn">
              <FaExternalLinkAlt size={12} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Command Palette (⌘K) ─────────────────────────────────────
function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase().trim())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSel(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setSel(0); }, [query]);

  useEffect(() => {
    if (open) document.querySelector('.cmdk-item.is-sel')?.scrollIntoView({ block: 'nearest' });
  }, [sel, open]);

  if (!open) return null;

  const run = (cmd) => { onClose(); cmd.run(); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[sel]) run(filtered[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <div className="cmdk-backdrop" onClick={onClose}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Command menu" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <svg className="cmdk-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Search projects, sections, links…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="cmdk-esc">esc</kbd>
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 && <div className="cmdk-empty">No results</div>}
          {filtered.map((c, i) => (
            <button
              key={c.id}
              className={`cmdk-item ${i === sel ? 'is-sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => run(c)}
            >
              <span className="cmdk-item-label">{c.label}</span>
              <span className="cmdk-item-group">{c.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  const [activeProject, setActiveProject] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [projects, setProjects] = useState(PROJECTS);

  // Pull live repos from GitHub on load; fall back silently to the curated list.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
        if (!res.ok) return;
        const repos = await res.json();
        if (!cancelled && Array.isArray(repos)) setProjects(mergeProjects(repos));
      } catch {
        /* offline or rate-limited — keep the curated list */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleTheme = (e) => {
    const next = theme === 'light' ? 'dark' : 'light';

    const apply = () => {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      setTheme(next);
    };

    if (!document.startViewTransition) {
      apply();
      return;
    }

    // Origin the circular reveal on the toggle button, or the top-right when invoked without an event (e.g. command palette).
    let x = window.innerWidth - 48;
    let y = 48;
    if (e && e.currentTarget) {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }
    document.documentElement.style.setProperty('--toggle-x', `${Math.round(x)}px`);
    document.documentElement.style.setProperty('--toggle-y', `${Math.round(y)}px`);

    document.startViewTransition(() => { flushSync(apply); });
  };

  const openProject = (project) => setActiveProject(project);

  // Experience cards open their primary link directly; project cards open the detail modal instead.
  const openCardLink = (e) => {
    if (e.target.closest('a, button, [role="button"]')) return;
    const card = e.currentTarget;
    const link =
      card.querySelector('a.demo-link') ||
      card.querySelector('a.github-link') ||
      card.querySelector('a');
    if (link) window.open(link.href, '_blank', 'noopener,noreferrer');
  };

  // ⌘K / Ctrl+K toggles the command palette; Escape closes the open project modal.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setActiveProject(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const commands = [
    { id: 'nav-exp',   group: 'Navigate', label: 'Go to Experience',        run: () => scrollTo('experience') },
    { id: 'nav-proj',  group: 'Navigate', label: 'Go to Projects',          run: () => scrollTo('projects') },
    { id: 'nav-yt',    group: 'Navigate', label: 'Go to YouTube Comments',  run: () => scrollTo('youtube') },
    { id: 'nav-stack', group: 'Navigate', label: 'Go to Stack',             run: () => scrollTo('stack') },
    { id: 'nav-top',   group: 'Navigate', label: 'Back to Top',             run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    ...projects.map((p) => ({ id: `proj-${p.id}`, group: 'Projects', label: `Open ${p.title}`, run: () => setActiveProject(p) })),
    { id: 'lnk-gh', group: 'Links', label: 'Open GitHub',          run: () => window.open('https://github.com/shantoshdurai', '_blank', 'noopener') },
    { id: 'lnk-li', group: 'Links', label: 'Open LinkedIn',        run: () => window.open('https://www.linkedin.com/in/santoshp123/', '_blank', 'noopener') },
    { id: 'lnk-yt', group: 'Links', label: 'Open YouTube Channel', run: () => window.open('https://www.youtube.com/@santastuffs', '_blank', 'noopener') },
    { id: 'lnk-cv', group: 'Links', label: 'Download CV',          run: () => window.open('/CV-resume.pdf', '_blank', 'noopener') },
    { id: 'theme',  group: 'Theme', label: 'Toggle light / dark theme', run: () => toggleTheme() },
  ];

  return (
    <div className="app-container">
      <div className="grain-overlay" />
      <ScrollProgress />
      <CustomCursor />

      {/* Header */}
      <header className="header">
        <div className="nav-logo">
          <a href="/">SD</a>
        </div>
        <div className="nav-right">
          <div className="nav-links">
            <a href="https://shantoshdurai.github.io/projects/" target="_blank" rel="noopener noreferrer" className="nav-btn">Projects</a>
            <a href="/CV-resume.pdf" target="_blank" rel="noopener noreferrer" className="nav-btn">Get my CV</a>
          </div>
          <button className="cmdk-trigger" onClick={() => setPaletteOpen(true)} aria-label="Open command menu" title="Command menu (⌘K)">
            <kbd>⌘</kbd><kbd>K</kbd>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">

        {/* Hero Section — CSS-animated, no FadeIn wrapper needed */}
        <section className="hero-section">
          <img
            src={heroImage}
            alt="Santosh"
            className="hero-avatar"
          />
          <div className="hero-eyebrow">// full-stack · ai · content creator</div>
          <h1 className="hero-title">Hi, I'm <em>Santosh</em></h1>
          <p className="hero-subtitle">
            Software Engineer specializing in Full-Stack Development and AI. I love making <a href="https://shantoshdurai.github.io/projects/" target="_blank" rel="noopener noreferrer">projects</a> and videos about tech & AI. Based in Trichy, India.
          </p>
          <a href="mailto:Shantoshdurai06@gmail.com" className="hero-cta">Work with me →</a>
        </section>

        {/* Work Experience Section */}
        <section className="timeline-vertical" id="experience">
          <FadeIn>
            <span className="section-label">01 — Experience</span>
            <h2 className="section-title">Work & Experience</h2>
          </FadeIn>

          <div className="timeline-wrapper">

            <FadeIn className="timeline-content" onClick={openCardLink}>
              <div className="timeline-links">
                <a href="https://www.youtube.com/@santastuffs" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link" onClick={(e) => e.stopPropagation()}>View Channel</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">Content Creator</div>
                <div className="timeline-date">March 2025 — Present</div>
              </div>
              <p className="timeline-desc">
                Creating and exploring tech on my own YouTube channel (@santastuffs). 151 subscribers and over 43.3K views. Producing content on AI, development, and tech insights.
              </p>
            </FadeIn>

            <FadeIn className="timeline-content" onClick={openCardLink}>
              <div className="timeline-links">
                <a href="https://www.youtube.com/@Behind_the_Feature" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link" onClick={(e) => e.stopPropagation()}>View Channel</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">Behind The Feature</div>
                <div className="timeline-date">January — March 2025</div>
              </div>
              <p className="timeline-desc">
                Freelance video editor & content strategist for tech YouTube channel (1.49K+ subscribers). Edited shorts, optimized titles, descriptions, and LinkedIn content for Deeksha, a Google tech industry insider.
              </p>
            </FadeIn>

          </div>
        </section>

        {/* GitHub Projects Timeline */}
        <section className="timeline-vertical" id="projects">
          <FadeIn>
            <span className="section-label">02 — Projects</span>
            <h2 className="section-title">Projects & Repositories</h2>
          </FadeIn>

          <div className="timeline-wrapper">
            {projects.map((p) => (
              <FadeIn
                key={p.id}
                className="timeline-content project-card"
                onClick={() => openProject(p)}
              >
                <div className="timeline-links">
                  <a href={p.repo} target="_blank" rel="noopener noreferrer" className="timeline-link github-link" onClick={(e) => e.stopPropagation()}>GitHub Repo</a>
                  {p.demo && (
                    <>
                      <span className="timeline-separator">•</span>
                      <a href={p.demo} target="_blank" rel="noopener noreferrer" className="timeline-link demo-link" onClick={(e) => e.stopPropagation()}>Live Demo</a>
                    </>
                  )}
                  {p.badge && <span className="new-badge">{p.badge}</span>}
                  {p.stars > 0 && <span className="repo-stars">★ {p.stars}</span>}
                  <span className="card-open-hint">Details →</span>
                </div>
                <div className="timeline-title-container">
                  <div className="timeline-title">{p.title}</div>
                  <div className="timeline-date">{p.date}</div>
                </div>
                <p className="timeline-desc">{p.desc}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* YouTube Comments Section */}
        <YouTubeComments />

        {/* Tools Section */}
        <section className="icon-list-wrapper" id="stack">
          <FadeIn style={{ width: '100%', textAlign: 'center' }}>
            <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>03 — Stack</span>
            <h2 className="section-title tools-title">Tools I use to build</h2>
          </FadeIn>
          <div className="tools-grid">

            <FadeIn delay={0} className="tool-row">
              <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="JavaScript" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">JavaScript</span><span className="tool-type">Language</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">React</span><span className="tool-type">UI Library</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://www.python.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Python</span><span className="tool-type">Language</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://flutter.dev/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg" alt="Flutter" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Flutter</span><span className="tool-type">Mobile Toolkit</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" alt="Node.js" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Node.js</span><span className="tool-type">JS Runtime</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
            </FadeIn>

            <FadeIn delay={80} className="tool-row">
              <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg" alt="Firebase" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Firebase</span><span className="tool-type">App Platform</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg" alt="Supabase" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Supabase</span><span className="tool-type">Backend as a Service</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" alt="Git" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Git</span><span className="tool-type">Version Control</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">GitHub</span><span className="tool-type">Code Hosting</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg" alt="Vercel" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Vercel</span><span className="tool-type">Deploy Platform</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
            </FadeIn>

            <FadeIn delay={160} className="tool-row">
              <a href="https://huggingface.co/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon" style={{fontSize:'1.5rem'}}>🤗</div>
                <div className="tool-info"><span className="tool-name">Hugging Face</span><span className="tool-type">AI Models</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://www.langchain.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon" style={{fontSize:'1.5rem'}}>🦜</div>
                <div className="tool-info"><span className="tool-name">LangChain</span><span className="tool-type">LLM Framework</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://www.tensorflow.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg" alt="TensorFlow" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">TensorFlow</span><span className="tool-type">Machine Learning</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://unity.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-original.svg" alt="Unity" className="tool-img" style={{filter:'invert(1)'}}/></div>
                <div className="tool-info"><span className="tool-name">Unity</span><span className="tool-type">Game Engine</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/androidstudio/androidstudio-original.svg" alt="Android Studio" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Android Studio</span><span className="tool-type">Android IDE</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
            </FadeIn>

            <FadeIn delay={240} className="tool-row">
              <a href="https://www.blender.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/blender/blender-original.svg" alt="Blender" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Blender</span><span className="tool-type">3D Suite</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon" style={{fontSize:'1.5rem'}}>✨</div>
                <div className="tool-info"><span className="tool-name">Claude</span><span className="tool-type">AI Assistant</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
              <a href="https://www.adobe.com/creativecloud.html" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-plain.svg" alt="Adobe" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Adobe CC</span><span className="tool-type">Creative Suite</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={10} /></div>
              </a>
            </FadeIn>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-quote-container">
            <p className="footer-quote">"The only way to do great work is to love what you do."</p>
            <p className="footer-author">— Steve Jobs</p>
          </div>
          <div className="footer-contact">
            <a href="https://shantoshdurai.github.io/projects/" target="_blank" rel="noopener noreferrer">Projects</a>
            <a href="mailto:Shantoshdurai06@gmail.com">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Santosh.</p>
          <div className="footer-socials">
            <a href="https://www.linkedin.com/in/santoshp123/" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
              <FaLinkedin size={19} />
            </a>
            <a href="https://www.youtube.com/@santastuffs" target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
              <FaYoutube size={19} />
            </a>
            <a href="https://github.com/shantoshdurai" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
              <FaGithub size={19} />
            </a>
            <a href="https://shantoshdurai.github.io/projects/" target="_blank" rel="noopener noreferrer" className="social-link mobile-only-link" title="Projects">
              <FaFolderOpen size={19} />
            </a>
            <a href="/CV-resume.pdf" target="_blank" rel="noopener noreferrer" className="social-link mobile-only-link" title="Get My CV">
              <FaFileAlt size={19} />
            </a>
          </div>
        </div>
      </footer>

      {activeProject && (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}

export default App;
