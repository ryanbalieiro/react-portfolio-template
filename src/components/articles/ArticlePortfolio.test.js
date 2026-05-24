import { describe, it, expect } from 'vitest'
import { filterPortfolioItems } from './ArticlePortfolio'

const mockItems = [
    {
        locales: {
            title: 'React Dashboard',
            text: 'A frontend analytics dashboard',
            tags: ['react', 'frontend', 'charts'],
        },
    },
    {
        locales: {
            title: 'Node API Server',
            text: 'Backend REST service',
            tags: ['node', 'backend', 'express'],
        },
    },
    {
        locales: {
            title: 'Python Data Pipeline',
            text: 'Batch processing for data analysis',
            tags: ['python', 'data', 'etl'],
        },
    },
]

describe('filterPortfolioItems', () => {
    it('returns all items when query is empty', () => {
        expect(filterPortfolioItems(mockItems, '')).toHaveLength(3)
        expect(filterPortfolioItems(mockItems, '   ')).toHaveLength(3)
        expect(filterPortfolioItems(mockItems, null)).toHaveLength(3)
    })

    it('filters by title, tag, or description (case-insensitive)', () => {
        const byTitle = filterPortfolioItems(mockItems, 'React')
        expect(byTitle).toHaveLength(1)
        expect(byTitle[0].locales.title).toBe('React Dashboard')

        const byTag = filterPortfolioItems(mockItems, 'express')
        expect(byTag).toHaveLength(1)
        expect(byTag[0].locales.title).toBe('Node API Server')

        const byDesc = filterPortfolioItems(mockItems, 'batch processing')
        expect(byDesc).toHaveLength(1)
        expect(byDesc[0].locales.title).toBe('Python Data Pipeline')
    })

    it('returns empty array when nothing matches', () => {
        const result = filterPortfolioItems(mockItems, 'zzznomatch999')
        expect(result).toHaveLength(0)
    })

    it('empty query after filtering restores the full list', () => {
        const filtered = filterPortfolioItems(mockItems, 'node')
        expect(filtered).toHaveLength(1)

        const restored = filterPortfolioItems(mockItems, '')
        expect(restored).toHaveLength(3)
    })
})
