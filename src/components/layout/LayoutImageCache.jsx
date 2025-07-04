import "./LayoutImageCache.scss"
import React, {useEffect, useState} from 'react'
import {useUtils} from "/src/hooks/utils.js"

function LayoutImageCache({ profile, settings, sections }) {
    const utils = useUtils()

    const imagesToCache = [
        profile.profileCardLogoUrl,
        profile.profileCardLogoUrlLight,
        profile.profilePictureUrl
    ]

    const settingsImagesToCache = settings.imagesToCache || []
    for(const image of settingsImagesToCache) {
        imagesToCache.push(image)
    }

    for(const language of settings.supportedLanguages) {
        imagesToCache.push(language.flagUrl)
    }

    for(const section of sections) {
        const articles = section.data?.articles || []
        articles.forEach(article => {
            const items = article.items || []
            items.forEach(item => {
                imagesToCache.push(item.img)
            })
        })
    }

    const filtered = imagesToCache.filter(image => image)

    return (
        <div className={`layout-image-cache`}>
            {filtered.map((src, key) => (
                <img key={key}
                     src={utils.file.resolvePath(src)}
                     className={`cache-image`}
                     alt={`Preloaded image ${key + 1}`}
                     aria-hidden="true"/>
            ))}
        </div>
    )
}

export default LayoutImageCache