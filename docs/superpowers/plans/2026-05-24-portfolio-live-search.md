# Portfolio Live Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a debounced live search bar to the Portfolio section that filters projects by title, tags, and description, with a clear button, empty state, accessibility support, and at least 3 passing unit tests.

**Architecture:** Extract the filter logic as a pure exported function in `ArticlePortfolio.jsx` so it can be unit-tested without React providers. Add a `PortfolioSearchBar` inner component that accepts `searchQuery`/`setSearchQuery` props and renders between the existing category buttons and the project grid. Debounce via `useEffect` + `setTimeout`.

**Tech Stack:** React 18, Vite 6, Vitest, SCSS (Bootstrap 5 variables available)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `vite.config.js` | Add Vitest test environment config |
| Modify | `package.json` | Add `"test"` script |
| Modify | `src/components/articles/ArticlePortfolio.jsx` | Add `filterPortfolioItems` export, `PortfolioSearchBar` component, wire search state |
| Modify | `src/components/articles/ArticlePortfolio.scss` | Style the search bar |
| Create | `src/components/articles/ArticlePortfolio.test.js` | Unit tests for `filterPortfolioItems` |

---

## Task 1: Install Vitest and configure test environment

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install Vitest and jsdom**

```bash
cd "/Users/tungnn/Documents/claude learning/react-portfolio-template"
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Expected output: packages added, no errors.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` inside `"scripts"`:

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "resume:make:article": "node npm/npm-resume-new-article.js",
    "resume:clear": "node npm/npm-resume-clear.js"
}
```

- [ ] **Step 3: Add Vitest config block to vite.config.js**

Add a `test` key to the `defineConfig` object:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/react-portfolio-template/',
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('swiper'))
                            return 'swiper';
                        return;
                    }
                }
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ["mixed-decls", "color-functions", "global-builtin", "import"],
            },
        },
    },
})
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

```bash
cd "/Users/tungnn/Documents/claude learning/react-portfolio-template"
npm test
```

Expected: `No test files found` or exits 0. If exit code 1 with "no tests", that's fine — we add tests next.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.js package-lock.json
git commit -m "chore: add Vitest test runner with jsdom environment"
```

---

## Task 2: Extract pure filter function and write unit tests (TDD)

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx` (add named export at top)
- Create: `src/components/articles/ArticlePortfolio.test.js`

- [ ] **Step 1: Write the failing tests first**

Create `src/components/articles/ArticlePortfolio.test.js`:

```js
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
        // matches title
        const byTitle = filterPortfolioItems(mockItems, 'React')
        expect(byTitle).toHaveLength(1)
        expect(byTitle[0].locales.title).toBe('React Dashboard')

        // matches tag
        const byTag = filterPortfolioItems(mockItems, 'express')
        expect(byTag).toHaveLength(1)
        expect(byTag[0].locales.title).toBe('Node API Server')

        // matches description
        const byDesc = filterPortfolioItems(mockItems, 'batch processing')
        expect(byDesc).toHaveLength(1)
        expect(byDesc[0].locales.title).toBe('Python Data Pipeline')
    })

    it('returns empty array when nothing matches', () => {
        const result = filterPortfolioItems(mockItems, 'zzznomatch999')
        expect(result).toHaveLength(0)
    })

    it('clicking clear (empty query) restores the full list', () => {
        const filtered = filterPortfolioItems(mockItems, 'node')
        expect(filtered).toHaveLength(1)

        const restored = filterPortfolioItems(mockItems, '')
        expect(restored).toHaveLength(3)
    })
})
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
cd "/Users/tungnn/Documents/claude learning/react-portfolio-template"
npm test
```

Expected: FAIL — `filterPortfolioItems is not exported` or similar.

- [ ] **Step 3: Add the pure function export to ArticlePortfolio.jsx**

At the top of `src/components/articles/ArticlePortfolio.jsx`, after the imports, add:

```js
/**
 * Pure function — safe to unit test without React providers.
 * Matches query against item title, tags, and description (case-insensitive).
 * @param {ArticleItemDataWrapper[]} items
 * @param {string} query
 * @returns {ArticleItemDataWrapper[]}
 */
