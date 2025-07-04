import "./SectionHeader.scss"
import React, {useEffect, useState} from 'react'
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useParser} from "/src/hooks/parser.js"

function SectionHeader({ section }) {
    const viewport = useViewport()
    const parser = useParser()

    const isMobileLayout = viewport.isMobileLayout()
    const parsedTitle = parser.parseSectionTitle(section)

    const titleClass = !isMobileLayout ?
        `lead-4` :
        ``

    return (
        <header className={`section-header`}>
            {parsedTitle.prefix && (
                <div className={`section-header-prefix lead-2 mb-2`}>
                    <i className={`fa-solid fa-cubes`}/>
                    <span dangerouslySetInnerHTML={{__html: parsedTitle.prefix}}/>
                </div>
            )}

            <h2 className={`section-header-title ${titleClass} h3`}
                dangerouslySetInnerHTML={{__html: parsedTitle.title}}/>
        </header>
    )
}

export default SectionHeader