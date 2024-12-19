import { Dataset, DatasetItem, ParsedQuery } from "../types.js";

function pickColumns<T extends DatasetItem, K extends keyof T>(
  datasetItem: T,
  columns: K[],
): Pick<T, K> {
  if (columns.length === 1 && columns[0] === "*") {
    return datasetItem;
  }
  return columns.reduce(
    (acc, key) => {
      if (key in datasetItem) {
        acc[key] = datasetItem[key];
      }
      return acc;
    },
    {} as Pick<T, K>,
  );
}

/**
 * Runs already parsed query on the dataset.
 * @param dataset - the loaded dataset from a CSV file
 * @param parsedQuery - the parsed query instructions in a structured format
 * @returns the resulting subset of dataset returned as a result of a query
 */
export const runQuery = (dataset: Dataset, parsedQuery: ParsedQuery) => {
  // Using reduce here instead of map + filter to reduce the number of iterations
  return dataset.reduce<DatasetItem[]>((acc, cur) => {
    if (parsedQuery.filterFn(cur)) {
      return [...acc, pickColumns(cur, parsedQuery.returnColumns)];
    }
    return acc;
  }, []);
};