export function filterPortfolioItems(items, query) {
    if (!query || !query.trim()) return items
    const q = query.trim().toLowerCase()
    return items.filter(item => {
        const title = (item.locales?.title || '').toLowerCase()
        const description = (item.locales?.text || '').toLowerCase()
        const tags = (item.locales?.tags || []).map(t => t.toLowerCase())
        return title.includes(q) || description.includes(q) || tags.some(t => t.includes(q))
    })
}
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
npm test
```

Expected: 4 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/components/articles/ArticlePortfolio.jsx src/components/articles/ArticlePortfolio.test.js
git commit -m "feat: add filterPortfolioItems pure function with unit tests"
```

---

## Task 3: Add PortfolioSearchBar UI component

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx` (add `PortfolioSearchBar` inner component)
- Modify: `src/components/articles/ArticlePortfolio.scss` (add search bar styles)

- [ ] **Step 1: Add PortfolioSearchBar component inside ArticlePortfolio.jsx**

Add this component after the `filterPortfolioItems` function and before the `ArticlePortfolio` function:

```jsx
/**
 * @param {string} searchQuery
 * @param {Function} setSearchQuery
 * @param {Function} onClear
 */
function PortfolioSearchBar({ searchQuery, setSearchQuery, onClear }) {
    return (
        <div className="portfolio-search-bar" role="search">
            <label htmlFor="portfolio-search-input" className="visually-hidden">
                Search projects
            </label>
            <div className="portfolio-search-bar-inner">
                <i className="fa-solid fa-magnifying-glass portfolio-search-icon" aria-hidden="true"/>
                <input
                    id="portfolio-search-input"
                    type="search"
                    className="portfolio-search-input"
                    placeholder="Search by title, tag, or description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Search projects by title, tag, or description"
                    autoComplete="off"
                />
                {searchQuery && (
                    <button
                        className="portfolio-search-clear"
                        onClick={onClear}
                        aria-label="Clear search"
                        type="button"
                    >
                        <i className="fa-solid fa-xmark" aria-hidden="true"/>
                    </button>
                )}
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Add SCSS for the search bar in ArticlePortfolio.scss**

Append to the end of `src/components/articles/ArticlePortfolio.scss`:

```scss
/** ---------- SEARCH BAR -------------------- */
div.portfolio-search-bar {
    margin-bottom: 16px;

    @include media-breakpoint-down(sm) {
        width: 100%;
    }
}

div.portfolio-search-bar-inner {
    position: relative;
    display: flex;
    align-items: center;
    background-color: var(--theme-boards-background);
    border: 1px solid var(--theme-texts-light-2);
    border-radius: $standard-border-radius;
    padding: 8px 12px;
    gap: 8px;
    width: 100%;

    &:focus-within {
        border-color: var(--theme-primary);
    }
}

i.portfolio-search-icon {
    color: var(--theme-texts-light-2);
    font-size: 0.85rem;
    flex-shrink: 0;
}

input.portfolio-search-input {
    background: transparent;
    border: none;
    outline: none;
    flex: 1;
    font-size: 0.9rem;
    color: var(--theme-texts-light-1);
    min-width: 0;

    &::placeholder {
        color: var(--theme-texts-light-2);
    }

    &::-webkit-search-cancel-button {
        display: none;
    }
}

button.portfolio-search-clear {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--theme-texts-light-2);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    flex-shrink: 0;

    &:hover {
        color: var(--theme-primary);
    }
}
```

- [ ] **Step 3: Commit styles**

```bash
git add src/components/articles/ArticlePortfolio.jsx src/components/articles/ArticlePortfolio.scss
git commit -m "feat: add PortfolioSearchBar component with accessible markup and styles"
```

---

## Task 4: Wire search state into ArticlePortfolio with debounce

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx`

- [ ] **Step 1: Update ArticlePortfolio to hold search state and pass it down**

Replace the `ArticlePortfolio` function with:

```jsx
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleClear = () => {
        setSearchQuery('')
        document.getElementById('portfolio-search-input')?.focus()
    }

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <PortfolioSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onClear={handleClear}
            />
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}
                                   searchQuery={debouncedQuery}/>
        </Article>
    )
}
```

- [ ] **Step 2: Update ArticlePortfolioItems to accept and apply searchQuery**

Replace the `ArticlePortfolioItems` function with:

```jsx
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, searchQuery }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const categoryItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const filteredItems = filterPortfolioItems(categoryItems, searchQuery)
    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)

    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length ?
        selectedItemCategoryId + "-" + language.getSelectedLanguage()?.id :
        language.getSelectedLanguage()?.id

    if (filteredItems.length === 0) {
        return (
            <div className="portfolio-empty-state" role="status" aria-live="polite">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"/>
                <p>No projects match <strong>"{searchQuery}"</strong></p>
                <button
                    className="portfolio-empty-state-reset"
                    onClick={() => document.getElementById('portfolio-search-input')?.focus()}
                    type="button"
                >
                    Try a different search
                </button>
            </div>
        )
    }

    if (dataWrapper.categories?.length) {
        return (
            <Transitionable id={dataWrapper.uniqueId + searchQuery}
                            refreshFlag={refreshFlag + searchQuery}
                            delayBetweenItems={100}
                            animation={Transitionable.Animations.POP}
                            className={`article-portfolio-items ${itemsPerRowClass}`}
                            aria-live="polite"
                            aria-label={`${filteredItems.length} projects`}>
                {filteredItems.map((itemWrapper, key) => (
                    <ArticlePortfolioItem itemWrapper={itemWrapper} key={key}/>
                ))}
            </Transitionable>
        )
    }
    else {
        return (
            <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}
                 aria-live="polite"
                 aria-label={`${filteredItems.length} projects`}>
                {filteredItems.map((itemWrapper, key) => (
                    <ArticlePortfolioItem itemWrapper={itemWrapper} key={key}/>
                ))}
            </div>
        )
    }
}
```

- [ ] **Step 3: Add empty state styles to ArticlePortfolio.scss**

Append to the end of `src/components/articles/ArticlePortfolio.scss`:

```scss
/** ---------- EMPTY STATE ------------------- */
div.portfolio-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
    color: var(--theme-texts-light-2);

    i {
        font-size: 2rem;
        opacity: 0.5;
    }

    p {
        margin: 0;
        font-size: 0.95rem;
    }
}

