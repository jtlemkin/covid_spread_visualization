import { useEffect } from 'react'

const useFetch = (url: string, callback: (result: any) => void) => {
    const controller = new AbortController()
    const { signal } = controller

    useEffect(() => {
        fetch(url, { signal })
            .then(res => res.json())
            .then((results: any) => {
                callback(results)
            })
    }, [url])

    return () => {
        if (controller) {
            controller.abort()
        }
    }
}

export default useFetch