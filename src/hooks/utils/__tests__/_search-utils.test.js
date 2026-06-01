import { describe, it, expect } from 'vitest'
import { matchesSearch } from '../_search-utils.js'

describe('matchesSearch', () => {
    it('matches title case-insensitively and returns true for empty query', () => {
        const locales = { title: 'React Portfolio App', text: '', tags: [] }
        expect(matchesSearch(locales, 'react')).toBe(true)
        expect(matchesSearch(locales, 'PORTFOLIO')).toBe(true)
        expect(matchesSearch(locales, 'vue')).toBe(false)
        expect(matchesSearch(locales, '')).toBe(true)
        expect(matchesSearch(locales, '   ')).toBe(true)
    })

    it('matches any tag case-insensitively', () => {
        const locales = { title: 'My Project', text: '', tags: ['Node.js', 'PostgreSQL', 'Docker'] }
        expect(matchesSearch(locales, 'node')).toBe(true)
        expect(matchesSearch(locales, 'POST')).toBe(true)
        expect(matchesSearch(locales, 'angular')).toBe(false)
    })

    it('matches description text after stripping HTML tags', () => {
        const locales = {
            title: 'Project',
            text: 'Built with <b>TypeScript</b> and deployed via <a href="#">CI/CD</a>.',
            tags: [],
        }
        expect(matchesSearch(locales, 'typescript')).toBe(true)
        expect(matchesSearch(locales, 'ci/cd')).toBe(true)
        expect(matchesSearch(locales, 'python')).toBe(false)
    })
})
