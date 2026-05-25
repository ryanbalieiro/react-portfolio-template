import React from 'react'

/**
 * Presentational search bar for the Portfolio section.
 * Intentionally has no provider dependencies so it is easy to unit-test.
 *
 * @param {string}   value       - current input value
 * @param {Function} onChange    - called with the input change event
 * @param {Function} onClear     - called when the × button is clicked
 * @param {Object}   inputRef    - forwarded ref to the <input> element
 * @param {string}   [resultCount] - optional live-region text announced to screen readers
 */
function PortfolioSearchBar({ value, onChange, onClear, inputRef, resultCount = '' }) {
    return (
        <div className="portfolio-search-wrapper" role="search">
            {/* Visually hidden label satisfies WCAG SC 1.3.1 */}
            <label htmlFor="portfolio-search" className="visually-hidden">
                Search projects by title, tag, or description
            </label>

            <div className="portfolio-search-input-row">
                <i className="fa-solid fa-magnifying-glass portfolio-search-icon" aria-hidden="true" />
                <input
                    ref={inputRef}
                    id="portfolio-search"
                    type="search"
                    className="portfolio-search-input"
                    placeholder="Search by title, tag, or description..."
                    value={value}
                    onChange={onChange}
                    autoComplete="off"
                    spellCheck={false}
                />
                {value && (
                    <button
                        type="button"
                        className="portfolio-search-clear"
                        onClick={onClear}
                        aria-label="Clear search"
                    >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Polite live region — announces result count after debounce */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="visually-hidden"
            >
                {resultCount}
            </div>
        </div>
    )
}

export default PortfolioSearchBar
