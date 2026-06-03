# Portfolio Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time search bar to the Portfolio section that filters project cards by title, tags, and description, working in parallel with the existing category filter.

**Architecture:** A `searchQuery` state lives in `ArticlePortfolio` and is passed down to `ArticlePortfolioItems`. A new `getOrderedItemsFilteredByQuery(categoryId, query)` method on `ArticleDataWrapper` handles combined category+search filtering. A new `ArticlePortfolioSearch` component renders a styled search input with a clear button. When both a category filter and a search query are active, both filters apply together.

**Tech Stack:** React 18, SCSS (Bootstrap breakpoints via `@import "/src/styles/extend.scss"`), FontAwesome icons.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/hooks/models/ArticleDataWrapper.js` | Add `getOrderedItemsFilteredByQuery(categoryId, query)` |
| Create | `src/components/articles/partials/ArticlePortfolioSearch.jsx` | Search input with icon + clear button |
| Create | `src/components/articles/partials/ArticlePortfolioSearch.scss` | Search bar styles |
| Modify | `src/components/articles/ArticlePortfolio.jsx` | Add `searchQuery` state, render search bar, pass query to items, show empty state |
| Modify | `src/components/articles/ArticlePortfolio.scss` | Layout styles for search bar placement |

---

## Task 1: Add `getOrderedItemsFilteredByQuery` to `ArticleDataWrapper`

**Files:**
- Modify: `src/hooks/models/ArticleDataWrapper.js`

The existing `getOrderedItemsFilteredBy(categoryId)` only filters by category. We need a method that chains category filtering with text matching across title, tags, and description. The `utils.string.stripHTMLTags` helper (already imported via `useUtils()`) strips `<b>` and other tags from the stored HTML strings before comparing.

- [ ] **Step 1: Add the method after `getOrderedItemsFilteredBy` in `ArticleDataWrapper.js`**

Open `src/hooks/models/ArticleDataWrapper.js`. After the closing brace of `getOrderedItemsFilteredBy`, add:

```js
getOrderedItemsFilteredByQuery(categoryId, query) {
    const base = this.getOrderedItemsFilteredBy(categoryId)
    if (!query || !query.trim()) return base

    const q = query.trim().toLowerCase()
    return base.filter(item => {
        const title = utils.string.stripHTMLTags(item.locales.title || "").toLowerCase()
        const text = utils.string.stripHTMLTags(item.locales.text || "").toLowerCase()
        const tags = (item.locales.tags || []).map(t => t.toLowerCase())
        return title.includes(q) || text.includes(q) || tags.some(tag => tag.includes(q))
    })
}
```

- [ ] **Step 2: Verify the dev server still compiles**

The dev server is already running at `http://localhost:5173/react-portfolio-template/`. Check the terminal — there must be no red compilation errors. If there are, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/models/ArticleDataWrapper.js
git commit -m "feat: add getOrderedItemsFilteredByQuery to ArticleDataWrapper"
```

---

## Task 2: Create the `ArticlePortfolioSearch` component

**Files:**
- Create: `src/components/articles/partials/ArticlePortfolioSearch.jsx`
- Create: `src/components/articles/partials/ArticlePortfolioSearch.scss`

This is a controlled search input. It has a magnifying-glass icon on the left and a clear (×) button on the right that appears when the input has text. We build it directly (not via the form `Input` wrapper) to avoid the form-field chrome that doesn't suit an inline search bar.

- [ ] **Step 1: Create the JSX file**

Create `src/components/articles/partials/ArticlePortfolioSearch.jsx` with this exact content:

```jsx
import "./ArticlePortfolioSearch.scss"
import React from 'react'

function ArticlePortfolioSearch({ query, setQuery, placeholder = "Search..." }) {
    return (
        <div className={`article-portfolio-search`}>
            <i className={`article-portfolio-search-icon fa-solid fa-magnifying-glass`}/>
            <input
                className={`article-portfolio-search-input text-3`}
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    className={`article-portfolio-search-clear`}
                    type="button"
                    onMouseDown={() => setQuery("")}
                    onTouchStart={() => setQuery("")}>
                    <i className={`fa-solid fa-xmark`}/>
                </button>
            )}
        </div>
    )
}

export default ArticlePortfolioSearch
```

- [ ] **Step 2: Create the SCSS file**

Create `src/components/articles/partials/ArticlePortfolioSearch.scss` with this exact content:

```scss
@import "/src/styles/extend.scss";

div.article-portfolio-search {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 900px;
    margin: 0 auto 18px;

    background-color: var(--theme-boards-background);
    border: 2px solid var(--theme-card-background);
    border-radius: $standard-border-radius;
    padding: 6px 12px;

    @include media-breakpoint-down(md) {
        border-width: 1px;
        margin-bottom: 14px;
    }
}

