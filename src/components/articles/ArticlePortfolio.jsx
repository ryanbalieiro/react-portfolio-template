import "./ArticlePortfolio.scss"
import React, {useEffect, useState} from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import Transitionable from "/src/components/capabilities/Transitionable.jsx"
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useConstants} from "/src/hooks/constants.js"
import AvatarView from "/src/components/generic/AvatarView.jsx"
import {Tag, Tags} from "/src/components/generic/Tags.jsx"
import ArticleItemPreviewMenu from "/src/components/articles/partials/ArticleItemPreviewMenu.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"

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

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
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

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @return {JSX.Element}
 * @constructor
 */
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

    if (filteredItems.length === 0 && searchQuery) {
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

    if(dataWrapper.categories?.length) {
        return (
            <Transitionable id={dataWrapper.uniqueId + searchQuery}
                            refreshFlag={refreshFlag + searchQuery}
                            delayBetweenItems={100}
                            animation={Transitionable.Animations.POP}
                            className={`article-portfolio-items ${itemsPerRowClass}`}
                            aria-live="polite"
                            aria-label={`${filteredItems.length} projects`}>
                {filteredItems.map((itemWrapper, key) => (
                    <ArticlePortfolioItem itemWrapper={itemWrapper}
                                          key={key}/>
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
                    <ArticlePortfolioItem itemWrapper={itemWrapper}
                                          key={key}/>
                ))}
            </div>
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