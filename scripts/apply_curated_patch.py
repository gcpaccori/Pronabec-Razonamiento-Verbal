from pathlib import Path

p = Path('app.js')
s = p.read_text(encoding='utf-8')

old = """    if (isCorrect) return `<div class=\"feedback ok\">${icon('check')}<div><b>Respuesta correcta</b></div></div>`;
    const inline = window.PRONABEC_COACH?.compactFeedback?.(q, selected);"""
new = """    if (isCorrect) {
      const learned = window.PRONABEC_COACH?.successFeedback?.(q, selected);
      if (learned) return learned;
      return `<div class=\"feedback ok\">${icon('check')}<div><b>Respuesta correcta</b></div></div>`;
    }
    const inline = window.PRONABEC_COACH?.compactFeedback?.(q, selected);"""

if old not in s:
    raise SystemExit('renderFeedback hook target not found')
s = s.replace(old, new, 1)

old_prompt = '<p class="prompt">${esc(q.prompt)}</p>'
new_prompt = '<p class="prompt">${window.PRONABEC_COACH?.annotatePrompt?.(q, selected) || esc(q.prompt)}</p>'
if old_prompt not in s:
    raise SystemExit('prompt hook target not found')
s = s.replace(old_prompt, new_prompt, 1)

p.write_text(s, encoding='utf-8')
