(() => {
  'use strict';

  // Corrige la página visual asociada a preguntas cuyo gráfico/infografía
  // está en una página anterior del libro original.
  const VISUAL_PAGE_BY_QUESTION = {
    'RV-17-001': 251, 'RV-17-002': 251, 'RV-17-003': 251, 'RV-17-004': 251, 'RV-17-005': 251,
    'RV-17-006': 253, 'RV-17-007': 253, 'RV-17-008': 253, 'RV-17-009': 253, 'RV-17-010': 253,
    'RV-17-011': 256, 'RV-17-012': 256, 'RV-17-013': 256, 'RV-17-014': 256, 'RV-17-015': 256,
    'RV-18-001': 269, 'RV-18-002': 269,
    'RV-18-003': 270, 'RV-18-004': 270, 'RV-18-005': 270,
    'RV-18-006': 273, 'RV-18-007': 273, 'RV-18-008': 273, 'RV-18-009': 273, 'RV-18-010': 273,
    'RV-18-011': 275, 'RV-18-012': 275, 'RV-18-013': 275, 'RV-18-014': 275, 'RV-18-015': 275,
    'RV-21-010': 323, 'RV-21-011': 323, 'RV-21-012': 323
  };

  const data = window.PRONABEC_DATA;
  if (!data || !Array.isArray(data.topics)) return;

  for (const topic of data.topics) {
    for (const q of topic.questions || []) {
      const page = VISUAL_PAGE_BY_QUESTION[q.id];
      if (!page) continue;
      q.question_original_page_start ??= q.original_page_start;
      q.question_original_page_end ??= q.original_page_end;
      q.original_page_start = page;
      q.original_page_end = page;
      q.requires_visual = 1;
    }
  }
})();
