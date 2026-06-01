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
import {matchesSearch} from "/src/hooks/utils/_search-utils.js"

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
    const searchInputRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleClear = () => {
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
            <PortfolioSearchBar value={searchQuery}
                                onChange={setSearchQuery}
                                onClear={handleClear}
                                inputRef={searchInputRef}/>
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}
                                   debouncedQuery={debouncedQuery}
                                   onReset={handleClear}/>
        </Article>
    )
}

/**
 * @param {String} value
 * @param {Function} onChange
 * @param {Function} onClear
 * @param {Object} inputRef
 * @return {JSX.Element}
 * @constructor
 */
function PortfolioSearchBar({ value, onChange, onClear, inputRef }) {
    return (
        <div className="article-portfolio-search">
            <i className="fa-solid fa-magnifying-glass article-portfolio-search-icon" aria-hidden="true"/>
            <input ref={inputRef}
                   type="text"
                   className="article-portfolio-search-input"
                   value={value}
                   onChange={e => onChange(e.target.value)}
                   placeholder="Search projects..."
                   aria-label="Search portfolio projects"/>
            {value && (
                <button type="button"
                        className="article-portfolio-search-clear"
                        onClick={onClear}
                        aria-label="Clear search">
                    <i className="fa-solid fa-xmark" aria-hidden="true"/>
                </button>
            )}
        </div>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @param {String} debouncedQuery
 * @param {Function} onReset
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, debouncedQuery, onReset }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const categoryFiltered = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const filteredItems = debouncedQuery.trim()
        ? categoryFiltered.filter(item => matchesSearch(item.locales, debouncedQuery))
        : categoryFiltered

    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)
    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length
        ? selectedItemCategoryId + '-' + language.getSelectedLanguage()?.id + '-' + debouncedQuery
        : language.getSelectedLanguage()?.id + '-' + debouncedQuery

    const isEmpty = filteredItems.length === 0

    return (
        <>
            <div className="article-portfolio-sr-only"
                 aria-live="polite"
                 aria-atomic="true">
                {isEmpty
                    ? 'No portfolio projects found'
                    : `${filteredItems.length} project${filteredItems.length === 1 ? '' : 's'} found`}
            </div>

            {isEmpty ? (
                <div className="article-portfolio-empty-state">
                    <p className="text-2">No projects match your search.</p>
                    <button type="button"
                            className="article-portfolio-empty-reset"
                            onClick={onReset}>
                        Reset search
                    </button>
                </div>
            ) : dataWrapper.categories?.length ? (
                <Transitionable id={dataWrapper.uniqueId}
                                refreshFlag={refreshFlag}
                                delayBetweenItems={100}
                                animation={Transitionable.Animations.POP}
                                className={`article-portfolio-items ${itemsPerRowClass}`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper} key={key}/>
                    ))}
                </Transitionable>
            ) : (
                <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper} key={key}/>
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

export default ArticlePortfolio