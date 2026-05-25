import { describe, it, expect } from 'vitest'
import { matchesSearchQuery } from '../portfolioSearch.js'

const makeItem = ({ title = "", tags = [], text = "" } = {}) => ({
    locales: { title, tags, text },
})

describe('matchesSearchQuery', () => {
    it('returns true for an empty query so every item passes the filter', () => {
        const item = makeItem({ title: "TCV", tags: ["Ruby on Rails"], text: "marketplace" })
        expect(matchesSearchQuery(item, "")).toBe(true)
        expect(matchesSearchQuery(item, "   ")).toBe(true)
    })

    it('matches the title case-insensitively', () => {
        const item = makeItem({ title: "Chukosya EX", tags: [], text: "" })
        expect(matchesSearchQuery(item, "CHUKOSYA")).toBe(true)
        expect(matchesSearchQuery(item, "chukos")).toBe(true)
    })

    it('matches a tag case-insensitively', () => {
        const item = makeItem({ title: "TCV", tags: ["Ruby on Rails", "GCP"], text: "" })
        expect(matchesSearchQuery(item, "rails")).toBe(true)
        expect(matchesSearchQuery(item, "gcp")).toBe(true)
    })

    it('matches description text and strips HTML tags before matching', () => {
        const item = makeItem({
            title: "X",
            tags: [],
            text: "<b>marketplace</b> tool with <i>real-time</i> tracking",
        })
        expect(matchesSearchQuery(item, "marketplace")).toBe(true)
        // The HTML tag <b> itself must not be considered part of the searchable text.
        expect(matchesSearchQuery(item, "<b>")).toBe(false)
    })

    it('returns false when nothing matches', () => {
        const item = makeItem({ title: "TCV", tags: ["Ruby on Rails"], text: "marketplace" })
        expect(matchesSearchQuery(item, "kotlin")).toBe(false)
    })

    it('handles malformed items without throwing', () => {
        expect(matchesSearchQuery({}, "anything")).toBe(false)
        expect(matchesSearchQuery({ locales: {} }, "anything")).toBe(false)
        expect(matchesSearchQuery({ locales: { tags: null } }, "anything")).toBe(false)
    })
})
