import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has stopped changing for `delay` milliseconds.
 *
 * @param {*} value
 * @param {number} delay
 * @returns {*}
 */
export default function useDebouncedValue(value, delay = 300) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const handle = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(handle)
    }, [value, delay])

    return debounced
}
