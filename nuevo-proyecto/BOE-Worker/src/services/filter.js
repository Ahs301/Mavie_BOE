'use strict';

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildWordBoundaryRegex(keyword) {
  const escaped = escapeRegex(keyword);
  return new RegExp(`(?<![\\w\u00C0-\u024F])${escaped}(?![\\w\u00C0-\u024F])`, 'i');
}

/**
 * Filtra items por keywords del cliente.
 * Usa word-boundary para evitar falsos positivos (ej: "licitacion" no matchea "prelicitacion").
 * Busca también en el campo section del BOE.
 */
function filterItems(items, positiveKeywords, negativeKeywords) {
  const posKws = (positiveKeywords || []).map(normalizeText).filter(Boolean);
  const negKws = (negativeKeywords || []).map(normalizeText).filter(Boolean);

  const posRegexes = posKws.map(buildWordBoundaryRegex);
  const negRegexes = negKws.map(buildWordBoundaryRegex);

  const filtered = items.filter(item => {
    const searchText = normalizeText(
      `${item.title} ${item.description} ${item.section || ''}`
    );

    for (const regex of negRegexes) {
      if (regex.test(searchText)) return false;
    }

    if (posRegexes.length === 0) return true;

    return posRegexes.some(regex => regex.test(searchText));
  });

  console.log(`[Filter] ${filtered.length}/${items.length} items match`);
  return filtered;
}

module.exports = { filterItems };
