export const stripHtmlForSearch = s => (s || '').replace(/<[^>]*>/g, '').toLowerCase()

export function matchesSearch(locales, query) {
    const q = query.toLowerCase().trim()
    const title = stripHtmlForSearch(locales.title)
    const text  = stripHtmlForSearch(locales.text)
    const tags  = (locales.tags || []).map(t => t.toLowerCase())
    return title.includes(q) || text.includes(q) || tags.some(t => t.includes(q))
}
