const fs = require('fs');

const rawdata = fs.readFileSync('./cities.json')
const cities: any = JSON.parse(rawdata)

export default function placesFor(fips: string) {
    if (Object.keys(cities).includes(fips)) {
        return cities[parseInt(fips).toString()]
    } else {
        return []
    }
}