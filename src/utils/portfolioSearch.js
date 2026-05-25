/**
 * Strips HTML tags and portfolio template markup ({{...}}, [[...]]) from a string.
 * @param {string} html
 * @returns {string}
 */
function stripMarkup(html) {
    if (!html) return ''
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\[\[|\]\]|\{\{|\}\}/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Filters an array of ArticleItemDataWrapper (or compatible plain objects) by a search query.
 * Matches against locales.title, locales.tags[], and locales.text (case-insensitive).
 * Returns the full array unchanged when query is empty or whitespace-only.
 *
 * @param {Array} items
 * @param {string|null|undefined} query
 * @returns {Array}
 */
export function filterItemsBySearch(items, query) {
    const q = (query || '').trim().toLowerCase()
    if (!q) return items

    return items.filter(item => {
        const locales = item.locales || {}

        const title = stripMarkup(locales.title || '').toLowerCase()
        if (title.includes(q)) return true

        const tags = locales.tags || []
        if (tags.some(tag => tag.toLowerCase().includes(q))) return true

        const text = stripMarkup(locales.text || '').toLowerCase()
        if (text.includes(q)) return true

        return false
    })
}