i.article-portfolio-search-icon {
    color: var(--theme-texts-light-2);
    font-size: 13px;
    flex-shrink: 0;
    margin-right: 10px;
    pointer-events: none;
}

input.article-portfolio-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--theme-texts-light-1);

    &::placeholder {
        color: var(--theme-texts-light-2);
    }
}

button.article-portfolio-search-clear {
    background: transparent;
    border: none;
    outline: none;
    padding: 0 0 0 8px;
    cursor: pointer;
    color: var(--theme-texts-light-2);
    font-size: 13px;
    flex-shrink: 0;
    line-height: 1;

    &:hover {
        color: var(--theme-texts-light-1);
    }
}
```

- [ ] **Step 3: Verify the dev server still compiles**

Check the terminal — no red errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/articles/partials/ArticlePortfolioSearch.jsx src/components/articles/partials/ArticlePortfolioSearch.scss
git commit -m "feat: add ArticlePortfolioSearch component"
```

---

## Task 3: Wire search into `ArticlePortfolio` and show empty state

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx`
- Modify: `src/components/articles/ArticlePortfolio.scss`

This task:
1. Adds `searchQuery` state to `ArticlePortfolio`
2. Passes it to `ArticlePortfolioItems`
3. Uses `getOrderedItemsFilteredByQuery` instead of `getOrderedItemsFilteredBy` in `ArticlePortfolioItems`
4. Renders `ArticlePortfolioSearch` above the grid
5. Updates `refreshFlag` so the pop animation fires on search changes
6. Shows an empty-state message when no items match

- [ ] **Step 1: Update `ArticlePortfolio.jsx`**

Replace the entire content of `src/components/articles/ArticlePortfolio.jsx` with:

```jsx
import "./ArticlePortfolio.scss"
import React, {useEffect, useState} from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import Transitionable from "/src/components/capabilities/Transitionable.jsx"
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useConstants} from "/src/hooks/constants.js"
import AvatarView from "/src/components/generic/AvatarView.jsx"
import {Tag, Tags} from "/src/components/generic/Tags.jsx"
import ArticleItemPreviewMenu from "/src/components/articles/partials/ArticleItemPreviewMenu.jsx"
import ArticlePortfolioSearch from "/src/components/articles/partials/ArticlePortfolioSearch.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}
                                   searchQuery={searchQuery}
                                   setSearchQuery={setSearchQuery}/>
        </Article>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @param {String} searchQuery
 * @param {Function} setSearchQuery
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, searchQuery, setSearchQuery }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const filteredItems = dataWrapper.getOrderedItemsFilteredByQuery(selectedItemCategoryId, searchQuery)
    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)

    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length ?
        selectedItemCategoryId + "-" + searchQuery + "-" + language.getSelectedLanguage()?.id :
        searchQuery + "-" + language.getSelectedLanguage()?.id

    const searchBar = (
        <ArticlePortfolioSearch query={searchQuery}
                                setQuery={setSearchQuery}
                                placeholder={`Search projects...`}/>
    )

    if (filteredItems.length === 0) {
        return (
            <>
                {searchBar}
                <div className={`article-portfolio-empty text-2`}>
                    <i className={`fa-solid fa-magnifying-glass article-portfolio-empty-icon`}/>
                    <span>{`No results for "${searchQuery}"`}</span>
                </div>
            </>
        )
    }

    if(dataWrapper.categories?.length) {
        return (
            <>
                {searchBar}
                <Transitionable id={dataWrapper.uniqueId}
                                refreshFlag={refreshFlag}
                                delayBetweenItems={100}
                                animation={Transitionable.Animations.POP}
                                className={`article-portfolio-items ${itemsPerRowClass}`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper}
                                              key={key}/>
                    ))}
                </Transitionable>
            </>
        )
    }
    else {
        return (
            <>
                {searchBar}
                <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper}
                                              key={key}/>
                    ))}
                </div>
            </>
        )
    }
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItem({ itemWrapper }) {
    return (
        <div className={`article-portfolio-item`}>
            <AvatarView src={itemWrapper.img}
                        faIcon={itemWrapper.faIcon}
                        style={itemWrapper.faIconStyle}
                        alt={itemWrapper.imageAlt}
                        className={`article-portfolio-item-avatar`}/>

            <ArticlePortfolioItemTitle itemWrapper={itemWrapper}/>
            <ArticlePortfolioItemBody itemWrapper={itemWrapper}/>
            <ArticlePortfolioItemFooter itemWrapper={itemWrapper}/>
        </div>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItemTitle({ itemWrapper }) {
    return (
        <div className={`article-portfolio-item-title`}>
            <h5 className={`article-portfolio-item-title-main`}
                dangerouslySetInnerHTML={{__html: itemWrapper.locales.title || itemWrapper.placeholder}}/>

            <div className={`article-portfolio-item-title-category text-2`}
                 dangerouslySetInnerHTML={{__html: itemWrapper.category?.label }}/>
        </div>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItemBody({ itemWrapper }) {
    return (
        <div className={`article-portfolio-item-body`}>
            <Tags className={`article-portfolio-item-body-tags`}>
                {itemWrapper.locales.tags && Boolean(itemWrapper.locales.tags.length) && itemWrapper.locales.tags.map((tag, key) => (
                    <Tag key={key}
                         text={tag}
                         variant={Tag.Variants.DARK}
                         className={`article-portfolio-item-body-tag text-1`}/>
                ))}
            </Tags>

            <div className={`article-portfolio-item-body-description text-2`}
                 dangerouslySetInnerHTML={{__html: itemWrapper.locales.text}}/>
        </div>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItemFooter({ itemWrapper }) {
    const hasPreview = itemWrapper.preview
    const hasPreviewLinks = itemWrapper.preview?.hasLinks
    const hasScreenshotsOrVideo = itemWrapper.preview?.hasScreenshotsOrYoutubeVideo

    const previewMenuAvailable = hasPreview && (hasPreviewLinks || hasScreenshotsOrVideo)
    if(!previewMenuAvailable)
        return <></>

    return (
        <div className={`article-portfolio-item-footer`}>
            <ArticleItemPreviewMenu itemWrapper={itemWrapper}
                                    spaceBetween={true}
                                    className={`article-portfolio-item-footer-menu`}/>
        </div>
    )
}

export default ArticlePortfolio
```

- [ ] **Step 2: Add empty-state styles to `ArticlePortfolio.scss`**

Append these lines to the end of `src/components/articles/ArticlePortfolio.scss`:

```scss
div.article-portfolio-empty {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--theme-texts-light-2);
    padding: 10px 4px;
}

i.article-portfolio-empty-icon {
    font-size: 14px;
}
```

- [ ] **Step 3: Verify in the browser**

Open `http://localhost:5173/react-portfolio-template/` and navigate to the Portfolio section. Verify:
1. A search bar appears above the project grid.
2. Typing `"python"` filters to only projects whose title, tags, or description contain "python" (case-insensitive). With the current data: Helmet Detection, Garbage Classification, AI Multimodal Chatbot, and Image Retrieval should all appear.
3. Typing `"chatbot"` returns only the Chatbot for Recruitment Website and AI Multimodal Chatbot System.
4. Typing `"zzzzzzz"` shows the "No results for..." empty state.
5. Clicking the × button clears the search and restores all items.
6. Switching the category filter (All / Apps / Web) while a search query is active still applies both filters together: selecting "Web" while searching `"three"` should return only Car Showroom 3D.
7. The pop animation fires when the search results change.

- [ ] **Step 4: Commit**

```bash
git add src/components/articles/ArticlePortfolio.jsx src/components/articles/ArticlePortfolio.scss
git commit -m "feat: wire search state into ArticlePortfolio with empty state"
```

---

## Self-Review

**Spec coverage:**
- Search input rendered above grid ✓ (Task 3, `ArticlePortfolioSearch` inside `ArticlePortfolioItems`)
- Filters by title ✓ (`getOrderedItemsFilteredByQuery` strips HTML, lowercases, checks `includes`)
- Filters by tags ✓ (same method, `tags.some(tag => tag.includes(q))`)
- Filters by description ✓ (same method, `text.includes(q)`)
- Works alongside category filter ✓ (query method chains onto `getOrderedItemsFilteredBy`)
- Clear button ✓ (Task 2, appears when `query` is truthy)
- Empty state ✓ (Task 3, renders when `filteredItems.length === 0`)
- Animation refreshes on search changes ✓ (`refreshFlag` includes `searchQuery`)

**Placeholder scan:** No TBD, TODO, or placeholder text in any step.

**Type consistency:**
- `getOrderedItemsFilteredByQuery(categoryId, query)` — defined in Task 1, called in Task 3 with `(selectedItemCategoryId, searchQuery)` ✓
- `ArticlePortfolioSearch` props: `query`, `setQuery`, `placeholder` — defined in Task 2, consumed in Task 3 ✓
- `searchQuery` / `setSearchQuery` passed from `ArticlePortfolio` → `ArticlePortfolioItems` ✓
