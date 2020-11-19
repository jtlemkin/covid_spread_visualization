import { useEffect, useState } from 'react'

let cache: Map<string, any> = new Map()

function useFetch<T>(url: string, shouldCache: boolean) {
    const [result, setResult] = useState<T | null>(null)
    const [isFetching, setIsFetching] = useState(true)

    useEffect(() => {
        if (!url) return;

        const controller = new AbortController()
        const { signal } = controller

        setIsFetching(true)

        if (cache.get(url) !== undefined) {
            console.log("cache hit!", url)
            const data = cache.get(url)
            setResult(data)
            setIsFetching(false)
        } else {
            fetch(url, { signal })
                .then(res => res.json())
                .then((results: T) => {
                    if (shouldCache) {
                        console.log("cache set", url)
                        cache.set(url, results)
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
    }, [url, shouldCache])

    return [result, isFetching] as [T | null, boolean]
}

export default useFetch