button.portfolio-empty-state-reset {
    background: none;
    border: 1px solid var(--theme-texts-light-2);
    border-radius: $standard-border-radius;
    padding: 6px 16px;
    font-size: 0.85rem;
    color: var(--theme-texts-light-1);
    cursor: pointer;

    &:hover {
        border-color: var(--theme-primary);
        color: var(--theme-primary);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/articles/ArticlePortfolio.jsx src/components/articles/ArticlePortfolio.scss
git commit -m "feat: wire live search with 300ms debounce, clear button, and empty state"
```

---

## Task 5: Final verification

- [ ] **Step 1: Run unit tests**

```bash
cd "/Users/tungnn/Documents/claude learning/react-portfolio-template"
npm test
```

Expected: 4 tests pass, 0 fail, exit code 0.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: build completes with no errors (warnings about chunk size are ok).

- [ ] **Step 4: Manual smoke test on dev server**

```bash
npm run dev
```

Open browser → navigate to Portfolio section → verify:
- Search bar appears between category buttons and project grid
- Typing filters cards in real time (with debounce)
- X button clears input and restores all cards
- Empty state shows friendly message when nothing matches
- Mobile layout: search bar is full-width

- [ ] **Step 5: Final commit if any fixes needed, then push**

```bash
git push origin week2-claude-code-exercise/portfolio-search
```
