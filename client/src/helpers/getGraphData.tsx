import colors from '../colors';
import { DataEntry } from '../interfaces';

// The data either contains case data or death data
export function getGraphData(data: DataEntry[][] | null, isTotalData: boolean, isRelativeData: boolean) {
  if (!data) {
    return null
  }

  const graphData = [
    {
      values: data.map(lineData => lineData.map(entry => {
        return {
          value: entry.value,
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
      values: data.map(lineData => lineData.map(entry => {
        return {
          value: entry.value,
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
