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

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)
    const [inputValue, setInputValue] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const inputRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(inputValue), 300)
        return () => clearTimeout(timer)
    }, [inputValue])

    const handleResetSearch = () => {
        setInputValue("")
        setSearchQuery("")
        inputRef.current?.focus()
    }

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <PortfolioSearchBar
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputRef={inputRef}/>
            <ArticlePortfolioItems
                dataWrapper={dataWrapper}
                selectedItemCategoryId={selectedItemCategoryId}
                searchQuery={searchQuery}
                onResetSearch={handleResetSearch}/>
        </Article>
    )
}

/**
 * @param {String} inputValue
 * @param {Function} setInputValue
 * @param {React.RefObject} inputRef
 * @return {JSX.Element}
 */
function PortfolioSearchBar({ inputValue, setInputValue, inputRef }) {
    const language = useLanguage()
    const placeholder = language.getString("search_placeholder")
    const clearLabel = language.getString("search_clear")

    return (
        <div role="search" className="portfolio-search-bar">
            <i className="fa-solid fa-magnifying-glass portfolio-search-bar-icon" aria-hidden="true"/>
            <input
                ref={inputRef}
                type="search"
                className="portfolio-search-bar-input text-2"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />
            {inputValue && (
                <button
                    type="button"
                    className="portfolio-search-bar-clear"
                    onClick={() => {
                        setInputValue("")
                        inputRef.current?.focus()
                    }}
                    aria-label={clearLabel}>
                    <i className="fa-solid fa-xmark" aria-hidden="true"/>
                </button>
            )}
        </div>
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
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, searchQuery, onResetSearch }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const categoryFiltered = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const filteredItems = searchQuery
        ? categoryFiltered.filter(item => {
            const q = searchQuery.toLowerCase()
            return (item.locales?.title || "").toLowerCase().includes(q)
                || (item.locales?.text  || "").toLowerCase().includes(q)
                || (item.locales?.tags  || []).join(" ").toLowerCase().includes(q)
          })
        : categoryFiltered

    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)
    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length
        ? selectedItemCategoryId + "-" + searchQuery + "-" + language.getSelectedLanguage()?.id
        : searchQuery + "-" + language.getSelectedLanguage()?.id

    const resultCount = filteredItems.length
    const announcement = searchQuery
        ? `${resultCount} result${resultCount !== 1 ? "s" : ""}`
        : ""

    if (filteredItems.length === 0 && searchQuery) {
        return <PortfolioEmptyState searchQuery={searchQuery} onReset={onResetSearch}/>
    }

    if (dataWrapper.categories?.length) {
        return (
            <>
                <span className="portfolio-sr-only" aria-live="polite" aria-atomic="true">
                    {announcement}
                </span>
                <Transitionable id={dataWrapper.uniqueId}
                                refreshFlag={refreshFlag}
                                delayBetweenItems={100}
                                animation={Transitionable.Animations.POP}
                                className={`article-portfolio-items ${itemsPerRowClass}`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper} key={key}/>
                    ))}
                </Transitionable>
            </>
        )
    }
    else {
        return (
            <>
                <span className="portfolio-sr-only" aria-live="polite" aria-atomic="true">
                    {announcement}
                </span>
                <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}>
                    {filteredItems.map((itemWrapper, key) => (
                        <ArticlePortfolioItem itemWrapper={itemWrapper} key={key}/>
                    ))}
                </div>
            </>
        )
    }
}

/**
 * @param {String} searchQuery
 * @param {Function} onReset
 * @return {JSX.Element}
 */
function PortfolioEmptyState({ searchQuery, onReset }) {
    const language = useLanguage()
    const template = language.getString("search_no_results")
    // Strip [[ ]] template markers and split around {x} to render query safely as JSX
    const clean = template.replace(/\[\[/g, "").replace(/\]\]/g, "")
    const [before, after] = clean.split("{x}")

    return (
        <div className="portfolio-empty-state" role="status">
            <i className="fa-solid fa-magnifying-glass portfolio-empty-state-icon" aria-hidden="true"/>
            <p className="portfolio-empty-state-message text-2">
                {before}<strong className="portfolio-empty-state-query">{searchQuery}</strong>{after}
            </p>
            <button
                type="button"
                className="portfolio-empty-state-reset btn text-2"
                onClick={onReset}>
                {language.getString("search_clear")}
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
