"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const getStyles = (dark: boolean) => `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${dark ? "#0f0a0d" : "#fdf6ee"};
    --surface: ${dark ? "#1a0f14" : "#fef9f4"};
    --card: ${dark ? "#221318" : "#ffffff"};
    --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
    --pink: #ff2d78;
    --pink-light: #ff6ea8;
    --pink-soft: ${dark ? "rgba(255,45,120,0.15)" : "#fff0f5"};
    --dark: ${dark ? "#ffffff" : "#1a0a10"};
    --text: ${dark ? "#f0e8ec" : "#1a0a10"};
    --muted: ${dark ? "#7a6570" : "#9b8a92"};
    --muted2: ${dark ? "#b89aa6" : "#6b5560"};
    --shadow: rgba(255,45,120,0.12);
    --nav-bg: ${dark ? "rgba(15,10,13,0.92)" : "rgba(253,246,238,0.9)"};
  }

  html, body { height: 100%; overflow: hidden; background: var(--bg); }
  body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); cursor: none; transition: background 0.3s, color 0.3s; }

  .cursor { position: fixed; width: 10px; height: 10px; background: var(--pink); border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); mix-blend-mode: ${dark ? "normal" : "multiply"}; transition: width 0.2s, height 0.2s; }
  .cursor-ring { position: fixed; width: 32px; height: 32px; border: 1.5px solid rgba(255,45,120,0.4); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: all 0.15s ease-out; }

  /* TOP NAV */
  .nav { position: fixed; top: 0; left: 0; right: 0; height: 70px; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 2.5rem; background: var(--nav-bg); backdrop-filter: blur(24px); border-bottom: 1px solid var(--border); animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.1em; color: var(--dark); }
  .nav-logo span { color: var(--pink); }
  .nav-right { display: flex; align-items: center; gap: 10px; }
  .dark-toggle { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--card); color: var(--text); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .dark-toggle:hover { border-color: var(--pink); background: var(--pink-soft); }
  .nav-user { display: flex; align-items: center; gap: 8px; background: var(--card); border: 1px solid var(--border); border-radius: 100px; padding: 5px 12px 5px 5px; font-size: 0.78rem; font-weight: 600; color: var(--muted2); box-shadow: 0 2px 10px var(--shadow); }
  .nav-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, var(--pink), var(--pink-light)); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; color: white; }
  .logout-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.72rem; margin-left: 2px; padding: 2px 6px; border-radius: 4px; transition: all 0.2s; font-family: inherit; }
  .logout-btn:hover { color: var(--pink); background: var(--pink-soft); }

  /* DASHBOARD LAYOUT (New) */
  .dashboard-wrapper { display: flex; height: 100vh; padding-top: 70px; }
  .sidebar { width: 240px; background: var(--nav-bg); border-right: 1px solid var(--border); padding: 2rem 1rem; display: flex; flex-direction: column; gap: 8px; z-index: 90; flex-shrink: 0; }
  .sidebar-btn { padding: 14px 18px; border-radius: 12px; border: none; background: transparent; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 600; color: var(--muted2); cursor: pointer; text-align: left; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
  .sidebar-btn:hover { background: var(--pink-soft); color: var(--pink); transform: translateX(4px); }
  .sidebar-btn.active { background: var(--pink); color: white; box-shadow: 0 4px 14px rgba(255,45,120,0.3); }
  .sidebar-btn .icon { font-size: 1.1rem; }
  .main-content { flex: 1; position: relative; overflow: hidden; background: var(--bg); }
  .slide-content { width: 100%; height: 100%; overflow-y: auto; animation: fadeIn 0.4s ease; display: flex; flex-direction: column; }

  /* AUTH (Stays Full Screen) */
  .slide-auth { position: fixed; inset: 0; z-index: 200; background: var(--bg); display: grid; grid-template-columns: 1fr 1fr; }
  .auth-left { background: ${dark ? "#0a0608" : "#1a0a10"}; display: flex; flex-direction: column; justify-content: center; padding: 4rem; position: relative; overflow: hidden; }
  .auth-left-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 0% 100%, rgba(255,45,120,0.3) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(255,110,168,0.15) 0%, transparent 60%); animation: bgPulse 6s ease-in-out infinite alternate; }
  @keyframes bgPulse { from{opacity:0.7} to{opacity:1} }
  .auth-left-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,45,120,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,120,0.06) 1px, transparent 1px); background-size: 50px 50px; }
  .auth-big-title { position: relative; z-index: 2; font-family: 'Bebas Neue', sans-serif; font-size: clamp(5rem, 10vw, 9rem); line-height: 0.9; letter-spacing: 0.02em; color: white; margin-bottom: 1.5rem; animation: titleReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
  @keyframes titleReveal { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  .auth-big-title .pink-word { display: block; color: var(--pink); text-shadow: 0 0 50px rgba(255,45,120,0.5); }
  .auth-big-title .outline-word { display: block; -webkit-text-stroke: 1.5px rgba(255,255,255,0.25); color: transparent; }
  .auth-tagline { position: relative; z-index: 2; font-size: 0.9rem; font-weight: 300; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 320px; animation: fadeUp 0.8s ease 0.4s both; }
  .auth-pills { position: relative; z-index: 2; display: flex; gap: 8px; margin-top: 2rem; flex-wrap: wrap; animation: fadeUp 0.8s ease 0.5s both; }
  .auth-pill { padding: 5px 12px; border-radius: 100px; border: 1px solid rgba(255,45,120,0.3); background: rgba(255,45,120,0.08); color: var(--pink-light); font-size: 0.72rem; font-weight: 600; transition: all 0.2s; }
  .auth-pill:hover { background: rgba(255,45,120,0.15); transform: translateY(-1px); }
  .auth-right { display: flex; flex-direction: column; justify-content: center; padding: 4rem; background: var(--surface); animation: fadeIn 0.8s ease 0.3s both; z-index: 2; }
  .auth-tabs { display: flex; gap: 4px; background: var(--bg); border-radius: 12px; padding: 4px; margin-bottom: 2rem; border: 1px solid var(--border); }
  .auth-tab { flex: 1; padding: 10px; border-radius: 9px; font-size: 0.82rem; font-weight: 700; cursor: pointer; border: none; background: transparent; color: var(--muted); transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .auth-tab.active { background: var(--card); color: var(--text); box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  .auth-form { display: flex; flex-direction: column; gap: 14px; }
  .auth-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted2); margin-bottom: 5px; display: block; }
  .auth-input { width: 100%; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 13px 16px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
  .auth-input::placeholder { color: var(--muted); }
  .auth-input:focus { border-color: var(--pink); box-shadow: 0 0 0 3px rgba(255,45,120,0.1); background: var(--surface); }
  .pw-wrap { position: relative; }
  .pw-wrap .auth-input { padding-right: 46px; }
  .pw-eye { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--muted); font-size: 1.1rem; padding: 4px; border-radius: 6px; transition: color 0.2s, background 0.2s; line-height: 1; }
  .pw-eye:hover { color: var(--pink); background: var(--pink-soft); }
  .auth-error { font-size: 0.78rem; color: var(--pink); font-weight: 600; padding: 8px 12px; background: var(--pink-soft); border-radius: 8px; border: 1px solid rgba(255,45,120,0.2); animation: shake 0.4s ease; }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
  .main-pink-btn { padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--pink), #e8005a); color: white; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
  .main-pink-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); opacity: 0; transition: opacity 0.2s; }
  .main-pink-btn:hover:not(:disabled)::after { opacity: 1; }
  .main-pink-btn:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(255,45,120,0.45); transform: translateY(-2px); }
  .main-pink-btn:active:not(:disabled) { transform: translateY(0px); box-shadow: 0 4px 12px rgba(255,45,120,0.3); }
  .main-pink-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .guest-btn { padding: 13px; border-radius: 12px; border: 1.5px solid var(--border); background: transparent; color: var(--muted2); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .guest-btn:hover { border-color: rgba(255,45,120,0.4); color: var(--pink); background: var(--pink-soft); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(255,45,120,0.12); }
  .auth-divider { display: flex; align-items: center; gap: 12px; color: var(--muted); font-size: 0.75rem; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .auth-success { font-size: 0.78rem; color: #16a34a; font-weight: 600; padding: 8px 12px; background: rgba(34,197,94,0.08); border-radius: 8px; border: 1px solid rgba(34,197,94,0.25); animation: fadeUp 0.3s ease; }
  .otp-input { letter-spacing: 0.3em; font-size: 1.1rem; font-weight: 700; text-align: center; }

  /* COMMON COMPONENTS */
  .slide-input { align-items: center; justify-content: center; padding: 2rem; }
  .s1-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 50% 40% at 10% 20%, rgba(255,45,120,0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 90% 80%, rgba(255,110,168,0.06) 0%, transparent 60%); }
  .s1-content { position: relative; z-index: 2; width: 100%; max-width: 860px; margin: auto; }
  .s1-greeting { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--pink); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px; animation: fadeUp 0.6s ease both; }
  .s1-greeting::before { content: ''; width: 20px; height: 2px; background: var(--pink); border-radius: 2px; }
  .s1-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 7vw, 5.5rem); line-height: 0.95; letter-spacing: 0.02em; margin-bottom: 0.5rem; color: var(--dark); animation: fadeUp 0.6s ease 0.1s both; }
  .s1-title .pink { color: var(--pink); }
  .s1-sub { font-size: 0.9rem; color: var(--muted); font-weight: 400; margin-bottom: 2rem; animation: fadeUp 0.6s ease 0.2s both; }
  .input-card { background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; padding: 1.5rem; box-shadow: 0 8px 32px rgba(0,0,0,0.06); position: relative; overflow: hidden; animation: fadeUp 0.6s ease 0.3s both; transition: box-shadow 0.3s; }
  .input-card:focus-within { box-shadow: 0 12px 40px rgba(255,45,120,0.1); }
  .input-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--pink), var(--pink-light)); }
  .lang-row { display: flex; gap: 6px; margin-bottom: 1rem; }
  .lang-pill { padding: 5px 14px; border-radius: 100px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; border: 1.5px solid var(--border); background: transparent; color: var(--muted2); cursor: pointer; transition: all 0.25s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .lang-pill.active { background: var(--pink); border-color: var(--pink); color: white; box-shadow: 0 4px 14px rgba(255,45,120,0.3); transform: translateY(-1px); }
  .lang-pill:hover:not(.active) { border-color: rgba(255,45,120,0.3); color: var(--pink); }
  .tab-row { display: flex; gap: 4px; margin-bottom: 1rem; background: var(--bg); border-radius: 10px; padding: 4px; border: 1px solid var(--border); }
  .tab-btn { flex: 1; padding: 8px; border-radius: 7px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: none; background: transparent; color: var(--muted); transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .tab-btn.active { background: var(--card); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .input-row { display: flex; gap: 10px; }
  .main-inp { flex: 1; background: var(--bg); border: 1.5px solid var(--border); border-radius: 12px; padding: 13px 16px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; outline: none; transition: all 0.2s; }
  .main-inp::placeholder { color: var(--muted); }
  .main-inp:focus { border-color: var(--pink); box-shadow: 0 0 0 3px rgba(255,45,120,0.08); background: var(--card); }
  .gen-btn { padding: 13px 24px; border-radius: 12px; border: none; background: var(--dark); color: ${dark ? "#0f0a0d" : "white"}; font-family: 'Bebas Neue', sans-serif; font-size: 1.05rem; letter-spacing: 0.1em; cursor: pointer; white-space: nowrap; min-width: 150px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.25s; position: relative; overflow: hidden; }
  .gen-btn:hover:not(:disabled) { background: var(--pink); color: white; box-shadow: 0 8px 28px rgba(255,45,120,0.35); transform: translateY(-2px); }
  .gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* Upload area */
  .upload-area { border: 2px dashed var(--border); border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.25s; background: var(--bg); margin-top: 0.75rem; }
  .upload-area:hover, .upload-area.drag-over { border-color: var(--pink); background: var(--pink-soft); }
  .upload-area input { display: none; }
  .upload-icon { font-size: 1.8rem; margin-bottom: 0.4rem; }
  .upload-text { font-size: 0.8rem; color: var(--muted2); font-weight: 600; }
  .upload-text span { color: var(--pink); }
  .upload-file-name { font-size: 0.75rem; color: var(--pink); font-weight: 700; margin-top: 0.4rem; }

  /* SUMMARY */
  .slide-summary { display: flex; flex-direction: row; }
  .s2-left { background: var(--card); border-right: 1.5px solid var(--border); width: 300px; padding: 2rem 1.5rem; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }
  .s2-right { flex: 1; padding: 2rem 2.5rem; overflow-y: auto; display: flex; flex-direction: column; }
  .s2-right::-webkit-scrollbar { width: 3px; }
  .s2-right::-webkit-scrollbar-thumb { background: var(--pink-light); border-radius: 2px; }
  .sec-label { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pink); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px; }
  .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .source-box { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 0.78rem; color: var(--muted2); word-break: break-all; margin-bottom: 1.25rem; line-height: 1.5; }
  .stats-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 1.25rem; }
  .stat-box { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 8px; text-align: center; position: relative; overflow: hidden; transition: all 0.25s; cursor: default; }
  .stat-box:hover { border-color: rgba(255,45,120,0.3); box-shadow: 0 4px 14px var(--shadow); transform: translateY(-2px); }
  .stat-box::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--pink), var(--pink-light)); }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; letter-spacing: 0.05em; line-height: 1; color: var(--dark); }
  .stat-lbl { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-top: 3px; }
  .action-stack { display: flex; flex-direction: column; gap: 8px; margin-top: auto; }
  .act-btn { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--card); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .act-btn:hover { border-color: rgba(255,45,120,0.4); background: var(--pink-soft); color: var(--pink); transform: translateX(3px); }
  .act-btn.speaking { background: var(--pink-soft); border-color: rgba(255,45,120,0.4); color: var(--pink); }
  .act-btn.main { background: var(--dark); border-color: var(--dark); color: ${dark ? "#0f0a0d" : "white"}; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.1em; justify-content: center; }
  .act-btn.main:hover { background: var(--pink); border-color: var(--pink); box-shadow: 0 6px 22px rgba(255,45,120,0.35); transform: translateY(-2px) translateX(0); color: white; }
  .act-btn.main:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* TTS */
  .tts-bar-wrap { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
  .tts-progress-track { width: 100%; height: 4px; background: var(--border); border-radius: 2px; cursor: pointer; position: relative; }
  .tts-progress-fill { height: 100%; background: linear-gradient(90deg, var(--pink), var(--pink-light)); border-radius: 2px; transition: width 0.1s linear; pointer-events: none; }
  .tts-time-row { display: flex; justify-content: space-between; font-size: 0.65rem; font-weight: 700; color: var(--muted); }
  .speed-row { display: flex; gap: 4px; flex-wrap: wrap; }
  .speed-btn { padding: 3px 8px; border-radius: 6px; border: 1.5px solid; font-size: 0.68rem; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }

  /* Word highlight */
  .summary-big { font-size: 0.95rem; line-height: 2; font-weight: 400; color: var(--muted2); flex: 1; animation: fadeUp 0.5s ease both; white-space: pre-wrap; word-break: break-word; }
  .word-span { display: inline; border-radius: 3px; transition: all 0.15s ease; }
  .word-span.active { color: var(--pink); text-shadow: 0 0 12px rgba(255,45,120,0.6), 0 0 24px rgba(255,45,120,0.3); font-weight: 700; }

  .shimmer-wrap { display: flex; flex-direction: column; gap: 10px; }
  .shimmer-line { height: 13px; border-radius: 6px; background: linear-gradient(90deg, var(--bg) 25%, rgba(255,45,120,0.05) 50%, var(--bg) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

  /* ASK AI MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
  .modal-box { background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; padding: 2rem; width: 90%; max-width: 560px; box-shadow: 0 24px 64px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.05em; color: var(--dark); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px; }
  .modal-title span { color: var(--pink); }
  .modal-inp { width: 100%; background: var(--bg); border: 1.5px solid var(--border); border-radius: 12px; padding: 12px 16px; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; outline: none; transition: all 0.2s; resize: none; }
  .modal-inp:focus { border-color: var(--pink); box-shadow: 0 0 0 3px rgba(255,45,120,0.08); }
  .modal-answer { background: var(--bg); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px 16px; font-size: 0.88rem; color: var(--muted2); line-height: 1.7; margin-top: 1rem; min-height: 80px; white-space: pre-wrap; }
  .modal-btns { display: flex; gap: 8px; margin-top: 1rem; }
  .modal-ask-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; background: var(--pink); color: white; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }
  .modal-ask-btn:hover:not(:disabled) { background: var(--pink-light); transform: translateY(-1px); }
  .modal-ask-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .modal-close-btn { padding: 12px 20px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--card); color: var(--muted2); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .modal-close-btn:hover { border-color: var(--pink); color: var(--pink); background: var(--pink-soft); }

  /* FLASHCARDS SLIDE */
  .slide-flash { padding: 2rem; }
  .slide-flash::-webkit-scrollbar { width: 3px; }
  .slide-flash::-webkit-scrollbar-thumb { background: var(--pink-light); }
  .s-flash-inner { max-width: 800px; margin: 0 auto; }
  .flash-hero { margin-bottom: 2rem; }
  .flash-title { font-family: 'Bebas Neue', sans-serif; font-size: 3.5rem; letter-spacing: 0.05em; line-height: 1; color: var(--dark); }
  .flash-title .pink { color: var(--pink); }
  .flash-sub { font-size: 0.85rem; color: var(--muted); margin-top: 0.4rem; }
  .flash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .flash-card { height: 180px; perspective: 1000px; cursor: pointer; }
  .flash-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); transform-style: preserve-3d; }
  .flash-card.flipped .flash-inner { transform: rotateY(180deg); }
  .flash-front, .flash-back { position: absolute; inset: 0; border-radius: 16px; border: 1.5px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.25rem; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .flash-front { background: var(--card); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .flash-back { background: linear-gradient(135deg, rgba(255,45,120,0.08), rgba(255,110,168,0.05)); border-color: rgba(255,45,120,0.2); transform: rotateY(180deg); }
  .flash-q-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; }
  .flash-q-text { font-size: 0.88rem; font-weight: 600; color: var(--dark); text-align: center; line-height: 1.5; }
  .flash-a-label { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pink); margin-bottom: 0.6rem; }
  .flash-a-text { font-size: 0.85rem; color: var(--muted2); text-align: center; line-height: 1.6; }
  .flash-hint { font-size: 0.65rem; color: var(--muted); margin-top: 0.5rem; }
  .flash-load { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--muted); }
  .flash-spin { width: 48px; height: 48px; border: 2px solid var(--border); border-top-color: var(--pink); border-right-color: var(--pink-light); border-radius: 50%; animation: spin 0.8s linear infinite; }
  .flash-gen-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 12px; border: none; background: var(--dark); color: ${dark ? "#0f0a0d" : "white"}; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.25s; margin: 0 auto; display: block; }
  .flash-gen-btn:hover:not(:disabled) { background: var(--pink); color: white; box-shadow: 0 8px 28px rgba(255,45,120,0.35); transform: translateY(-2px); }
  .flash-gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* QUIZ */
  .slide-quiz { padding: 2rem; }
  .slide-quiz::-webkit-scrollbar { width: 3px; }
  .slide-quiz::-webkit-scrollbar-thumb { background: var(--pink); }
  .s3-inner { max-width: 720px; margin: 0 auto; }
  .quiz-hero { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1.5px solid var(--border); }
  .quiz-big-title { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 0.05em; line-height: 1; color: var(--dark); }
  .quiz-big-title .pink { color: var(--pink); }
  .quiz-score-display { text-align: right; animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .score-big-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; color: var(--pink); line-height: 1; }
  .score-emoji { font-size: 1.5rem; }
  .score-txt { font-size: 0.7rem; font-weight: 700; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
  .q-card { background: var(--card); border: 1.5px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; position: relative; overflow: hidden; box-shadow: 0 2px 14px rgba(0,0,0,0.04); animation: fadeUp 0.5s ease both; }
  .q-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, var(--pink), var(--pink-light)); }
  .q-num { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--pink); margin-bottom: 0.5rem; }
  .q-text { font-size: 0.95rem; font-weight: 600; color: var(--dark); line-height: 1.5; margin-bottom: 1.25rem; }
  .opts { display: flex; flex-direction: column; gap: 8px; }
  .opt-btn { padding: 12px 16px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--bg); color: var(--muted2); font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.4; }
  .opt-btn:hover:not(:disabled) { border-color: rgba(255,45,120,0.4); color: var(--text); background: var(--pink-soft); transform: translateX(4px); }
  .opt-btn.correct { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.5); color: #16a34a; }
  .opt-btn.wrong { background: rgba(255,45,120,0.08); border-color: rgba(255,45,120,0.4); color: var(--pink); }
  .opt-btn.revealed { background: rgba(34,197,94,0.04); border-color: rgba(34,197,94,0.15); color: #16a34a; opacity: 0.6; }
  .opt-btn:disabled { cursor: not-allowed; }
  .quiz-load { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--muted); }
  .quiz-spin { width: 48px; height: 48px; border: 2px solid var(--border); border-top-color: var(--pink); border-right-color: var(--pink-light); border-radius: 50%; animation: spin 0.8s linear infinite; }

  /* PROGRESS */
  .slide-progress { padding: 2rem; }
  .slide-progress::-webkit-scrollbar { width: 3px; }
  .slide-progress::-webkit-scrollbar-thumb { background: var(--pink-light); }
  .s4-inner { width: 80%; max-width: 1200px; margin: 0 auto; }
  .progress-title { font-family: 'Bebas Neue', sans-serif; font-size: 3.5rem; letter-spacing: 0.05em; line-height: 1; margin-bottom: 0.5rem; color: var(--dark); animation: fadeUp 0.6s ease both; }
  .progress-title .pink { color: var(--pink); }
  .progress-sub { font-size: 0.85rem; color: var(--muted); font-weight: 400; margin-bottom: 2rem; }
  .circles-row { display: flex; gap: 1.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
  .circle-card { flex: 1; min-width: 200px; background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transition: all 0.3s; }
  .circle-card:hover { box-shadow: 0 12px 32px var(--shadow); border-color: rgba(255,45,120,0.25); transform: translateY(-4px); }
  .circle-wrap { position: relative; width: 130px; height: 130px; }
  .circle-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .circle-track { fill: none; stroke: var(--border); stroke-width: 7; }
  .circle-fill { fill: none; stroke-width: 7; stroke-linecap: round; transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1); }
  .circle-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .circle-val { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; letter-spacing: 0.05em; line-height: 1; }
  .circle-unit { font-size: 0.7rem; font-weight: 700; color: var(--muted); letter-spacing: 0.1em; margin-top: 2px; }
  .circle-label { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted2); }
  .session-item { background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 8px; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 8px rgba(0,0,0,0.04); animation: fadeUp 0.4s ease both; }
  .session-item:hover { border-color: rgba(255,45,120,0.3); box-shadow: 0 6px 20px var(--shadow); transform: translateX(4px); }
  .session-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, var(--pink), var(--pink-light)); flex-shrink: 0; }
  .session-info { flex: 1; min-width: 0; }
  .session-url { font-size: 0.78rem; color: var(--pink); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .session-preview { font-size: 0.75rem; color: var(--muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .session-meta { text-align: right; flex-shrink: 0; }
  .session-date { font-size: 0.68rem; color: var(--muted); }
  .session-del { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; transition: color 0.2s; display: block; margin-top: 4px; font-family: inherit; }
  .session-del:hover { color: var(--pink); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
`;

const CIRCUMFERENCE = 2 * Math.PI * 40;

function CircleProgress({ value, max, color1, color2, unit, label, id }: any) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  return (
    <div className="circle-card">
      <div className="circle-wrap">
        <svg className="circle-svg" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`g${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          <circle className="circle-track" cx="50" cy="50" r="40" />
          <circle className="circle-fill" cx="50" cy="50" r="40" stroke={`url(#g${id})`} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} />
        </svg>
        <div className="circle-center">
          <div className="circle-val" style={{ color: color1 }}>{value}</div>
          <div className="circle-unit">{unit}</div>
        </div>
      </div>
      <div className="circle-label">{label}</div>
    </div>
  );
}

const cleanSpeech = (t: string) =>
  t.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#+/g, "")
   .replace(/•/g, "").replace(/\b(\d+)\/(\d+)\b/g, "$1 upon $2")
   .replace(/\b(\d+)\^(\d+)\b/g, "$1 to the power $2")
   .replace(/\s+/g, " ").trim();

const buildWords = (text: string): string[] => text.split(/(\s+)/).filter(Boolean);

// API Base URL — locally localhost, production mein Render URL
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Slides/Tabs Menu
const DASHBOARD_TABS = [
  { id: 1, label: "New Input", icon: "➕" },
  { id: 2, label: "Summary", icon: "📝" },
  { id: 3, label: "Flashcards", icon: "🃏" },
  { id: 4, label: "Take Quiz", icon: "🧩" },
  { id: 5, label: "Progress", icon: "📊" }
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [showAuthPw, setShowAuthPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("url");
  const [language, setLanguage] = useState("English");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TTS
  const [speaking, setSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [ttsCurrent, setTtsCurrent] = useState(0);
  const [ttsTotal, setTtsTotal] = useState(0);
  const wordsRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  // Ask AI
  const [askOpen, setAskOpen] = useState(false);
  const [askQ, setAskQ] = useState("");
  const [askA, setAskA] = useState("");
  const [askLoading, setAskLoading] = useState(false);

  // Flashcards
  const [flashcards, setFlashcards] = useState<{ q: string; a: string }[]>([]);
  const [flashLoading, setFlashLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState<{ [k: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Function to Clear all previous state (Fixes Data Leakage Issue)
  const resetData = () => {
    setSummary("");
    // setInput(""); <-- Isko comment kar diya taaki tera link/text gayab na ho
    setQuiz([]);
    setFlashcards([]);
    setAnswers({});
    setScore(null);
    stopSpeech();
  };

  useEffect(() => {
    const saved = localStorage.getItem("nn_dark");
    if (saved === "1") setDarkMode(true);
  }, []);
  
  const toggleDark = () => {
    setDarkMode(d => {
      localStorage.setItem("nn_dark", d ? "0" : "1");
      return !d;
    });
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) { cursorRef.current.style.left = e.clientX + "px"; cursorRef.current.style.top = e.clientY + "px"; }
      if (ringRef.current) { ringRef.current.style.left = e.clientX + "px"; ringRef.current.style.top = e.clientY + "px"; }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    if (summary) {
      const w = summary.trim().split(/\s+/).length;
      setWordCount(w); setCharCount(summary.length); setReadTime(Math.ceil(w / 200));
      wordsRef.current = buildWords(summary);
      setTtsTotal(wordsRef.current.filter(w => w.trim().length > 0).length);
    }
  }, [summary]);

  useEffect(() => {
    const t = localStorage.getItem("nn_token");
    const u = localStorage.getItem("nn_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); setSlide(1); }
  }, []);

  useEffect(() => { if (slide >= 1) { fetchHistory(); fetchProgress(); } }, [slide]);
  useEffect(() => { stopSpeech(); }, [slide]);

  const stopSpeech = () => {
    isSpeakingRef.current = false;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setActiveWordIdx(-1);
    setTtsProgress(0);
    setTtsCurrent(0);
  };

  const getVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (lang === "Hindi") {
      return voices.find(v => v.name === "Google हिन्दी") ||
             voices.find(v => v.name === "Microsoft Heera") ||
             voices.find(v => v.lang === "hi-IN") || null;
    }
    return voices.find(v => v.name === "Microsoft Ravi") ||
           voices.find(v => v.name === "Microsoft Heera") ||
           voices.find(v => v.lang === "en-IN") ||
           voices.find(v => v.lang.startsWith("en")) || null;
  };

  const startSpeakingFrom = useCallback((startWordIdx: number) => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;
    setSpeaking(true);

    const allWords = wordsRef.current;
    const realWords = allWords.filter(w => w.trim().length > 0);
    const totalRealWords = realWords.length;

    let realStartIdx = 0;
    let counted = 0;
    for (let i = 0; i < allWords.length; i++) {
      if (allWords[i].trim().length === 0) continue;
      if (i >= startWordIdx) { realStartIdx = counted; break; }
      counted++;
    }

    const textFromHere = realWords.slice(realStartIdx).join(" ");
    const cleanText = cleanSpeech(textFromHere);
    const cleanWords = cleanText.split(/\s+/).filter(Boolean);

    const chunkSize = 8;
    const chunks: string[] = [];
    for (let i = 0; i < cleanWords.length; i += chunkSize) {
      chunks.push(cleanWords.slice(i, i + chunkSize).join(" "));
    }

    let chunkIdx = 0;
    let globalCleanWordIdx = 0;
    let highlightTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => { if (highlightTimer) { clearTimeout(highlightTimer); highlightTimer = null; } };

    const getAllWordsIdx = (cleanIdx: number): number => {
      let realCount = 0;
      for (let i = 0; i < allWords.length; i++) {
        if (allWords[i].trim().length === 0) continue;
        if (realCount === realStartIdx + cleanIdx) return i;
        realCount++;
      }
      return allWords.length - 1;
    };

    const speakChunk = () => {
      if (!isSpeakingRef.current || chunkIdx >= chunks.length) {
        clearTimer(); setSpeaking(false); setActiveWordIdx(-1);
        setTtsProgress(100); setTtsCurrent(totalRealWords);
        isSpeakingRef.current = false; return;
      }
      const chunk = chunks[chunkIdx];
      const chunkWords = chunk.split(/\s+/).filter(Boolean);
      const u = new SpeechSynthesisUtterance(chunk);
      const voice = getVoice(language);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      else { u.lang = language === "Hindi" ? "hi-IN" : "en-IN"; }
      u.rate = speechRate;
      const msPerWord = Math.round(500 / speechRate);

     u.onstart = () => {
        clearTimer();
        let wordInChunk = 0;
        const startTime = Date.now();

        const highlightNext = () => {
          if (!isSpeakingRef.current || wordInChunk >= chunkWords.length) return;
          const allWordsIdx = getAllWordsIdx(globalCleanWordIdx + wordInChunk);
          setActiveWordIdx(allWordsIdx);
          const doneWords = realStartIdx + globalCleanWordIdx + wordInChunk + 1;
          setTtsProgress(Math.min(Math.round((doneWords / totalRealWords) * 100), 100));
          setTtsCurrent(Math.min(doneWords, totalRealWords));
          wordInChunk++;
          if (wordInChunk < chunkWords.length) {
            const expectedTime = wordInChunk * msPerWord;
            const actualTime = Date.now() - startTime;
            const delay = Math.max(10, msPerWord - (actualTime - expectedTime));
            highlightTimer = setTimeout(highlightNext, delay);
          }
        };
        highlightNext();
      };
      u.onend = () => { clearTimer(); globalCleanWordIdx += chunkWords.length; chunkIdx++; speakChunk(); };
      u.onerror = () => { clearTimer(); chunkIdx++; speakChunk(); };
      window.speechSynthesis.speak(u);
    };
    speakChunk();
  }, [language, speechRate]);

  const handleSpeak = () => {
    if (speaking) { stopSpeech(); return; }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; startSpeakingFrom(0); };
    } else { startSpeakingFrom(0); }
  };

 const changeSpeechRate = (r: number) => {
    setSpeechRate(r);
    if (speaking) {
      const cur = activeWordIdx > 0 ? activeWordIdx : 0;
      isSpeakingRef.current = false;
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setActiveWordIdx(-1);
      setTimeout(() => startSpeakingFrom(cur), 50);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const allWords = wordsRef.current;
    const realWords = allWords.filter(w => w.trim().length > 0);
    const targetRealIdx = Math.floor(pct * realWords.length);
    let count = 0, targetIdx = 0;
    for (let i = 0; i < allWords.length; i++) {
      if (allWords[i].trim().length > 0) {
        if (count === targetRealIdx) { targetIdx = i; break; }
        count++;
      }
    }
    stopSpeech();
    setTimeout(() => startSpeakingFrom(targetIdx), 100);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    if (file.type === "text/plain") {
      const text = await file.text();
      setInput(text.substring(0, 5000));
      setActiveTab("text");
    } else if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("pdf", file);
      try {
        const res = await fetch(`${API}/api/extract-pdf`, { method: "POST", body: formData });
        const d = await res.json();
        if (d.text) { setInput(d.text.substring(0, 5000)); setActiveTab("text"); }
        else { setInput("Could not extract text from PDF. Please paste manually."); }
      } catch {
        setInput(`PDF file: ${file.name}\n(Install pdf-parse in the backend: npm install pdf-parse)`);
        setActiveTab("text");
      }
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAsk = async () => {
    if (!askQ.trim() || !summary) return;
    setAskLoading(true); setAskA("");
    try {
      const res = await fetch(`${API}/api/ask`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: askQ, summary, language })
      });
      const d = await res.json();
      setAskA(d.answer || d.error || "An error occurred.");
    } catch { setAskA("Could not connect to server."); }
    setAskLoading(false);
  };

  const generateFlashcards = async () => {
    if (!summary) return;
    setFlashLoading(true); setFlashcards([]); setFlippedCards(new Set());
    try {
      const res = await fetch(`${API}/api/quiz`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          language,
          type: "flashcards",
          prompt: `Generate 8 flashcards from this summary. Return JSON array: [{"q": "question", "a": "answer"}]. Questions should be key concepts, answers should be concise. Return ONLY the JSON array, no other text.`
        })
      });
      const d = await res.json();
      if (d.flashcards) {
        setFlashcards(d.flashcards);
      } else {
        const res2 = await fetch(`${API}/api/flashcards`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary, language })
        });
        const d2 = await res2.json();
        setFlashcards(d2.flashcards || []);
      }
    } catch {}
    setFlashLoading(false);
  };

  const toggleFlip = (idx: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const fetchHistory = async () => {
    try { const t = localStorage.getItem("nn_token") || token;
    const res = await fetch(`${API}/api/history`, {
      headers: t ? { "Authorization": `Bearer ${t}` } : {}
    }); const d = await res.json(); setHistory(Array.isArray(d) ? d : []); } catch {}
  };

  const fetchProgress = async () => {
    try {
      const t = localStorage.getItem("nn_token") || token;
      const res = await fetch(`${API}/api/progress`, { headers: { "Authorization": `Bearer ${t}` } });
      const d = await res.json();
      setTotalQuizzes(d.totalQuizzes || 0); setTotalCorrect(d.totalCorrect || 0);
    } catch {}
  };

  const handleAuth = async () => {
    setAuthError(""); setAuthLoading(true);
    try {
      const endpoint = authTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = authTab === "login" ? { email: authEmail, password: authPassword } : { name: authName, email: authEmail, password: authPassword };
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (d.error) { setAuthError(d.error); }
      else { 
        setToken(d.token); 
        localStorage.setItem("nn_token", d.token); 
        localStorage.setItem("nn_user", JSON.stringify(d.user)); 
        setUser(d.user); 
        resetData(); // Fresh login par data saaf
        setSlide(1); 
      }
    } catch { setAuthError("Could not connect to server!"); }
    setAuthLoading(false);
  };
  const handleForgotPassword = async () => {
    if (!resetEmail) return alert("Please enter your email address!");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      const d = await res.json();
      if (d.error) alert(d.error);
      else { alert("OTP has been sent! Please check your email."); setForgotStep(2); }
    } catch { alert("Could not connect to backend server!"); }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return alert("Please enter both OTP and new password!");
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword })
      });
      const d = await res.json();
      if (d.error) alert(d.error);
      else { 
        alert("Success! Password has been updated. Please login."); 
        setShowForgot(false); setForgotStep(1); setOtp(""); setNewPassword(""); setResetEmail("");
      }
    } catch { alert("Password reset failed!"); }
  };

  const handleGuest = () => { 
    setUser({ name: "Guest", email: "guest@neuronotes.app" }); 
    resetData();
    setSlide(1); 
  };

  const handleLogout = () => {
    localStorage.removeItem("nn_token"); 
    localStorage.removeItem("nn_user");
    setUser(null); 
    setToken(""); 
    setSlide(0);
    resetData(); 
    setInput("");
  };
  const generateSummary = async () => {
    if (!input.trim()) return;
    setLoading(true); 
    resetData(); // Purana quiz/summary saaf karega
    
    try {
      const t = localStorage.getItem("nn_token") || token; // Token nikala
      
      const res = await fetch(`${API}/api/summary`, {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": t ? `Bearer ${t}` : "" // Backend ko bata rahe hain ki kaunsa user hai
        },
        body: JSON.stringify({ text: input, language })
      });
      
      const d = await res.json();
      setSummary(d.summary || d.error); 
      setSlide(2); 
      fetchHistory(); // History refresh karega
      
      if (t) fetch(`${API}/api/progress/summary`, { method: "POST", headers: { "Authorization": `Bearer ${t}` } });
    } catch { 
      setSummary("⚠️ Could not connect to server."); 
      setSlide(2); 
    }
    setLoading(false);
  };

  const generateQuiz = async () => {
    if (!summary) return;
    setQuizLoading(true); setQuiz([]); setAnswers({}); setScore(null);
    try {
      const res = await fetch(`${API}/api/quiz`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary, language }) });
      const d = await res.json();
      setQuiz(d.questions || []);
    } catch {}
    setQuizLoading(false);
  };

  const handleAnswer = (qi: number, opt: string) => {
    if (answers[qi]) return;
    const na = { ...answers, [qi]: opt };
    setAnswers(na);
    if (Object.keys(na).length === quiz.length) {
      let c = 0; quiz.forEach((q, i) => { if (na[i] === q.answer) c++; });
      setScore(c); setTotalQuizzes(t => t + 1); setTotalCorrect(t => t + c);
      const t = localStorage.getItem("nn_token") || token;
      if (t) fetch(`${API}/api/progress/quiz`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` }, body: JSON.stringify({ correct: c }) });
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await fetch(`${API}/api/history/${id}`, { method: "DELETE" }); setHistory(history.filter(h => h._id !== id)); } catch {}
  };

  const loadFromHistory = (item: any) => {
    resetData();
    setInput(item.input); setSummary(item.summary); setLanguage(item.language);
    setSlide(2);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const avgScore = totalQuizzes > 0 ? Math.round((totalCorrect / (totalQuizzes * 5)) * 100) : 0;
  const fmtTime = (words: number, rate: number) => { const secs = Math.round((words / (rate * 150)) * 60); const m = Math.floor(secs / 60); const s = secs % 60; return `${m}:${s.toString().padStart(2, "0")}`; };

  const renderSummary = () => {
    if (!summary) return null;
    return wordsRef.current.map((word, i) => {
      if (word.trim().length === 0) return <span key={i}>{word}</span>;
      return <span key={i} className={`word-span${i === activeWordIdx ? " active" : ""}`}>{word}</span>;
    });
  };

  return (
    <>
      <style>{getStyles(darkMode)}</style>
      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef} className="cursor-ring" />

      {/* Ask AI Modal */}
      {askOpen && (
        <div className="modal-overlay" onClick={() => setAskOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">ASK <span>AI</span> 🧠</div>
            <textarea className="modal-inp" rows={3} placeholder="Summary ke baare mein kuch bhi poochho..." value={askQ} onChange={e => setAskQ(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAsk())} />
            {askA && <div className="modal-answer">{askA}</div>}
            {askLoading && <div className="modal-answer" style={{ color: "var(--muted)" }}>Thinking... 🤔</div>}
            <div className="modal-btns">
              <button className="modal-ask-btn" onClick={handleAsk} disabled={askLoading || !askQ.trim()}>
                {askLoading ? "ASKING..." : "ASK →"}
              </button>
              <button className="modal-close-btn" onClick={() => { setAskOpen(false); setAskQ(""); setAskA(""); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAV ALWAYS VISIBLE */}
      <nav className="nav">
        <div className="nav-logo">NEURO<span>NOTES</span></div>
        <div className="nav-right">
          <button className="dark-toggle" onClick={toggleDark} title="Toggle Dark Mode">
            {darkMode ? "☀️" : "🌙"}
          </button>
          {user && user.role === "admin" && (
            <a href="/admin" style={{
              padding: "6px 14px", borderRadius: "8px", border: "1.5px solid rgba(255,45,120,0.4)",
              background: "rgba(255,45,120,0.1)", color: "var(--pink)", fontSize: "0.75rem",
              fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "5px"
            }}>
              👑 Admin
            </a>
          )}
          {user && (
            <div className="nav-user">
              <div className="nav-avatar">{user.name[0].toUpperCase()}</div>
              {user.name}
              <button className="logout-btn" onClick={handleLogout}>✕</button>
            </div>
          )}
        </div>
      </nav>

      {/* AUTH SCREEN (Shows only when not logged in) */}
      {slide === 0 && (
        <div className="slide-auth">
          <div className="auth-left">
            <div className="auth-left-bg" /><div className="auth-left-grid" />
            <div className="auth-big-title">
              <span className="pink-word">NEURO</span>
              <span className="outline-word">NOTES</span>
            </div>
            <p className="auth-tagline">Turn any YouTube video, article, or text into smart AI summaries, audio playback, quizzes and flashcards.</p>
            <div className="auth-pills">
              {["🧠 AI Summary", "🔊 Listen", "🃏 Flashcards", "🧩 Quiz", "📊 Progress", "🇮🇳 Hindi/Hinglish"].map(p => (
                <div key={p} className="auth-pill">{p}</div>
              ))}
            </div>
          </div>
          <div className="auth-right">
            <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2.5rem", letterSpacing: "0.05em", color: "var(--dark)" }}>
                  {authTab === "login" ? "WELCOME BACK" : "GET STARTED"}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "4px" }}>
                  {authTab === "login" ? "Sign in to your account" : "Create your free account"}
                </p>
              </div>
              <div className="auth-tabs">
                <button className={`auth-tab${authTab === "login" ? " active" : ""}`} onClick={() => { setAuthTab("login"); setAuthError(""); }}>Login</button>
                <button className={`auth-tab${authTab === "signup" ? " active" : ""}`} onClick={() => { setAuthTab("signup"); setAuthError(""); }}>Sign Up</button>
              </div>
              <div className="auth-form">
                {!showForgot ? (
                  <>
                    {authTab === "signup" && (
                      <div><label className="auth-label">Full Name</label><input className="auth-input" placeholder="Your name" value={authName} onChange={e => setAuthName(e.target.value)} /></div>
                    )}
                    <div><label className="auth-label">Email</label><input className="auth-input" type="email" placeholder="you@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} /></div>
                    <div>
                      <label className="auth-label">Password</label>
                      <div className="pw-wrap">
                        <input className="auth-input" type={showAuthPw ? "text" : "password"} placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
                        <button type="button" className="pw-eye" onClick={() => setShowAuthPw(p => !p)} tabIndex={-1}>
                          {showAuthPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                    {authError && <div className="auth-error">⚠️ {authError}</div>}
                    <button className="main-pink-btn" onClick={handleAuth} disabled={authLoading}>
                      {authLoading ? "⏳ LOADING..." : authTab === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
                    </button>
                    {authTab === "login" && (
                      <p onClick={() => { setShowForgot(true); setForgotStep(1); setAuthError(""); }} style={{color: "var(--pink)", textAlign: "center", cursor: "pointer", marginTop: "6px", fontSize: "0.82rem", fontWeight: 600, transition: "opacity 0.2s"}}>
                        🔑 Forgot Password?
                      </p>
                    )}
                    <div className="auth-divider">or</div>
                    <button className="guest-btn" onClick={handleGuest}>👤 Continue as Guest</button>
                  </>
                ) : (
                  <>
                    <h2 style={{fontFamily: "'Bebas Neue'", fontSize: "2rem", color: "var(--dark)", marginBottom: "4px"}}>RESET PASSWORD</h2>
                    <p style={{fontSize: "0.8rem", color: "var(--muted)", marginBottom: "12px"}}>
                      {forgotStep === 1 ? "Enter your registered email to receive OTP" : `OTP sent to: ${resetEmail}`}
                    </p>
                    {forgotStep === 1 ? (
                      <>
                        <div><label className="auth-label">Registered Email</label><input className="auth-input" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleForgotPassword()} /></div>
                        <button className="main-pink-btn" onClick={handleForgotPassword}>📧 SEND OTP TO EMAIL</button>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="auth-label">6-Digit OTP</label>
                          <input className={`auth-input otp-input`} placeholder="8 4 7 2 9 1" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
                        </div>
                        <div>
                          <label className="auth-label">New Password</label>
                          <div className="pw-wrap">
                            <input className="auth-input" type={showNewPw ? "text" : "password"} placeholder="New strong password" value={newPassword} onChange={e => setNewPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleResetPassword()} />
                            <button type="button" className="pw-eye" onClick={() => setShowNewPw(p => !p)} tabIndex={-1}>
                              {showNewPw ? "🙈" : "👁️"}
                            </button>
                          </div>
                        </div>
                        <button className="main-pink-btn" onClick={handleResetPassword}>🔒 UPDATE PASSWORD</button>
                        <p onClick={handleForgotPassword} style={{color: "var(--pink)", textAlign: "center", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600}}>↺ Didn't receive OTP? Resend</p>
                      </>
                    )}
                    <p onClick={() => { setShowForgot(false); setForgotStep(1); setOtp(""); setNewPassword(""); setResetEmail(""); setShowNewPw(false); }} style={{textAlign: "center", cursor: "pointer", marginTop: "10px", color: "var(--muted)", fontSize: "0.82rem"}}>
                      ← Back to Login
                    </p>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD LAYOUT (Shows when logged in) */}
      {slide > 0 && (
        <div className="dashboard-wrapper">
          {/* SIDEBAR NAVIGATION */}
          <aside className="sidebar">
            {DASHBOARD_TABS.map(tab => (
              <button 
                key={tab.id} 
                className={`sidebar-btn${slide === tab.id ? " active" : ""}`} 
                onClick={() => setSlide(tab.id)}
              >
                <span className="icon">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="main-content">
            
            {/* SLIDE 1 — INPUT */}
            {slide === 1 && (
              <div className="slide-content slide-input">
                <div className="s1-bg" />
                <div className="s1-content">
                  <div className="s1-greeting">Hey {user?.name} 👋</div>
                  <div className="s1-title">DROP YOUR <span className="pink">CONTENT</span></div>
                  <p className="s1-sub">YouTube link, URL, text, PDF ya text file — sab chalega</p>
                  <div className="input-card">
                    <div className="lang-row">
                      {["English", "Hindi", "Hinglish"].map(l => (
                        <button key={l} className={`lang-pill${language === l ? " active" : ""}`} onClick={() => setLanguage(l)}>
                          {l === "English" ? "🇬🇧 English" : l === "Hindi" ? "🇮🇳 Hindi" : "🔀 Hinglish"}
                        </button>
                      ))}
                    </div>
                    <div className="tab-row">
                      {[{ id: "url", label: "🔗 URL" }, { id: "text", label: "📝 Text" }, { id: "upload", label: "📁 Upload" }].map(t => (
                        <button key={t.id} className={`tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                      ))}
                    </div>

                    {activeTab === "upload" ? (
                      <div>
                        <div
                          className={`upload-area${dragOver ? " drag-over" : ""}`}
                          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                          <div className="upload-icon">📁</div>
                          <div className="upload-text">Click or <span>drag & drop</span> here</div>
                          <div className="upload-text" style={{ fontSize: "0.7rem", marginTop: "3px" }}>PDF or .txt file (.txt recommended)</div>
                          {uploadedFileName && <div className="upload-file-name">✓ {uploadedFileName}</div>}
                        </div>
                        {input && (
                          <div className="input-row" style={{ marginTop: "0.75rem" }}>
                            <button className="gen-btn" style={{ width: "100%" }} onClick={generateSummary} disabled={loading || !input.trim()}>
                              {loading ? <><div className="btn-spin" />ANALYZING</> : "→ GENERATE SUMMARY"}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="input-row">
                        <input className="main-inp" type="text"
                          placeholder={activeTab === "url" ? "https://youtube.com/..." : "Paste your text here..."}
                          value={input} onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && generateSummary()} />
                        <button className="gen-btn" onClick={generateSummary} disabled={loading || !input.trim()}>
                          {loading ? <><div className="btn-spin" />ANALYZING</> : "→ GENERATE"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2 — SUMMARY */}
            {slide === 2 && (
              <div className="slide-content slide-summary">
                <div className="s2-left">
                  <div className="sec-label">Source</div>
                  <div className="source-box">{input || "—"}</div>
                  <div className="sec-label">Stats</div>
                  <div className="stats-2x2">
                    <div className="stat-box"><div className="stat-val">{wordCount}</div><div className="stat-lbl">Words</div></div>
                    <div className="stat-box"><div className="stat-val">{charCount}</div><div className="stat-lbl">Chars</div></div>
                    <div className="stat-box"><div className="stat-val">{readTime}m</div><div className="stat-lbl">Read</div></div>
                    <div className="stat-box"><div className="stat-val">{language === "English" ? "EN" : language === "Hindi" ? "HI" : "MX"}</div><div className="stat-lbl">Lang</div></div>
                  </div>
                  <div className="action-stack">
                    <button className={`act-btn${speaking ? " speaking" : ""}`} onClick={handleSpeak}>
                      {speaking ? "⏹ Stop" : "🔊 Listen to Summary"}
                    </button>
                    <div className="tts-bar-wrap">
                      <div className="tts-progress-track" onClick={handleSeek}>
                        <div className="tts-progress-fill" style={{ width: `${ttsProgress}%` }} />
                      </div>
                      <div className="tts-time-row">
                        <span>{ttsCurrent} / {ttsTotal} words</span>
                        <span>{fmtTime(ttsTotal - ttsCurrent, speechRate)} left</span>
                      </div>
                      <div className="speed-row">
                        {[1, 1.25, 1.5, 1.75, 2, 2.5, 3].map(r => (
                          <button key={r} className="speed-btn" onClick={() => changeSpeechRate(r)} style={{
                            borderColor: speechRate === r ? "var(--pink)" : "var(--border)",
                            background: speechRate === r ? "var(--pink-soft)" : "var(--card)",
                            color: speechRate === r ? "var(--pink)" : "var(--muted)",
                          }}>{r}x</button>
                        ))}
                      </div>
                    </div>
                    <button className="act-btn" onClick={() => { setAskOpen(true); setAskA(""); setAskQ(""); }}>🧠 Ask AI</button>
                    <button className="act-btn" onClick={handleCopy}>{copied ? "✓ Copied!" : "⎘ Copy Summary"}</button>
                    <button className="act-btn" onClick={() => { generateFlashcards(); setSlide(3); }} disabled={!summary}>🃏 Flashcards</button>
                    <button className="act-btn main" onClick={() => { setSlide(4); if(quiz.length===0) generateQuiz(); }} disabled={!summary}>
                      {quizLoading ? "GENERATING..." : "🧩 TAKE QUIZ →"}
                    </button>
                  </div>
                </div>
                <div className="s2-right">
                  <div className="sec-label">AI Summary · {language}</div>
                  {loading ? (
                    <div className="shimmer-wrap">
                      {[100, 85, 90, 70, 80, 65, 95, 75, 88, 60].map((w, i) => (
                        <div key={i} className="shimmer-line" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  ) : <p className="summary-big">{renderSummary()}</p>}
                </div>
              </div>
            )}

            {/* SLIDE 3 — FLASHCARDS */}
            {slide === 3 && (
              <div className="slide-content slide-flash">
                <div className="s-flash-inner">
                  <div className="flash-hero">
                    <div className="flash-title">FLASH<span className="pink">CARDS</span></div>
                    <div className="flash-sub">Click on a card to flip it! Front = Question, Back = Answer</div>
                  </div>
                  {flashLoading ? (
                    <div className="flash-load"><div className="flash-spin" /><span>Generating flashcards...</span></div>
                  ) : flashcards.length > 0 ? (
                    <>
                      <div className="flash-grid">
                        {flashcards.map((card, i) => (
                          <div key={i} className={`flash-card${flippedCards.has(i) ? " flipped" : ""}`} onClick={() => toggleFlip(i)}>
                            <div className="flash-inner">
                              <div className="flash-front">
                                <div className="flash-q-label">Question {i + 1}</div>
                                <div className="flash-q-text">{card.q}</div>
                                <div className="flash-hint">tap to reveal ↺</div>
                              </div>
                              <div className="flash-back">
                                <div className="flash-a-label">Answer</div>
                                <div className="flash-a-text">{card.a}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button className="flash-gen-btn" onClick={() => { setFlippedCards(new Set()); }}>↺ Reset All</button>
                        <button className="flash-gen-btn" onClick={generateFlashcards}>🔄 Regenerate</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "4rem" }}>
                      <div style={{ fontSize: "3rem", margin: "0 auto 1rem" }}>🃏</div>
                      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Generate flashcards from summary</p>
                      <button className="flash-gen-btn" style={{ margin: "0 auto" }} onClick={generateFlashcards} disabled={!summary || flashLoading}>
                        {flashLoading ? "GENERATING..." : "✨ GENERATE FLASHCARDS"}
                      </button>
                      {!summary && <div style={{ fontSize: "0.8rem", marginTop: "10px", color: "var(--pink)", fontWeight: "bold" }}>Please generate a summary in the Content/Input tab first!</div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SLIDE 4 — QUIZ */}
            {slide === 4 && (
              <div className="slide-content slide-quiz">
                <div className="s3-inner">
                  <div className="quiz-hero">
                    <div>
                      <div className="quiz-big-title">AI <span className="pink">QUIZ</span></div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>
                        {quiz.length > 0 ? `${Object.keys(answers).length}/${quiz.length} answered` : ""}
                      </div>
                    </div>
                    {score !== null && (
                      <div className="quiz-score-display">
                        <div className="score-big-num">{score}/{quiz.length}</div>
                        <div className="score-emoji">{score === quiz.length ? "🎉" : score >= quiz.length / 2 ? "👍" : "💪"}</div>
                        <div className="score-txt">{score === quiz.length ? "PERFECT" : score >= quiz.length / 2 ? "GREAT" : "TRY AGAIN"}</div>
                      </div>
                    )}
                  </div>
                  {quizLoading ? (
                    <div className="quiz-load"><div className="quiz-spin" /><span>Generating quiz...</span></div>
                  ) : quiz.length > 0 ? quiz.map((q, qi) => (
                    <div key={qi} className="q-card" style={{ animationDelay: `${qi * 0.08}s` }}>
                      <div className="q-num">Question {qi + 1} / {quiz.length}</div>
                      <p className="q-text">{q.question}</p>
                      <div className="opts">
                        {q.options.map((opt: string, oi: number) => {
                          let cls = "opt-btn";
                          if (answers[qi]) { if (opt === q.answer) cls += " correct"; else if (opt === answers[qi]) cls += " wrong"; else cls += " revealed"; }
                          return <button key={oi} className={cls} onClick={() => handleAnswer(qi, opt)} disabled={!!answers[qi]}>{opt}</button>;
                        })}
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
                      <div style={{ fontSize: "3rem", margin: "0 auto 1rem" }}>🧩</div>
                      <p style={{marginBottom: "1.5rem"}}>Test your knowledge with an AI generated Quiz.</p>
                      <button className="flash-gen-btn" style={{ margin: "0 auto" }} onClick={generateQuiz} disabled={!summary || quizLoading}>
                        {quizLoading ? "GENERATING..." : "✨ GENERATE QUIZ NOW"}
                      </button>
                      {!summary && <div style={{ fontSize: "0.8rem", marginTop: "10px", color: "var(--pink)", fontWeight: "bold" }}>Please generate a summary in the Content/Input tab first!</div>}
                    </div>
                  )}
                  {score !== null && (
                    <div style={{ textAlign: "center", marginTop: "2rem" }}>
                      <button className="gen-btn" style={{ margin: "0 auto", display: "inline-flex" }} onClick={() => setSlide(5)}>VIEW PROGRESS →</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SLIDE 5 — PROGRESS */}
            {slide === 5 && (
              <div className="slide-content slide-progress">
                <div className="s4-inner">
                  <div className="progress-title">YOUR <span className="pink">PROGRESS</span></div>
                  <p className="progress-sub">Track your learning — summaries, flashcards, quizzes, accuracy</p>
                  <div className="circles-row">
                    <CircleProgress id="s" value={history.length} max={Math.max(history.length, 10)} color1="#ff2d78" color2="#ff6ea8" unit="TOTAL" label="Summaries" />
                    <CircleProgress id="q" value={totalQuizzes} max={Math.max(totalQuizzes, 10)} color1="#e11d48" color2="#ff6ea8" unit="TAKEN" label="Quizzes" />
                    <CircleProgress id="a" value={avgScore} max={100} color1="#ff2d78" color2="#fbbf24" unit="%" label="Accuracy" />
                    <CircleProgress id="w" value={totalCorrect} max={Math.max(totalCorrect, 25)} color1="#be185d" color2="#ff2d78" unit="RIGHT" label="Correct" />
                  </div>
                  <div className="sec-label" style={{ marginBottom: "1rem" }}>Recent Sessions</div>
                  {history.length === 0 ? (
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>No sessions yet!</div>
                  ) : history.map((item, idx) => (
                    <div key={item._id} className="session-item" style={{ animationDelay: `${idx * 0.06}s` }} onClick={() => loadFromHistory(item)}>
                      <div className="session-dot" />
                      <div className="session-info">
                        <div className="session-url">{item.input.length > 50 ? item.input.substring(0, 50) + "..." : item.input}</div>
                        <div className="session-preview">{item.summary}</div>
                      </div>
                      <div className="session-meta">
                        <div className="session-date">{fmt(item.createdAt)}</div>
                        <button className="session-del" onClick={e => deleteHistory(item._id, e)}>✕ delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      )}
    </>
  );
}