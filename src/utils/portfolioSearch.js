export function stripHTML(str) {
    return String(str || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ')
}

export function matchesSearch(itemWrapper, query) {
    if (!query.trim()) return true
    const q     = query.toLowerCase()
    const title = stripHTML(itemWrapper.locales.title).toLowerCase()
    const text  = stripHTML(itemWrapper.locales.text).toLowerCase()
    const tags  = (itemWrapper.locales.tags || []).join(' ').toLowerCase()
    return title.includes(q) || text.includes(q) || tags.includes(q)
}
