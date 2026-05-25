import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PortfolioSearchBar from '../PortfolioSearchBar.jsx'

// SCSS is no-op'd by vitest config (css: false). FontAwesome icon classes
// don't render text, so we query by role/aria-label instead.

function Harness({ initialValue = "", onClearSpy } = {}) {
    const [value, setValue] = useState(initialValue)
    return (
        <PortfolioSearchBar
            value={value}
            onChange={setValue}
            onClear={() => {
                setValue("")
                onClearSpy?.()
            }}
            placeholder="Search by title, tag, or description..."
            label="Search portfolio projects"
            clearLabel="Clear search"
        />
    )
}

describe('PortfolioSearchBar', () => {
    it('clicking the clear button empties the input and re-focuses it', async () => {
        const user = userEvent.setup()
        const onClearSpy = vi.fn()
        render(<Harness initialValue="kotlin" onClearSpy={onClearSpy}/>)

        const input = screen.getByRole('searchbox', { name: /search portfolio projects/i })
        expect(input).toHaveValue("kotlin")

        const clearButton = screen.getByRole('button', { name: /clear search/i })
        await user.click(clearButton)

        expect(onClearSpy).toHaveBeenCalledTimes(1)
        expect(input).toHaveValue("")
        expect(input).toHaveFocus()
    })

    it('does not render the clear button when the input is empty', () => {
        render(<Harness initialValue=""/>)
        expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    })

    it('typing into the input updates the value', async () => {
        const user = userEvent.setup()
        render(<Harness/>)

        const input = screen.getByRole('searchbox', { name: /search portfolio projects/i })
        await user.type(input, "rails")
        expect(input).toHaveValue("rails")
    })
})
