import { describe, it, expect } from 'vitest'
import { usePortfolioSearch } from '../hooks/usePortfolioSearch.js'

const mockItems = [
    {
        id: 1,
        categoryId: 'category_web',
        locales: { en: { title: 'Tutor Finder', text: 'connects students', tags: ['Laravel', 'MySQL'] } }
    },
    {
        id: 2,
        categoryId: 'category_apps',
        locales: { en: { title: 'Matchmaking App', text: 'dating platform', tags: ['PHP', 'Redis'] } }
    },
    {
        id: 3,
        categoryId: 'category_utilities',
        locales: { en: { title: 'CI/CD Pipeline', text: 'deployment automation', tags: ['Docker', 'Git'] } }
    }
]

describe('usePortfolioSearch', () => {
    it('returns all 3 items when search is empty and category is category_all', () => {
        const result = usePortfolioSearch(mockItems, 'category_all', '')
        expect(result).toHaveLength(3)
        expect(result.map(i => i.id)).toEqual([1, 2, 3])
    })

    it('returns only the Tutor Finder when searching "Laravel" (tag match)', () => {
        const result = usePortfolioSearch(mockItems, 'category_all', 'Laravel')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(1)
        expect(result[0].locales.en.title).toBe('Tutor Finder')
    })

    it('returns an empty array when the query matches nothing', () => {
        const result = usePortfolioSearch(mockItems, 'category_all', 'xyz123')
        expect(result).toEqual([])
    })

    it('matches against the text/description field — "dating" returns Matchmaking App', () => {
        const result = usePortfolioSearch(mockItems, 'category_all', 'dating')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(2)
        expect(result[0].locales.en.title).toBe('Matchmaking App')
    })

    it('matches tags case-insensitively — "laravel" lowercase finds the "Laravel" tag', () => {
        const result = usePortfolioSearch(mockItems, 'category_all', 'laravel')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(1)
    })

    it('combines category filter with search — "PHP" within category_apps returns only Matchmaking App', () => {
        const result = usePortfolioSearch(mockItems, 'category_apps', 'PHP')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(2)
        expect(result[0].locales.en.title).toBe('Matchmaking App')
    })

    it('clearing the search (empty query) returns the full list for the current category', () => {
        // Sanity: an active query narrows the category further.
        expect(usePortfolioSearch(mockItems, 'category_apps', 'PHP')).toHaveLength(1)

        // Clicking the clear (×) button sets searchQuery to "". The hook
        // should then return every item in the active category.
        const resetApps = usePortfolioSearch(mockItems, 'category_apps', '')
        expect(resetApps).toHaveLength(1)
        expect(resetApps[0].id).toBe(2)

        const resetAll = usePortfolioSearch(mockItems, 'category_all', '')
        expect(resetAll).toHaveLength(3)
    })

    it('trims surrounding whitespace — "  Laravel  " still matches', () => {
        const result = usePortfolioSearch(mockItems, 'category_all', '  Laravel  ')
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(1)
    })
})
