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
import {usePortfolioSearch} from "/src/hooks/usePortfolioSearch.js"

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

    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const filteredItems = usePortfolioSearch(dataWrapper.orderedItems, selectedItemCategoryId, debouncedQuery)
    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)

    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length ?
        selectedItemCategoryId + "-" + debouncedQuery + "-" + language.getSelectedLanguage()?.id :
        debouncedQuery + "-" + language.getSelectedLanguage()?.id

    const hasQuery = searchQuery.length > 0
    const showEmptyState = filteredItems.length === 0 && debouncedQuery.trim().length > 0
    const handleReset = () => setSearchQuery("")

    const searchBar = (
        <div className={`article-portfolio-search mb-3`}>
            <div className={`input-group`}>
                <span className={`input-group-text`} aria-hidden="true">
                    <i className={`fa-solid fa-magnifying-glass`}/>
                </span>
                <input type="search"
                       className={`form-control`}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Search by title, tag, or description..."
                       aria-label="Search portfolio projects"/>
                {hasQuery && (
                    <button type="button"
                            className={`btn btn-outline-secondary article-portfolio-search-clear`}
                            aria-label="Clear search"
                            onClick={handleReset}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                )}
            </div>
            <div className={`visually-hidden`} role="status" aria-live="polite">
                {debouncedQuery.trim().length > 0
                    ? `${filteredItems.length} ${filteredItems.length === 1 ? 'project' : 'projects'} found.`
                    : ''}
            </div>
        </div>
    )

    const emptyState = (
        <div className={`article-portfolio-empty text-center py-4`} role="status">
            <p className={`mb-3`}>No projects found. Try a different search.</p>
            <button type="button"
                    className={`btn btn-outline-primary`}
                    onClick={handleReset}>
                Reset
            </button>
        </div>
    )

    const grid = dataWrapper.categories?.length ? (
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
    )

    return (
        <>
            {searchBar}
            {showEmptyState ? emptyState : grid}
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