import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import ArticleDataWrapper from '/src/hooks/models/ArticleDataWrapper.js'
import ArticlePortfolio from '../ArticlePortfolio.jsx'

// Mock provider hooks used by the component tree
vi.mock('/src/providers/ViewportProvider.jsx', () => ({
    useViewport: () => ({
        getCustomBreakpoint: () => ({ slidesPerView: 1 }),
    }),
}))

vi.mock('/src/providers/LanguageProvider.jsx', () => ({
    useLanguage: () => ({
        getSelectedLanguage: () => ({ id: 'en' }),
        getString: (key) => (key === 'filter_by' ? 'Filter by {x}' : key),
    }),
}))

vi.mock('/src/hooks/constants.js', () => ({
    useConstants: () => ({
        SWIPER_BREAKPOINTS_FOR_THREE_SLIDES: [],
    }),
}))

vi.mock('/src/providers/ThemeProvider.jsx', () => ({
    useTheme: () => ({
        getSelectedTheme: () => ({ dark: false }),
    }),
}))

// Minimal language + theme stubs for constructing ArticleDataWrapper instances
const mockLanguage = {
    getTranslation: (locales, key, fallback) => {
        const val = locales?.en?.[key]
        return val !== undefined ? val : (fallback !== undefined ? fallback : null)
    },
    getDateLocaleString: () => '',
    getExperienceTimeString: () => '',
    parseJsonText: (text) => (text == null ? text : String(text)),
    getString: () => '',
}

const mockTheme = {
    getSelectedTheme: () => ({ dark: false }),
}

// Sample data: 2 Apps + 1 Web project
const rawData = {
    component: 'ArticlePortfolio',
    settings: {
        categorize_by: ['category_apps', 'category_web'],
        order_items_by: 'id',
        order_items_sort: 'asc',
    },
    locales: {
        en: { category_all: 'All', category_apps: 'Apps', category_web: 'Web' },
    },
    items: [
        {
            categoryId: 'category_apps',
            img: '', faIcon: '', faIconColors: {},
            preview: { links: [], screenshots: [], screenshotsAspectRatio: '', youtubeVideo: '' },
            locales: { en: { title: 'Chatbot Project', text: 'A RAG recruitment platform', tags: ['RAG', 'Python'] } },
        },
        {
            categoryId: 'category_apps',
            img: '', faIcon: '', faIconColors: {},
            preview: { links: [], screenshots: [], screenshotsAspectRatio: '', youtubeVideo: '' },
            locales: { en: { title: 'Helmet Detection', text: 'YOLOv8 object detection', tags: ['Python', 'YOLOv8'] } },
        },
        {
            categoryId: 'category_web',
            img: '', faIcon: '', faIconColors: {},
            preview: { links: [], screenshots: [], screenshotsAspectRatio: '', youtubeVideo: '' },
            locales: { en: { title: 'Car Showroom', text: 'Three.js 3D website', tags: ['JavaScript', 'Three.js'] } },
        },
    ],
}

// ─── Test 1 ──────────────────────────────────────────────────────────────────
// Empty search query returns all projects for the selected category.
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 1 — empty search returns all items for the selected category', () => {
    let dw

    beforeEach(() => {
        dw = new ArticleDataWrapper({ id: 1 }, rawData, mockLanguage, mockTheme, 1)
    })

    it('returns all 2 Apps items when the query is empty', () => {
        const result = dw.getOrderedItemsFilteredByQuery('category_apps', '')
        expect(result).toHaveLength(2)
    })

    it('returns all 3 items across all categories when the query is empty', () => {
        const result = dw.getOrderedItemsFilteredByQuery('category_all', '')
        expect(result).toHaveLength(3)
    })
})

// ─── Test 2 ──────────────────────────────────────────────────────────────────
// A non-empty query filters by title, tag, and description text.
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 2 — typing text filters to matching projects', () => {
    let dw

    beforeEach(() => {
        dw = new ArticleDataWrapper({ id: 1 }, rawData, mockLanguage, mockTheme, 1)
    })

    it('matches by tag — "python" returns both app items that have it as a tag', () => {
        const result = dw.getOrderedItemsFilteredByQuery(null, 'python')
        expect(result).toHaveLength(2)
        result.forEach(item =>
            expect((item.locales.tags || []).map(t => t.toLowerCase())).toContain('python')
        )
    })

    it('matches by title — "chatbot" returns only the Chatbot Project', () => {
        const result = dw.getOrderedItemsFilteredByQuery(null, 'chatbot')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('Chatbot Project')
    })

    it('matches by description text — "three.js" returns only the Car Showroom', () => {
        const result = dw.getOrderedItemsFilteredByQuery(null, 'three.js')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('Car Showroom')
    })

    it('is case-insensitive — "YOLOV8" matches the lowercase tag "yolov8"', () => {
        const result = dw.getOrderedItemsFilteredByQuery(null, 'YOLOV8')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('Helmet Detection')
    })

    it('respects category filter — "python" inside category_web returns nothing', () => {
        const result = dw.getOrderedItemsFilteredByQuery('category_web', 'python')
        expect(result).toHaveLength(0)
    })
})

// ─── Test 3 ──────────────────────────────────────────────────────────────────
// Typing text that matches nothing shows the empty state (0 cards).
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 3 — non-matching query shows empty state with 0 project cards', () => {
    it('renders the empty state message and no cards when nothing matches', async () => {
        const user = userEvent.setup()
        const dw = new ArticleDataWrapper({ id: 1 }, rawData, mockLanguage, mockTheme, 1)
        const { container } = render(<ArticlePortfolio dataWrapper={dw} id={1} />)

        const input = screen.getByPlaceholderText('Search projects...')
        await user.type(input, 'zzzzzzz')

        // Empty-state message must be visible
        expect(screen.getByText(/no results for/i)).toBeInTheDocument()

        // Zero project cards must remain in the DOM
        expect(container.querySelectorAll('.article-portfolio-item')).toHaveLength(0)
    })
})
