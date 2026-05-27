/**
 * Pure search-and-filter helper for the portfolio section.
 *
 * Supports two item shapes for portability between production and tests:
 *   - test/raw shape:  item.locales.en.{title, text, tags}
 *   - wrapper shape:   item.locales.{title, text, tags} (already-localized)
 *
 * @param {Array} items - Items to filter (raw JSON or ArticleItemDataWrapper instances).
 * @param {String|null} selectedCategoryId - Active category id, or "category_all" / falsy for no category filter.
 * @param {String} searchQuery - Free-text query. Empty/whitespace = no text filter.
 * @return {Array} Filtered items in the same order as input.
 */
export function usePortfolioSearch(items, selectedCategoryId, searchQuery) {
    if (!Array.isArray(items)) return []

    const byCategory = filterByCategory(items, selectedCategoryId)

    const query = typeof searchQuery === 'string' ? searchQuery.trim().toLowerCase() : ''
    if (!query) return byCategory

    return byCategory.filter(item => matchesQuery(item, query))
}

function filterByCategory(items, categoryId) {
    if (!categoryId || categoryId === 'category_all') return items
    return items.filter(item => item.categoryId === categoryId)
}

function matchesQuery(item, query) {
    const title = readLocaleField(item, 'title')
    const text = readLocaleField(item, 'text')
    const tags = readLocaleField(item, 'tags')

    const titleStr = typeof title === 'string' ? title.toLowerCase() : ''
    const textStr = typeof text === 'string' ? text.toLowerCase() : ''
    const tagsArr = Array.isArray(tags) ? tags : []

    if (titleStr.includes(query)) return true
    if (textStr.includes(query)) return true
    return tagsArr.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(query))
}

function readLocaleField(item, field) {
    const locales = item?.locales
    if (!locales) return undefined
    if (locales.en && locales.en[field] !== undefined) return locales.en[field]
    return locales[field]
}

export default usePortfolioSearch
