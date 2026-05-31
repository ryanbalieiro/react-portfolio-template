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
                    onTouchStart={(e) => { e.preventDefault(); setQuery("") }}>
                    <i className={`fa-solid fa-xmark`}/>
                </button>
            )}
        </div>
    )
}

export default ArticlePortfolioSearch
