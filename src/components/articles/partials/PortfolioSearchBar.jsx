import "./PortfolioSearchBar.scss"
import React, { useRef } from 'react'

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {function(string): void} props.onChange
 * @param {function(): void} props.onClear
 * @param {string} props.placeholder
 * @param {string} props.label  Visible-to-screen-readers label.
 * @param {string} props.clearLabel  aria-label for the clear button.
 * @param {string} [props.inputId]
 * @returns {JSX.Element}
 */
function PortfolioSearchBar({
    value,
    onChange,
    onClear,
    placeholder,
    label,
    clearLabel,
    inputId = "portfolio-search-input",
}) {
    const inputRef = useRef(null)

    const _clear = () => {
        onClear?.()
        inputRef.current?.focus()
    }

    const _onKeyDown = (event) => {
        if (event.key === "Escape" && value) {
            event.preventDefault()
            _clear()
        }
    }

    const hasValue = Boolean(value && value.length > 0)

    return (
        <div className={`portfolio-search-bar`}>
            <label htmlFor={inputId} className={`visually-hidden`}>{label}</label>
            <span className={`portfolio-search-bar-icon`} aria-hidden="true">
                <i className={`fa-solid fa-magnifying-glass`}/>
            </span>
            <input ref={inputRef}
                   id={inputId}
                   type="search"
                   className={`portfolio-search-bar-input form-control`}
                   value={value}
                   onChange={(e) => onChange?.(e.target.value)}
                   onKeyDown={_onKeyDown}
                   placeholder={placeholder}
                   aria-label={label}
                   autoComplete="off"
                   spellCheck="false"/>
            {hasValue && (
                <button type="button"
                        className={`portfolio-search-bar-clear`}
                        onClick={_clear}
                        aria-label={clearLabel}>
                    <i className={`fa-solid fa-xmark`} aria-hidden="true"/>
                </button>
            )}
        </div>
    )
}

export default PortfolioSearchBar
