import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { filterItemsBySearch } from '../utils/portfolioSearch.js'
import PortfolioSearchBar from '../components/articles/PortfolioSearchBar.jsx'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const item = (title, tags, text) => ({ locales: { title, tags, text } })

const ITEMS = [
    item('E-Learning Classroom',    ['Flutter', 'Dart', 'PWA'],         'A cross-platform e-learning app built with Flutter.'),
    item('iBanking Tuition Payment',['Next.js', 'TypeScript', 'OTP'],   'A tuition payment system with NestJS microservices.'),
    item('Restaurant Ordering App', ['Vue.js', 'Zalo', 'WebSocket'],    'A Zalo Mini App for restaurant customers.'),
]

// ---------------------------------------------------------------------------
// Test 1 — Empty query returns all items for the current category
// ---------------------------------------------------------------------------

describe('filterItemsBySearch — empty query', () => {
    it('returns all items when query is an empty string', () => {
        expect(filterItemsBySearch(ITEMS, '')).toHaveLength(3)
    })

    it('returns all items when query is whitespace only', () => {
        expect(filterItemsBySearch(ITEMS, '   ')).toHaveLength(3)
    })

    it('returns all items when query is null', () => {
        expect(filterItemsBySearch(ITEMS, null)).toHaveLength(3)
    })

    it('returns all items when query is undefined', () => {
        expect(filterItemsBySearch(ITEMS, undefined)).toHaveLength(3)
    })
})

// ---------------------------------------------------------------------------
// Test 2 — Matching returns only relevant projects
// ---------------------------------------------------------------------------

describe('filterItemsBySearch — query matches title, tag, or description', () => {
    it('matches by title (case-insensitive)', () => {
        const result = filterItemsBySearch(ITEMS, 'EBANKING')
        // 'ibanking' is a substring of 'iBanking Tuition Payment' lowercase
        expect(filterItemsBySearch(ITEMS, 'ibanking')).toHaveLength(1)
        expect(filterItemsBySearch(ITEMS, 'ibanking')[0].locales.title).toBe('iBanking Tuition Payment')
    })

    it('matches by title with mixed case', () => {
        const result = filterItemsBySearch(ITEMS, 'Restaurant')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('Restaurant Ordering App')
    })

    it('matches by tag (case-insensitive)', () => {
        const result = filterItemsBySearch(ITEMS, 'flutter')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('E-Learning Classroom')
    })

    it('matches by tag with uppercase query', () => {
        const result = filterItemsBySearch(ITEMS, 'WEBSOCKET')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('Restaurant Ordering App')
    })

    it('matches by description text', () => {
        const result = filterItemsBySearch(ITEMS, 'microservices')
        expect(result).toHaveLength(1)
        expect(result[0].locales.title).toBe('iBanking Tuition Payment')
    })

    it('matches multiple items when query is broad', () => {
        // 'app' appears in 'E-Learning Classroom' description and 'Restaurant Ordering App' title
        const result = filterItemsBySearch(ITEMS, 'app')
        expect(result.length).toBeGreaterThanOrEqual(2)
    })
})

// ---------------------------------------------------------------------------
// Test 3 — No matches produces an empty result
// ---------------------------------------------------------------------------

describe('filterItemsBySearch — no matching projects', () => {
    it('returns an empty array when nothing matches', () => {
        const result = filterItemsBySearch(ITEMS, 'blockchain')
        expect(result).toHaveLength(0)
    })

    it('returns an empty array for a very specific non-existent term', () => {
        expect(filterItemsBySearch(ITEMS, 'xyzzy_not_found')).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// Test 4 — Clear button resets the search (UI test, no provider mocking needed)
// ---------------------------------------------------------------------------

describe('PortfolioSearchBar — clear button', () => {
    it('calls onClear when the × button is clicked', () => {
        const onClear = vi.fn()
        render(
            <PortfolioSearchBar
                value="flutter"
                onChange={() => {}}
                onClear={onClear}
            />
        )
        const clearBtn = screen.getByRole('button', { name: /clear search/i })
        fireEvent.click(clearBtn)
        expect(onClear).toHaveBeenCalledTimes(1)
    })

    it('does not render the × button when value is empty', () => {
        render(
            <PortfolioSearchBar
                value=""
                onChange={() => {}}
                onClear={() => {}}
            />
        )
        expect(screen.queryByRole('button', { name: /clear search/i })).toBeNull()
    })

    it('renders the × button when value is non-empty', () => {
        render(
            <PortfolioSearchBar
                value="next.js"
                onChange={() => {}}
                onClear={() => {}}
            />
        )
        expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
    })

    it('has an accessible label on the search input', () => {
        render(
            <PortfolioSearchBar
                value=""
                onChange={() => {}}
                onClear={() => {}}
            />
        )
        // The <label> is visually hidden but accessible
        expect(screen.getByLabelText(/search projects by title/i)).toBeInTheDocument()
    })
})
