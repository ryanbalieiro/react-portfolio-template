import "./ArticlePortfolio.scss"
import React, {useEffect, useRef, useState} from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import Transitionable from "/src/components/capabilities/Transitionable.jsx"
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useConstants} from "/src/hooks/constants.js"
import AvatarView from "/src/components/generic/AvatarView.jsx"
import {Tag, Tags} from "/src/components/generic/Tags.jsx"
import ArticleItemPreviewMenu from "/src/components/articles/partials/ArticleItemPreviewMenu.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"
import {matchesSearch} from "/src/utils/portfolioSearch.js"

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)
    const [searchQuery, setSearchQuery]       = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const searchInputRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleClearSearch = () => {
        setSearchQuery('')
        setDebouncedQuery('')
        searchInputRef.current?.focus()
    }

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <PortfolioSearchBar query={searchQuery}
                                setQuery={setSearchQuery}
                                onClear={handleClearSearch}
                                inputRef={searchInputRef}/>
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}
                                   searchQuery={debouncedQuery}
                                   onClearSearch={handleClearSearch}/>
        </Article>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @param {String} searchQuery - debounced search query
 * @param {Function} onClearSearch - clears the search query
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, searchQuery, onClearSearch }) {
    const constants = useConstants()
    const language  = useLanguage()
    const viewport  = useViewport()

    const categoryItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const filteredItems = categoryItems.filter(item => matchesSearch(item, searchQuery))

    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)
    const itemsPerRow      = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length
        ? selectedItemCategoryId + '-' + searchQuery + '-' + language.getSelectedLanguage()?.id
        : searchQuery + '-' + language.getSelectedLanguage()?.id

    const isSearchActive = searchQuery.trim().length > 0
    const hasResults     = filteredItems.length > 0

    return (
        <>
            <div aria-live="polite" aria-atomic="true" className="visually-hidden">
                {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} found
            </div>

            {!hasResults && isSearchActive ? (
                <PortfolioEmptyState onReset={onClearSearch}/>
            ) : dataWrapper.categories?.length ? (
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
            ) : (
                <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper}
                                              key={key}/>
                    ))}
                </div>
            )}
        </>
    )
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

/**
 * @param {String} query - current raw input value (controlled)
 * @param {Function} setQuery - input onChange setter
 * @param {Function} onClear - clears query and restores focus to input
 * @param {Object} inputRef - ref forwarded to the <input> element
 */
function PortfolioSearchBar({ query, setQuery, onClear, inputRef }) {
    const language = useLanguage()
    const placeholder = language.getString('portfolio_search_placeholder') || 'Search by title, tag, or description...'
    const clearLabel  = language.getString('portfolio_search_clear')       || 'Clear search'

    return (
        <div className="portfolio-search-bar" role="search">
            <label htmlFor="portfolio-search-input" className="visually-hidden">
                {placeholder}
            </label>
            <div className="portfolio-search-bar-inner">
                <i className="portfolio-search-bar-icon fa-solid fa-magnifying-glass" aria-hidden="true"/>
                <input
                    id="portfolio-search-input"
                    ref={inputRef}
                    type="search"
                    className="portfolio-search-bar-input text-3"
                    placeholder={placeholder}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoComplete="off"
                />
                {query && (
                    <button
                        type="button"
                        className="portfolio-search-bar-clear"
                        aria-label={clearLabel}
                        onClick={onClear}>
                        <i className="fa-solid fa-xmark" aria-hidden="true"/>
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * @param {Function} onReset - callback to clear the search query
 */
function PortfolioEmptyState({ onReset }) {
    const language = useLanguage()
    const message    = language.getString('portfolio_search_no_results') || 'No projects match your search.'
    const resetLabel = language.getString('portfolio_search_reset')      || 'Reset search'

    return (
        <div className="portfolio-empty-state" role="status">
            <i className="portfolio-empty-state-icon fa-solid fa-magnifying-glass" aria-hidden="true"/>
            <p className="portfolio-empty-state-message text-2">{message}</p>
            <button
                type="button"
                className="portfolio-empty-state-reset text-3"
                onClick={onReset}>
                {resetLabel}
            </button>
        </div>
    )
}

export default ArticlePortfolio