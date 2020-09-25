import colors from '../colors';
import { DataEntry } from '../interfaces';
import PlaceFactory from '../PlaceFactory';

export function getGraphingData(fips: number, data: DataEntry[][], isDailyData: boolean, isRelativeData: boolean) {
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

  if (isDailyData) {
    graphingData = graphingData.map(lineData => {
      return lineData.map((dataEntry, index) => {
        if (index === 0) {
          return dataEntry;
        } else {
          return {
            ...dataEntry,
            cases: dataEntry.cases - lineData[index - 1].cases,
            deaths: dataEntry.cases - lineData[index - 1].cases
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
        };
      })),
      title: isRelativeData ? (
        isDailyData ? "Percent Infected Daily" : "Total Percent Infected"
      ) : (
          isDailyData ? "Daily Infections" : "Total Infections"
        ),
      color: colors.primary
    },
    {
      values: graphingData.map(lineData => lineData.map(entry => {
        return {
          value: entry.deaths,
          date: new Date(entry.date)
        };
      })),
      title: isRelativeData ? (
        isDailyData ? "Percent Daily Deaths" : "Total Death Percentage"
      ) : (
          isDailyData ? "Daily Deaths" : "Total Deaths"
        ),
      color: colors.text.onSurface
    }
  ];

  return graphData;
}
