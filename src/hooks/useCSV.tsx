import { useState, useEffect } from 'react'
import * as d3 from 'd3'

const useCSV = (url: string) => {
    const [csv, setCSV] = useState<d3.DSVRowArray | null>(null)

    useEffect(() => {
        d3.csv(url).then(setCSV)
    }, [])

    return csv
}

export default useCSV