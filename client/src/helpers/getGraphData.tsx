import colors from '../colors';
import { DataEntry } from '../interfaces';

// The data either contains case data or death data
export function getGraphData(data: DataEntry[][] | null, isTotalData: boolean) {
  if (data === null) {
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
      title: isTotalData ? "Total Infections" : "Daily Infections",
      color: colors.primary,
    },
    {
      values: data.map(lineData => lineData.map(entry => {
        return {
          value: entry.value,
          date: new Date(entry.date)
        }
      })),
      title: isTotalData ? "Total Deaths" : "Percent Daily Deaths",
      color: colors.primary
    }
  ];

  return graphData;
}
