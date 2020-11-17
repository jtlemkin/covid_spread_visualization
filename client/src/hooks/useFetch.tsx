import { useEffect, useState, useRef } from 'react'

function useFetch<T>(url: string, shouldCache: boolean) {
    const cache = useRef<any>({})
    const [result, setResult] = useState<T | null>(null)
    const [isFetching, setIsFetching] = useState(true)

    useEffect(() => {
        if (!url) return;

        const controller = new AbortController()
        const { signal } = controller

        setIsFetching(true)

        if (cache.current[url] !== undefined) {
            const data = cache.current[url]
            setResult(data)
            setIsFetching(false)
        } else {
            fetch(url, { signal })
                .then(res => res.json())
                .then((results: T) => {
                    if (shouldCache) {
                        cache.current[url] = results
                    }
                    setResult(results)
                    setIsFetching(false)
                })
        }

        return () => {
            if (controller) {
                controller.abort()
            }
        }
    }, [url])

    return [result, isFetching] as [T | null, boolean]
}

export default useFetch