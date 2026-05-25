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
import PortfolioSearchBar from "/src/components/articles/partials/PortfolioSearchBar.jsx"
import useDebouncedValue from "/src/hooks/useDebouncedValue.js"
import {matchesSearchQuery} from "/src/utils/portfolioSearch.js"

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedQuery = useDebouncedValue(searchQuery, 300)
    const language = useLanguage()

    // Switching category resets the search input.
    useEffect(() => {
        setSearchQuery("")
    }, [selectedItemCategoryId])

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <PortfolioSearchBar value={searchQuery}
                                onChange={setSearchQuery}
                                onClear={() => setSearchQuery("")}
                                placeholder={language.getString("portfolio_search_placeholder")}
                                label={language.getString("portfolio_search_label")}
                                clearLabel={language.getString("portfolio_search_clear")}/>
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}
                                   searchQuery={debouncedQuery}
                                   onResetSearch={() => setSearchQuery("")}/>
        </Article>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @param {String} searchQuery
 * @param {Function} onResetSearch
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, searchQuery = "", onResetSearch }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const categoryItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const filteredItems = categoryItems.filter(item => matchesSearchQuery(item, searchQuery))
    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)

    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length ?
        selectedItemCategoryId + "-" + language.getSelectedLanguage()?.id + "-" + searchQuery :
        language.getSelectedLanguage()?.id + "-" + searchQuery

    const trimmedQuery = (searchQuery || "").trim()
    const isEmptyState = trimmedQuery.length > 0 && filteredItems.length === 0

    const statusMessage = trimmedQuery.length > 0
        ? (filteredItems.length === 1
            ? language.getString("portfolio_search_results_count_singular").replace("{x}", "1").replace(/\[\[|]]/g, "")
            : language.getString("portfolio_search_results_count_plural").replace("{x}", String(filteredItems.length)).replace(/\[\[|]]/g, ""))
        : ""

    const statusRegion = (
        <div role="status" aria-live="polite" className={`visually-hidden`}>
            {statusMessage}
        </div>
    )

    if(isEmptyState) {
        return (
            <>
                {statusRegion}
                <PortfolioEmptyState query={trimmedQuery}
                                     onReset={onResetSearch}/>
            </>
        )
    }

    if(dataWrapper.categories?.length) {
        return (
            <>
                {statusRegion}
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
                {statusRegion}
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
 * @param {Object} props
 * @param {string} props.query
 * @param {function(): void} props.onReset
 * @returns {JSX.Element}
 */
function PortfolioEmptyState({ query, onReset }) {
    const language = useLanguage()

    const message = language.getString("portfolio_search_no_results")
        .replace("{x}", `<strong>${escapeHtml(query)}</strong>`)

    return (
        <div className={`portfolio-empty-state`} role="region" aria-label={language.getString("portfolio_search_label")}>
            <div className={`portfolio-empty-state-title`}
                 dangerouslySetInnerHTML={{__html: message.replace(/\[\[|]]/g, "")}}/>
            <button type="button"
                    className={`portfolio-empty-state-reset`}
                    onClick={onReset}>
                {language.getString("portfolio_search_reset")}
            </button>
        </div>
    )
}

function escapeHtml(value) {
    return (value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
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