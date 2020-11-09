const fs = require('fs');

const rawdata = fs.readFileSync('./cities.json')
const cities: any = JSON.parse(rawdata)

export default function placesFor(fips: string) {
    return cities[parseInt(fips).toString()]
}