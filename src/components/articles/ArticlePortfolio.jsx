import "./ArticlePortfolio.scss"
import React, {useCallback, useEffect, useRef, useState} from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import Transitionable from "/src/components/capabilities/Transitionable.jsx"
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useConstants} from "/src/hooks/constants.js"
import AvatarView from "/src/components/generic/AvatarView.jsx"
import {Tag, Tags} from "/src/components/generic/Tags.jsx"
import ArticleItemPreviewMenu from "/src/components/articles/partials/ArticleItemPreviewMenu.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"
import PortfolioSearchBar from "/src/components/articles/PortfolioSearchBar.jsx"
import {filterItemsBySearch} from "/src/utils/portfolioSearch.js"

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}/>
        </Article>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const searchInputRef = useRef(null)

    // Reset search whenever the active category changes
    useEffect(() => {
        setSearchQuery('')
        setDebouncedQuery('')
    }, [selectedItemCategoryId])

    // Debounce: commit query to state 300 ms after the user stops typing
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleClear = useCallback(() => {
        setSearchQuery('')
        searchInputRef.current?.focus()
    }, [])

    const categoryItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const displayItems  = filterItemsBySearch(categoryItems, debouncedQuery)

    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)
    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length
        ? selectedItemCategoryId + '-' + language.getSelectedLanguage()?.id
        : language.getSelectedLanguage()?.id

    const resultCount = debouncedQuery
        ? `${displayItems.length} project${displayItems.length !== 1 ? 's' : ''} found`
        : ''

    const showSearchBar = Boolean(dataWrapper.categories?.length)

    return (
        <>
            {showSearchBar && (
                <PortfolioSearchBar
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onClear={handleClear}
                    inputRef={searchInputRef}
                    resultCount={resultCount}
                />
            )}

            {displayItems.length === 0 && debouncedQuery ? (
                <PortfolioEmptyState query={debouncedQuery} onReset={handleClear} />
            ) : dataWrapper.categories?.length ? (
                <Transitionable id={dataWrapper.uniqueId}
                                refreshFlag={refreshFlag + '-' + debouncedQuery}
                                delayBetweenItems={100}
                                animation={Transitionable.Animations.POP}
                                className={`article-portfolio-items ${itemsPerRowClass}`}>
                    {displayItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper} key={key} />
                    ))}
                </Transitionable>
            ) : (
                <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}>
                    {displayItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper} key={key} />
                    ))}
                </div>
            )}
        </>
    )
}

/**
 * @param {string}   query
 * @param {Function} onReset
 * @return {JSX.Element}
 */
function PortfolioEmptyState({ query, onReset }) {
    return (
        <div className="portfolio-empty-state" role="alert">
            <i className="fa-regular fa-folder-open portfolio-empty-state-icon" aria-hidden="true" />
            <p className="portfolio-empty-state-message">
                No projects found for <strong>&ldquo;{query}&rdquo;</strong>
            </p>
            <button
                type="button"
                className="portfolio-empty-state-reset btn text-2"
                onClick={onReset}
            >
                Clear search
            </button>
        </div>
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

export default ArticlePortfolio
