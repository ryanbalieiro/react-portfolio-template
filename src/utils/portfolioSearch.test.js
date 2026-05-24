import { describe, it, expect } from 'vitest'
import { matchesSearch, stripHTML } from './portfolioSearch.js'

const item = ({ title = '', text = '', tags = [] } = {}) => ({
    locales: { title, text, tags }
})

describe('matchesSearch', () => {
    // Scenario 1: empty search → all items pass
    it('returns true for every item when the query is empty', () => {
        const items = [
            item({ title: 'Rails API Service', tags: ['rails'] }),
            item({ title: 'Java Data Service', text: 'backend' }),
        ]
        items.forEach(i => expect(matchesSearch(i, '')).toBe(true))
        items.forEach(i => expect(matchesSearch(i, '   ')).toBe(true))
    })

    // Scenario 2: matching query → only relevant items
    it('matches against title (case-insensitive)', () => {
        const rails = item({ title: 'Rails API Service' })
        const java  = item({ title: 'Java Data Service' })
        expect(matchesSearch(rails, 'rails')).toBe(true)
        expect(matchesSearch(rails, 'RAILS')).toBe(true)
        expect(matchesSearch(java,  'rails')).toBe(false)
    })

    it('matches against tags', () => {
        const tagged = item({ title: 'Admin Dashboard', tags: ['react', 'typescript'] })
        expect(matchesSearch(tagged, 'react')).toBe(true)
        expect(matchesSearch(tagged, 'TYPESCRIPT')).toBe(true)
        expect(matchesSearch(tagged, 'vue')).toBe(false)
    })

    it('matches against description text', () => {
        const withText = item({ text: 'Built with Next.js and Tailwind CSS' })
        expect(matchesSearch(withText, 'next.js')).toBe(true)
        expect(matchesSearch(withText, 'angular')).toBe(false)
    })

    // Scenario 3: no match → empty state (zero results)
    it('returns false for every item when nothing matches', () => {
        const items = [
            item({ title: 'Rails API', tags: ['rails'], text: 'Backend service' }),
            item({ title: 'Next.js App', tags: ['react'], text: 'Frontend' }),
        ]
        const results = items.filter(i => matchesSearch(i, 'zzzzzz'))
        expect(results).toHaveLength(0)
    })

    it('strips HTML tags before matching', () => {
        const withHtml = item({ title: '<strong>Rails</strong>', text: '<p>Backend</p>' })
        expect(matchesSearch(withHtml, 'rails')).toBe(true)
        expect(matchesSearch(withHtml, '<strong>')).toBe(false)
    })
})

describe('stripHTML', () => {
    it('removes HTML tags', () => {
        expect(stripHTML('<strong>hello</strong>')).toBe('hello')
        expect(stripHTML('<p class="x">text</p>')).toBe('text')
    })

    it('replaces &nbsp; with a space', () => {
        expect(stripHTML('hello&nbsp;world')).toBe('hello world')
    })

    it('handles null and undefined gracefully', () => {
        expect(stripHTML(null)).toBe('')
        expect(stripHTML(undefined)).toBe('')
    })
})
