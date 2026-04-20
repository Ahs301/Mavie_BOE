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

/**
 * Filtra items por keywords del cliente.
 * @param {Array} items
 * @param {string[]} positiveKeywords
 * @param {string[]} negativeKeywords
 * @returns {Array}
 */
function filterItems(items, positiveKeywords, negativeKeywords) {
  const posKws = (positiveKeywords || []).map(normalizeText).filter(Boolean);
  const negKws = (negativeKeywords || []).map(normalizeText).filter(Boolean);

  const filtered = items.filter(item => {
    const searchText = normalizeText(`${item.title} ${item.description}`);

    for (const neg of negKws) {
      if (searchText.includes(neg)) return false;
    }

    if (posKws.length === 0) return true;

    return posKws.some(kw => searchText.includes(kw));
  });

  console.log(`[Filter] ${filtered.length}/${items.length} items match`);
  return filtered;
}

module.exports = { filterItems };
