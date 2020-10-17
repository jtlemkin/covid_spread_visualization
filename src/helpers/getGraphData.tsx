import colors from '../colors';
import { DataEntry } from '../interfaces';
import PlaceFactory from './PlaceFactory';

// The data either contains case data or death data
export function getGraphData(fips: number, data: DataEntry[][], isTotalData: boolean, isRelativeData: boolean) {
  const [countyData, stateData, nationData] = data;
  const selectedPlaceType = fips === 0 ? "nation" : (fips % 1000 === 0 ? "state" : "county");

  const choices = {
    county: countyData,
    state: stateData,
    nation: nationData
  };

  let graphingData = [choices[selectedPlaceType]];

  if (isRelativeData) {
    if (selectedPlaceType === "county") {
      graphingData.push(choices["state"]);
      graphingData.push(choices["nation"]);
    } else if (selectedPlaceType === "state") {
      graphingData.push(choices["nation"]);
    }

    const selectedPlace = PlaceFactory(fips);

    const populations = [
      selectedPlace.getPopulation(),
      selectedPlace.getOwner()?.getPopulation(),
      selectedPlace.getOwner()?.getOwner()?.getPopulation()
    ];

    graphingData = graphingData.map((lineData, index) => {
      return lineData.map(dataEntry => {
        return {
          ...dataEntry,
          cases: dataEntry.cases / populations[index]!,
          deaths: dataEntry.deaths / populations[index]!
        } as DataEntry;
      });
    });
  }

  console.log("DAILY", !isTotalData)

  if (!isTotalData) {
    console.log("I shouldn't run!")
    graphingData = graphingData.map(lineData => {
      return lineData.map((dataEntry, index) => {
        if (index === 0) {
          return dataEntry;
        } else {
          return {
            ...dataEntry,
            cases: dataEntry.cases - lineData[index - 1].cases,
            deaths: dataEntry.deaths - lineData[index - 1].deaths
          };
        }
      });
    });
  }

  const graphData = [
    {
      values: graphingData.map(lineData => lineData.map(entry => {
        return {
          value: entry.cases,
          date: new Date(entry.date)
        }
      })),
      title: isRelativeData ? (
        isTotalData ? "Total Percent Infected" : "Percent Infected Daily"
      ) : (
          isTotalData ? "Total Infections" : "Daily Infections"
        ),
      color: colors.primary,
      type: isRelativeData ? "Percent" : "Whole"
    },
    {
      values: graphingData.map(lineData => lineData.map(entry => {
        return {
          value: entry.deaths,
          date: new Date(entry.date)
        }
      })),
      title: isRelativeData ? (
        isTotalData ? "Total Death Percentage" : "Percent Daily Deaths"
      ) : (
          isTotalData ? "Total Deaths" : "Percent Daily Deaths"
        ),
      color: colors.primary,
      type: isRelativeData ? "Percent" : "Whole"
    }
  ];

  return graphData;
}
