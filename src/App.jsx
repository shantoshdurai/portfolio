import React, { useEffect, useRef, useState } from 'react';
import { FaLinkedin, FaYoutube, FaGithub, FaExternalLinkAlt, FaFolderOpen, FaFileAlt } from 'react-icons/fa';
import heroImage from './assets/santosh.png';
import './App.css';

// Bidirectional Gaussian Blur Animation
function FadeIn({ children, delay = 0, style, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    // We do NOT unobserve so it re-animates every time it scrolls into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

// YouTube Comments Component with Fetching Logic
function YouTubeComments() {
  const [comments, setComments] = useState([]);
  const channelId = 'UCokhrwUBEeCxIgQJTmUv-JA'; // Replace this with your actual Channel ID
  const apiKey = 'AIzaSyDViYz1jaDASHXT0vLf-GgAjAYXekCoU-s';
  const myChannelHandle = '@santastuffs'; // Your channel handle to filter out

  useEffect(() => {
    async function fetchComments() {
      try {
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=${channelId}&maxResults=50&key=${apiKey}`;
        console.log("Fetching from:", url);
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("YouTube API Response:", data);

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

            // Include replies if available
            const replies = [];
            if (item.replies && item.replies.comments && item.replies.comments.length > 0) {
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

          // Filter out own comments
          items = items.filter(item => !item.author.includes(myChannelHandle.replace('@', '')));

          // Filter out emoji-only comments (no real words)
          const emojiOnlyRegex = /^[\p{Emoji}\s]+$/u;
          items = items.filter(item => {
            const plain = item.text.replace(/<[^>]*>/g, '').trim();
            return plain.length > 0 && !emojiOnlyRegex.test(plain);
          });

          // Randomly shuffle the comments array
          items = items.sort(() => 0.5 - Math.random());

          // Keep a subset of random comments (e.g. 10) to make the ticker manageable
          setComments(items.slice(0, 10));
        } else {
          console.warn("No comments found or API error:", data.error || "Empty items");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
    
    if (apiKey && channelId && channelId !== 'UC_YOUR_CHANNEL_ID') {
      fetchComments();
    }
  }, [channelId, apiKey]);

  const duplicatedComments = [...comments, ...comments];

  return (
    <section className="youtube-section">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="nav-logo">
          <a href="/">SD</a>
        </div>
        <div className="nav-links">
          <a href="https://shantoshdurai.github.io/" target="_blank" rel="noopener noreferrer" className="nav-btn">PROJECTS</a>
          <a href="/CV-resume.pdf" target="_blank" rel="noopener noreferrer" className="nav-btn">GET MY CV</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Hero Section */}
        <section className="hero-section">
          <FadeIn style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={heroImage}
              alt="Santosh" 
              className="hero-avatar"
            />
            <h1 className="hero-title">Hi, I'm Santosh</h1>
            <p className="hero-subtitle">
              Software Engineer specializing in Full-Stack Development and AI. I love making <a href="https://shantoshdurai.github.io/" target="_blank" rel="noopener noreferrer">projects</a> and videos about tech & AI. Based in Trichy, India.
            </p>

            <a href="mailto:Shantoshdurai06@gmail.com" className="hero-cta">Work with me</a>
          </FadeIn>
        </section>

        {/* Work Experience Section */}
        <section className="timeline-vertical">
          <h2 className="section-title">Work & Experience</h2>

          <div className="timeline-wrapper">

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://www.youtube.com/@santastuffs" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link">View Channel</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">Content Creator</div>
                <div className="timeline-date">March 2025 - Present</div>
              </div>
              <p className="timeline-desc">
                Creating and exploring tech on my own YouTube channel (@santastuffs). 151 subscribers and over 43.3K views. Producing content on AI, development, and tech insights.
              </p>
            </FadeIn>

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://www.youtube.com/@Behind_the_Feature" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link">View Channel</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">Behind The Feature</div>
                <div className="timeline-date">January - March 2025</div>
              </div>
              <p className="timeline-desc">
                Freelance video editor & content strategist for tech YouTube channel (1.49K+ subscribers). Edited shorts, optimized titles, descriptions, and LinkedIn content for Deeksha, a Google tech industry insider.
              </p>
            </FadeIn>

          </div>
        </section>

        {/* GitHub Projects Timeline */}
        <section className="timeline-vertical">
          <h2 className="section-title">Projects & Repositories</h2>
          
          <div className="timeline-wrapper">

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://github.com/shantoshdurai/synapse" target="_blank" rel="noopener noreferrer" className="timeline-link github-link">GitHub Repo</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">Synapse</div>
                <div className="timeline-date">April 2026</div>
              </div>
              <p className="timeline-desc">
                Your thoughts, connected like a brain.
              </p>
            </FadeIn>

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://github.com/shantoshdurai/GhostTalker" target="_blank" rel="noopener noreferrer" className="timeline-link github-link">GitHub Repo</a>
                <span className="timeline-separator">•</span>
                <a href="https://huggingface.co/spaces/Santoshp123/GhostTalker" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link">Live Demo</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">GhostTalker</div>
                <div className="timeline-date">January 2026</div>
              </div>
              <p className="timeline-desc">
                Zero-shot voice cloning powered by F5-TTS with live HuggingFace Spaces demo.
              </p>
            </FadeIn>
            
            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://github.com/shantoshdurai/ClassNow-app" target="_blank" rel="noopener noreferrer" className="timeline-link github-link">GitHub Repo</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">ClassNow App</div>
                <div className="timeline-date">January 2026</div>
              </div>
              <p className="timeline-desc">
                AI-powered university class management app built with Flutter, Firebase & Gemini, Won prizes in competions considered as my final year project.
              </p>
            </FadeIn>

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://github.com/shantoshdurai/flower-species-classifier" target="_blank" rel="noopener noreferrer" className="timeline-link github-link">GitHub Repo</a>
                <span className="timeline-separator">•</span>
                <a href="https://santoshp123-flower-species-classifiers.hf.space/" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link">Live Demo</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">Flower Species Classifier</div>
                <div className="timeline-date">November 2025</div>
              </div>
              <p className="timeline-desc">
                Deep learning image classification model using MobileNetV2 transfer learning.
              </p>
            </FadeIn>

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://github.com/shantoshdurai/university-chatbot-langchain" target="_blank" rel="noopener noreferrer" className="timeline-link github-link">GitHub Repo</a>
                <span className="timeline-separator">•</span>
                <a href="https://university-chatbot-langchain.vercel.app/" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link">Live Demo</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">University Chatbot Langchain</div>
                <div className="timeline-date">September 2025</div>
              </div>
              <p className="timeline-desc">
                RAG-based university chatbot built with LangChain and Ollama (llama3.1:8b).
              </p>
            </FadeIn>

            <FadeIn className="timeline-content">
              <div className="timeline-links">
                <a href="https://github.com/shantoshdurai/shantoshdurai.github.io" target="_blank" rel="noopener noreferrer" className="timeline-link github-link">GitHub Repo</a>
                <span className="timeline-separator">•</span>
                <a href="https://shantoshdurai.github.io" target="_blank" rel="noopener noreferrer" className="timeline-link demo-link">Live Demo</a>
              </div>
              <div className="timeline-title-container">
                <div className="timeline-title">React Portfolio</div>
                <div className="timeline-date">February 2026</div>
              </div>
              <p className="timeline-desc">
                Personal portfolio site that auto-loads GitHub projects dynamically.
              </p>
            </FadeIn>

          </div>
        </section>

        {/* YouTube Comments Section (Moved above Tools) */}
        <YouTubeComments />

        {/* Tools Section */}
        <section className="icon-list-wrapper">
          <FadeIn style={{ width: '100%' }}>
            <h2 className="section-title tools-title">Tools I use to build</h2>
          </FadeIn>
          <div className="tools-grid">

            <FadeIn delay={0} className="tool-row">
              <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="JavaScript" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">JavaScript</span><span className="tool-type">Programming Language</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">React</span><span className="tool-type">JavaScript Library</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://www.python.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Python</span><span className="tool-type">Programming Language</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://flutter.dev/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg" alt="Flutter" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Flutter</span><span className="tool-type">Mobile UI Toolkit</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" alt="Node.js" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Node.js</span><span className="tool-type">JS Runtime</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
            </FadeIn>

            <FadeIn delay={80} className="tool-row">
              <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg" alt="Firebase" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Firebase</span><span className="tool-type">App Platform</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg" alt="Supabase" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Supabase</span><span className="tool-type">Backend as a Service</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" alt="Git" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Git</span><span className="tool-type">Version Control</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" className="tool-img" style={{filter:'invert(1)'}}/></div>
                <div className="tool-info"><span className="tool-name">GitHub</span><span className="tool-type">Code Hosting</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg" alt="Vercel" className="tool-img" style={{filter:'invert(1)'}}/></div>
                <div className="tool-info"><span className="tool-name">Vercel</span><span className="tool-type">Deployment Platform</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
            </FadeIn>

            <FadeIn delay={160} className="tool-row">
              <a href="https://huggingface.co/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon" style={{fontSize:'1.6rem'}}>🤗</div>
                <div className="tool-info"><span className="tool-name">Hugging Face</span><span className="tool-type">AI Models & Spaces</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://www.langchain.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon" style={{fontSize:'1.6rem'}}>🦜</div>
                <div className="tool-info"><span className="tool-name">LangChain</span><span className="tool-type">LLM Framework</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://www.tensorflow.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg" alt="TensorFlow" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">TensorFlow</span><span className="tool-type">Machine Learning</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://unity.com/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-original.svg" alt="Unity" className="tool-img" style={{filter:'invert(1)'}}/></div>
                <div className="tool-info"><span className="tool-name">Unity</span><span className="tool-type">Game Engine</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/androidstudio/androidstudio-original.svg" alt="Android Studio" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Android Studio</span><span className="tool-type">Android IDE</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
            </FadeIn>

            <FadeIn delay={240} className="tool-row">
              <a href="https://www.blender.org/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/blender/blender-original.svg" alt="Blender" className="tool-img" style={{filter:'invert(1)'}}/></div>
                <div className="tool-info"><span className="tool-name">Blender</span><span className="tool-type">3D Creation Suite</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon" style={{fontSize:'1.6rem'}}>✨</div>
                <div className="tool-info"><span className="tool-name">Claude</span><span className="tool-type">AI Assistant</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
              <a href="https://www.adobe.com/creativecloud.html" target="_blank" rel="noopener noreferrer" className="tool-card">
                <div className="tool-icon"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-plain.svg" alt="Adobe" className="tool-img"/></div>
                <div className="tool-info"><span className="tool-name">Adobe CC</span><span className="tool-type">Creative Suite</span></div>
                <div className="tool-external-link"><FaExternalLinkAlt size={11} /></div>
              </a>
            </FadeIn>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-quote-container">
            <p className="footer-quote">“The only way to do great work is to love what you do.”</p>
            <p className="footer-author">– Steve Jobs</p>
          </div>
          <div className="footer-contact">
            <a href="https://shantoshdurai.github.io/" target="_blank" rel="noopener noreferrer">Projects</a>
            <a href="mailto:Shantoshdurai06@gmail.com">Contact</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Santosh.</p>
          <div className="footer-socials">
            <a href="https://www.linkedin.com/in/santoshp123/" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
              <FaLinkedin size={20} />
            </a>
            <a href="https://www.youtube.com/@santastuffs" target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
              <FaYoutube size={20} />
            </a>
            <a href="https://github.com/shantoshdurai" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
              <FaGithub size={20} />
            </a>
            <a href="https://shantoshdurai.github.io/" target="_blank" rel="noopener noreferrer" className="social-link mobile-only-link" title="Projects">
              <FaFolderOpen size={20} />
            </a>
            <a href="/CV-resume.pdf" target="_blank" rel="noopener noreferrer" className="social-link mobile-only-link" title="Get My CV">
              <FaFileAlt size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
