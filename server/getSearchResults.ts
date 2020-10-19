const fs = require('fs');

const NUM_SEARCH_RESULTS = 5

const rawdata = fs.readFileSync('./search_results.json')
const searchResults: Result[] = JSON.parse(rawdata)

type Result = [string, number]

function startIndex(str: string) {
  let start = 0 
  let end = searchResults.length - 1
  str = str.toLowerCase()

  while (start <= end) {
    let mid = Math.floor((start + end) / 2)
    let name = searchResults[mid][0].toLowerCase()
    let midSection = name.slice(0, str.length)
    if (str === midSection) {
        // mid is going start with the string, however there may be places
        // before it that also start with that string
        let offset = 0
        while(mid - offset >= 0 && searchResults[mid - offset][0].toLowerCase().startsWith(str)) {
            offset += 1
        }
        return mid - offset + 1
    } else if (str > midSection) {
        start = mid + 1
    } else {
        end = mid - 1
    }
}

    return null
}

export default function resultsFor(str: string) {
    const start = startIndex(str)

    if (start === null) {
        return [] as Result[]
    }

    const results = searchResults
        .slice(start, start + NUM_SEARCH_RESULTS)
        .filter(result => result[0].toLowerCase().startsWith(str.toLowerCase()))

    return results
}