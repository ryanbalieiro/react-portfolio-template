import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

/**
 * Mirror of the inline filter logic in ArticlePortfolioItems (ArticlePortfolio.jsx).
 * If the filter logic in the component changes, update this function to match.
 *
 *   const filteredItems = searchQuery
 *     ? categoryFiltered.filter(item => {
 *         const q = searchQuery.toLowerCase()
 *         return (item.locales?.title || "").toLowerCase().includes(q)
 *             || (item.locales?.text  || "").toLowerCase().includes(q)
 *             || (item.locales?.tags  || []).join(" ").toLowerCase().includes(q)
 *       })
 *     : categoryFiltered
 */
function filterByQuery(items, query) {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(item =>
        (item.locales?.title || '').toLowerCase().includes(q) ||
        (item.locales?.text  || '').toLowerCase().includes(q) ||
        (item.locales?.tags  || []).join(' ').toLowerCase().includes(q)
    )
}

/**
 * Minimal test harness: search input → filterByQuery → render titles or empty state.
 * Mirrors the SearchBar + ArticlePortfolioItems rendering contract without
 * requiring all real providers to be mounted.
 */
function SearchablePortfolio({ items }) {
    const [query, setQuery] = React.useState('')
    const results = filterByQuery(items, query)

    return (
        <div>
            <input
                type="search"
                aria-label="Search projects"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            {results.length === 0 && query ? (
                <p role="status">
                    Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
                </p>
            ) : (
                results.map(item => (
                    <div key={item.locales.title} data-testid="project-card">
                        {item.locales.title}
                    </div>
                ))
            )}
        </div>
    )
}

// Sample data matches the real portfolio.json items
const ITEMS = [
    {
        locales: {
            title: 'ChatGPT',
            text: 'AI chatbot developed by OpenAI.',
            tags: ['AI', 'LLM', 'OpenAI'],
        },
    },
    {
        locales: {
            title: 'Docker',
            text: 'Containerization platform for developers.',
            tags: ['DevOps', 'Containers', 'Cloud'],
        },
    },
    {
        locales: {
            title: 'GitHub',
            text: 'Code hosting and version control platform.',
            tags: ['Git', 'CI/CD', 'Open Source'],
        },
    },
]

describe('Portfolio search logic', () => {
    it('Test 1: ô tìm kiếm trống → hiện tất cả project của category đang chọn', () => {
        render(<SearchablePortfolio items={ITEMS} />)

        expect(screen.getByText('ChatGPT')).toBeInTheDocument()
        expect(screen.getByText('Docker')).toBeInTheDocument()
        expect(screen.getByText('GitHub')).toBeInTheDocument()
        expect(screen.getAllByTestId('project-card')).toHaveLength(3)
    })

    it('Test 2: gõ chữ khớp title / tag / description → chỉ hiện project khớp', () => {
        render(<SearchablePortfolio items={ITEMS} />)
        const input = screen.getByRole('searchbox')

        // khớp title (case-insensitive)
        fireEvent.change(input, { target: { value: 'docker' } })
        expect(screen.getByText('Docker')).toBeInTheDocument()
        expect(screen.queryByText('ChatGPT')).not.toBeInTheDocument()
        expect(screen.queryByText('GitHub')).not.toBeInTheDocument()

        // khớp tag
        fireEvent.change(input, { target: { value: 'LLM' } })
        expect(screen.getByText('ChatGPT')).toBeInTheDocument()
        expect(screen.queryByText('Docker')).not.toBeInTheDocument()
        expect(screen.queryByText('GitHub')).not.toBeInTheDocument()

        // khớp description
        fireEvent.change(input, { target: { value: 'version control' } })
        expect(screen.getByText('GitHub')).toBeInTheDocument()
        expect(screen.queryByText('ChatGPT')).not.toBeInTheDocument()
        expect(screen.queryByText('Docker')).not.toBeInTheDocument()
    })

    it('Test 3: gõ chữ không khớp gì → hiện empty state, 0 project', () => {
        render(<SearchablePortfolio items={ITEMS} />)
        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'python' } })

        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(screen.queryAllByTestId('project-card')).toHaveLength(0)
    })
})
