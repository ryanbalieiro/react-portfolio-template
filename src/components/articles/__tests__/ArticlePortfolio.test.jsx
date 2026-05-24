import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ArticlePortfolio from '../ArticlePortfolio.jsx'

// ── dependency mocks ──────────────────────────────────────────────────────────

vi.mock('/src/components/articles/base/Article.jsx', () => ({
    default: Object.assign(
        ({ children }) => <div>{children}</div>,
        { Types: { SPACING_DEFAULT: 'spacing-default' } }
    )
}))

vi.mock('/src/components/capabilities/Transitionable.jsx', () => ({
    default: Object.assign(
        ({ children, className }) => <div className={className}>{children}</div>,
        { Animations: { POP: 'pop' } }
    )
}))

vi.mock('/src/providers/ViewportProvider.jsx', () => ({
    useViewport: () => ({ getCustomBreakpoint: () => ({ slidesPerView: 1 }) })
}))

vi.mock('/src/hooks/constants.js', () => ({
    useConstants: () => ({ SWIPER_BREAKPOINTS_FOR_THREE_SLIDES: {} })
}))

vi.mock('/src/providers/LanguageProvider.jsx', () => ({
    useLanguage: () => ({
        getString: () => '',
        getSelectedLanguage: () => ({ id: 'en' })
    })
}))

vi.mock('/src/components/generic/AvatarView.jsx', () => ({
    default: () => null
}))

vi.mock('/src/components/generic/Tags.jsx', () => ({
    Tag: Object.assign(
        ({ text }) => <span>{text}</span>,
        { Variants: { DARK: 'dark' } }
    ),
    Tags: ({ children }) => <>{children}</>
}))

vi.mock('/src/components/articles/partials/ArticleItemPreviewMenu.jsx', () => ({
    default: () => null
}))

// ── fixture data ──────────────────────────────────────────────────────────────

const mockItems = [
    {
        img: '', faIcon: '', faIconStyle: {}, imageAlt: '', placeholder: '',
        category: null, preview: null,
        locales: { title: 'Rails API Service', text: 'Backend built with Ruby on Rails.', tags: ['rails', 'ruby'] }
    },
    {
        img: '', faIcon: '', faIconStyle: {}, imageAlt: '', placeholder: '',
        category: null, preview: null,
        locales: { title: 'Next.js Frontend', text: 'Modern frontend application.', tags: ['react', 'nextjs'] }
    },
    {
        img: '', faIcon: '', faIconStyle: {}, imageAlt: '', placeholder: '',
        category: null, preview: null,
        locales: { title: 'Java Data Service', text: 'Java-based data processing.', tags: ['java'] }
    },
]

const mockDataWrapper = {
    uniqueId: 'portfolio-test',
    categories: null,
    getOrderedItemsFilteredBy: () => mockItems,
}

// ── helpers ───────────────────────────────────────────────────────────────────

function setup() {
    render(<ArticlePortfolio dataWrapper={mockDataWrapper} id={1} />)
    return screen.getByRole('searchbox')
}

function advanceDebounce() {
    act(() => { vi.advanceTimersByTime(300) })
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ArticlePortfolio – search UI', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    // Scenario 1: empty search → all category items are shown
    it('shows all items when the search box is empty', () => {
        setup()
        advanceDebounce()
        expect(screen.getByText('Rails API Service')).toBeInTheDocument()
        expect(screen.getByText('Next.js Frontend')).toBeInTheDocument()
        expect(screen.getByText('Java Data Service')).toBeInTheDocument()
    })

    // Scenario 2: query matches title → only matching items shown
    it('filters items by title when the user types a query', () => {
        const input = setup()
        fireEvent.change(input, { target: { value: 'rails' } })
        advanceDebounce()
        expect(screen.getByText('Rails API Service')).toBeInTheDocument()
        expect(screen.queryByText('Next.js Frontend')).not.toBeInTheDocument()
        expect(screen.queryByText('Java Data Service')).not.toBeInTheDocument()
    })

    // Scenario 2 (variant): query matches a tag
    it('filters items by tag when the user types a query', () => {
        const input = setup()
        fireEvent.change(input, { target: { value: 'react' } })
        advanceDebounce()
        expect(screen.getByText('Next.js Frontend')).toBeInTheDocument()
        expect(screen.queryByText('Rails API Service')).not.toBeInTheDocument()
    })

    // Scenario 3: no match → empty state replaces the grid
    it('shows the empty state when no projects match the search', () => {
        const input = setup()
        fireEvent.change(input, { target: { value: 'zzzzzz' } })
        advanceDebounce()
        expect(screen.queryByText('Rails API Service')).not.toBeInTheDocument()
        expect(screen.queryByText('Next.js Frontend')).not.toBeInTheDocument()
        expect(screen.queryByText('Java Data Service')).not.toBeInTheDocument()
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    // Scenario 4 (optional): clicking clear restores the full list
    it('resets the list and removes the empty state when the clear button is clicked', () => {
        const input = setup()
        fireEvent.change(input, { target: { value: 'zzzzzz' } })
        advanceDebounce()
        expect(screen.getByRole('status')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /clear/i }))

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
        expect(screen.getByText('Rails API Service')).toBeInTheDocument()
        expect(screen.getByText('Next.js Frontend')).toBeInTheDocument()
        expect(screen.getByText('Java Data Service')).toBeInTheDocument()
    })
})
