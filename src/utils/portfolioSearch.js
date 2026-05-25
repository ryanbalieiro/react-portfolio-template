/**
 * Pure search-match logic for portfolio items.
 * Kept framework-free so it can be unit-tested without a React tree.
 */

const HTML_TAG_REGEX = /<[^>]*>/g

/**
 * @param {string} value
 * @returns {string}
 */
function normalize(value) {
    return (value || "").toString().toLowerCase()
}

/**
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
    return normalize(html).replace(HTML_TAG_REGEX, " ")
}

/**
 * Returns true if the query matches the item's title, any tag, or description (HTML stripped).
 * Empty / whitespace-only queries match every item.
 *
 * @param {{locales?: {title?: string, tags?: string[], text?: string}}} item
 * @param {string} query
 * @returns {boolean}
 */
export function matchesSearchQuery(item, query) {
    const normalizedQuery = normalize(query).trim()
    if (!normalizedQuery)
        return true

    const locales = item?.locales || {}
    const title = normalize(locales.title)
    const text = stripHtml(locales.text)
    const tags = Array.isArray(locales.tags) ? locales.tags.map(normalize) : []

    if (title.includes(normalizedQuery)) return true
    if (text.includes(normalizedQuery)) return true
    return tags.some(tag => tag.includes(normalizedQuery))
}
