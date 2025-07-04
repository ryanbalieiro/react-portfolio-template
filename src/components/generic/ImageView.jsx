import "./ImageView.scss"
import React, {useEffect, useState, useRef} from 'react'
import {useConstants} from "/src/hooks/constants.js"
import {Spinner} from "react-bootstrap"
import {useUtils} from "/src/hooks/utils.js"

function ImageView({ src, alt = "", className = "", id= null, hideSpinner = false, style = null, onStatus = null, lazy = true }) {
    const [loadStatus, setLoadStatus] = useState(ImageView.LoadStatus.LOADING)
    const [loadedSrc, setLoadedSrc] = useState(null)
    const [errorSrc, setErrorSrc] = useState(null)
    const [isIntersecting, setIsIntersecting] = useState(!lazy)
    const imgRef = useRef(null)

    /** @listens src **/
    useEffect(() => {
        if(src && src.length > 0) setLoadStatus(ImageView.LoadStatus.LOADING)
        else setLoadStatus(ImageView.LoadStatus.ERROR)
    }, [src])

    /** @listens loadedSrc|errorSrc **/
    useEffect(() => {
        if(loadedSrc && src === loadedSrc)
            setLoadStatus(ImageView.LoadStatus.LOADED)
        else if(errorSrc && src === errorSrc)
            setLoadStatus(ImageView.LoadStatus.ERROR)
        else if(src && src.length > 0)
            setLoadStatus(ImageView.LoadStatus.LOADING)
    }, [loadedSrc, errorSrc])

    /** @listens loadStatus **/
    useEffect(() => {
        onStatus && onStatus(loadStatus)
    }, [loadStatus])

    const spinnerVisible = loadStatus === ImageView.LoadStatus.LOADING && !hideSpinner
    const containerVisible = loadStatus === ImageView.LoadStatus.LOADED
    const errorVisible = loadStatus === ImageView.LoadStatus.ERROR

    const _onLoad = () => {
        setLoadedSrc(src)
        setErrorSrc(null)
    }

    const _onError = () => {
        setLoadedSrc(null)
        setErrorSrc(src)
    }

    /** @listens lazy **/
    useEffect(() => {
        if (!lazy || !imgRef.current) return;

        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: load image immediately
            setIsIntersecting(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.01
            }
        );

        observer.observe(imgRef.current);

        return () => {
            observer.disconnect();
        };
    }, [lazy])

    return (
        <div className={`image-view ${className}`}
             id={id}
             style={style}
             ref={imgRef}>
            <ImageViewContainer src={src}
                                alt={alt}
                                visible={containerVisible}
                                loadStatus={loadStatus}
                                onLoad={_onLoad}
                                onError={_onError}
                                isIntersecting={isIntersecting}
                                lazy={lazy}/>

            <ImageViewSpinner visible={spinnerVisible}/>
            <ImageViewError visible={errorVisible}
                            hideIcon={hideSpinner}/>
        </div>
    )
}

ImageView.LoadStatus = {
    LOADING: "loading",
    LOADED: "loaded",
    ERROR: "error"
}

function ImageViewContainer({ src, alt, visible, loadStatus, onLoad, onError, isIntersecting, lazy }) {
    const constants = useConstants()
    const utils = useUtils()

    const resolvedSrc = utils.file.resolvePath(src)
    const visibleClass = visible ? `visible` : `invisible`

    return (
        <img className={`image-view-img ${visibleClass} ${constants.HTML_CLASSES.imageView} ${constants.HTML_CLASSES.imageView}-${loadStatus}`}
             src={isIntersecting ? resolvedSrc : undefined}
             alt={alt}
             onLoad={onLoad}
             onError={onError}
             loading={lazy ? 'lazy' : 'eager'}/>
    )
}

function ImageViewSpinner({ visible }) {
    if(!visible)
        return <></>

    return (
        <div className={`image-view-spinner-wrapper`}>
            <Spinner/>
        </div>
    )
}

function ImageViewError({ visible, hideIcon }) {
    if(!visible)
        return <></>

    return (
        <div className={`image-view-error-wrapper`}>
            {!hideIcon && (
                <i className={`fa-solid fa-eye-slash`}/>
            )}
        </div>
    )

}

export default ImageView