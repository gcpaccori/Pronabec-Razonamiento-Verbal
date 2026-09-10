(() => {
  'use strict';

  const SESSION_KEY = 'pronabec-adaptive-session-v3';
  const TOTAL = Number(window.PRONABEC_DATA?.metadata?.total_questions) || 280;
  const questions = new Map((window.PRONABEC_DATA?.topics || [])
    .flatMap(t => t.questions || []).map(q => [q.id, q]));

  let client = null;
  let user = null;
  let status = 'starting';
  let queue = [];
  let positionTimer = null;
  const readyListeners = new Set();

  function localSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') || {}; }
    catch (_) { return {}; }
  }

  function currentQuestionId() {
    return document.querySelector('.nav-num.current')?.getAttribute('title') || '';
  }

  function currentTopicId() {
    const id = currentQuestionId();
    return id ? String(questions.get(id)?.topic_id ?? '') : '';
  }

  function setStatus(next) {
    status = next;
    window.dispatchEvent(new CustomEvent('pronabec-cloud-status', { detail: { status, user } }));
  }

  function localAchievementRows(progress) {
    const rows = [];
    const add = code => rows.push({ code, unlocked_at:null, metadata:{} });
    const n = Number(progress.unique_questions) || 0;
    const sessions = Number(progress.completed_sessions) || 0;
    const first = Number(progress.first_try_correct) || 0;
    if (n >= 1) add('first_step');
    if (n >= 10) add('questions_10');
    if (n >= 25) add('questions_25');
    if (n >= 50) add('questions_50');
    if (n >= 100) add('questions_100');
    if (n >= 140) add('halfway');
    if (n >= 280) add('complete_book');
    if (sessions >= 1) add('session_1');
    if (sessions >= 5) add('sessions_5');
    if (sessions >= 10) add('sessions_10');
    if (n >= 20 && first / Math.max(n,1) >= .70) add('precision_70');
    if (n >= 50 && first / Math.max(n,1) >= .85) add('precision_85');
    return rows.reverse();
  }

  function localDashboard() {
    const s = localSession();
    const rows = Object.values(s.progressAnswered || {});
    const solved = rows.filter(x => {
      const q = questions.get(x.id);
      return !!(x.firstCorrect || (q && x.lastSelected === q.correct_answer));
    }).length;
    const firstCorrect = rows.filter(x => x.firstCorrect).length;
    const progress = {
      total_questions: TOTAL,
      unique_questions: rows.length,
      solved_questions: solved,
      first_try_correct: firstCorrect,
      total_attempts: rows.reduce((n, x) => n + (Number(x.attempts) || 1), 0),
      completed_sessions: Number(s.completedSessions) || 0,
      total_active_ms: Number(s.lifetimeActiveMs) || 0,
      current_question_id: s.lastPosition?.id || currentQuestionId() || null
    };
    return {
      source: 'local',
      progress,
      achievements: localAchievementRows(progress),
      sessions: (s.sessionHistory || []).slice(-12).reverse()
    };
  }

  async function fetchConfig() {
    const r = await fetch('/api/supabase-config', { cache: 'no-store' });
    if (!r.ok) return null;
    const cfg = await r.json();
    return cfg?.configured ? cfg : null;
  }

  async function ensureUser() {
    const { data: existing } = await client.auth.getSession();
    if (existing?.session?.user) return existing.session.user;
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    return data?.user || data?.session?.user || null;
  }

  async function migrateLocal() {
    if (!user) return;
    const marker = `pronabec-cloud-migrated-v1-${user.id}`;
    if (localStorage.getItem(marker) === '1') return;

    const s = localSession();
    const items = Object.values(s.progressAnswered || {}).map(x => {
      const q = questions.get(x.id);
      return {
        id: x.id,
        first_correct: !!x.firstCorrect,
        last_selected: x.lastSelected || null,
        solved: !!(x.firstCorrect || (q && x.lastSelected === q.correct_answer)),
        attempts: Math.max(1, Number(x.attempts) || 1)
      };
    });

    const { error } = await client.rpc('import_local_state', {
      p_questions: items,
      p_completed_sessions: Number(s.completedSessions) || 0,
      p_total_active_ms: Number(s.lifetimeActiveMs) || 0,
      p_current_question_id: s.lastPosition?.id || currentQuestionId() || null
    });
    if (error) throw error;
    localStorage.setItem(marker, '1');
  }

  async function runOrQueue(task) {
    if (status === 'ready' && client && user) return task();
    queue.push(task);
    return null;
  }

  async function flushQueue() {
    const pending = queue;
    queue = [];
    for (const task of pending) {
      try { await task(); } catch (_) {}
    }
  }

  async function recordAttempt(payload) {
    return runOrQueue(async () => {
      const { data, error } = await client.rpc('record_attempt', {
        p_question_id: payload.questionId,
        p_selected_answer: payload.selected,
        p_correct: !!payload.correct,
        p_active_ms: Number.isFinite(payload.activeMs) ? Math.round(payload.activeMs) : null,
        p_topic_id: payload.topicId == null ? null : String(payload.topicId)
      });
      if (error) throw error;
      window.dispatchEvent(new CustomEvent('pronabec-progress-updated', { detail: data }));
      return data;
    });
  }

  async function recordSession(snapshot) {
    if (!snapshot?.sessionNumber) return;
    return runOrQueue(async () => {
      const marker = `pronabec-cloud-session-v1-${user.id}-${snapshot.sessionNumber}`;
      if (localStorage.getItem(marker) === '1') return;

      const pace = snapshot.answered > 0 ? Math.round(snapshot.activeMs / snapshot.answered) : null;
      const clientKey = `${snapshot.sessionNumber}:${snapshot.endedAt || 'local'}`;
      const { data, error } = await client.rpc('finish_study_session', {
        p_active_ms: Math.round(snapshot.activeMs || 0),
        p_questions_worked: Number(snapshot.answered) || 0,
        p_first_try_correct: Number(snapshot.correctFirstTry) || 0,
        p_pace_ms: pace,
        p_target_low: Number(snapshot.routeLow) || null,
        p_target_high: Number(snapshot.routeHigh) || null,
        p_client_key: clientKey
      });
      if (error) throw error;
      localStorage.setItem(marker, '1');
      window.dispatchEvent(new CustomEvent('pronabec-progress-updated', { detail: data }));
    });
  }

  async function syncSessions() {
    const s = localSession();
    for (const snapshot of s.sessionHistory || []) {
      try { await recordSession(snapshot); } catch (_) {}
    }
  }

  function savePosition(questionId = currentQuestionId(), topicId = currentTopicId()) {
    if (!questionId) return;
    clearTimeout(positionTimer);
    positionTimer = setTimeout(() => {
      runOrQueue(async () => {
        const { error } = await client.rpc('save_position', {
          p_question_id: questionId,
          p_topic_id: topicId || null
        });
        if (error) throw error;
      });
    }, 650);
  }

  async function getDashboard() {
    if (status !== 'ready' || !client || !user) return localDashboard();
    const [p, a, s] = await Promise.all([
      client.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
      client.from('achievements').select('code,unlocked_at,metadata').eq('user_id', user.id).order('unlocked_at', { ascending: false }),
      client.from('study_sessions').select('session_number,active_ms,questions_worked,first_try_correct,pace_ms,target_low,target_high,finished_at').eq('user_id', user.id).order('finished_at', { ascending: false }).limit(12)
    ]);
    if (p.error) throw p.error;
    if (a.error) throw a.error;
    if (s.error) throw s.error;
    return {
      source: 'cloud',
      progress: p.data || localDashboard().progress,
      achievements: a.data || [],
      sessions: s.data || []
    };
  }

  async function init() {
    try {
      const cfg = await fetchConfig();
      if (!cfg || !window.supabase?.createClient) {
        setStatus('local');
        return;
      }

      client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
      });
      user = await ensureUser();
      if (!user) throw new Error('No se pudo crear la sesión de usuario');

      await migrateLocal();
      setStatus('ready');
      await syncSessions();
      await flushQueue();
      savePosition();
      for (const fn of readyListeners) { try { fn(); } catch (_) {} }
      readyListeners.clear();
    } catch (error) {
      console.warn('[PRONABEC cloud] modo local:', error?.message || error);
      setStatus('local');
    }
  }

  document.addEventListener('click', e => {
    const option = e.target.closest('[data-option]');
    if (!option) return;
    const id = currentQuestionId();
    const q = questions.get(id);
    if (!id || !q) return;
    const selected = option.getAttribute('data-option');
    const s = localSession();
    recordAttempt({
      questionId:id,
      topicId:q.topic_id,
      selected,
      correct:selected === q.correct_answer,
      activeMs:Number(s.blockActiveMs) || null
    }).catch(() => {});
  }, { capture:true });

  const bodyObserver = new MutationObserver(() => {
    savePosition();
    if (document.querySelector('.session-backdrop')) syncSessions().catch(() => {});
  });
  bodyObserver.observe(document.documentElement, { childList:true, subtree:true });

  window.addEventListener('pagehide', () => savePosition());
  window.addEventListener('pronabec-session-complete', e => recordSession(e.detail).catch(() => {}));

  window.PRONABEC_CLOUD = {
    init, recordAttempt, recordSession, savePosition, getDashboard, localDashboard,
    get status(){ return status; },
    get user(){ return user; },
    onReady(fn){ status === 'ready' ? fn() : readyListeners.add(fn); }
  };

  init();
})();
