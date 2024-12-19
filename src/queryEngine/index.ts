import { performance } from "perf_hooks";
import { Dataset, DatasetItemColumn, QueryResult } from "src/types.js";
import { parseQuery } from "./parseQuery.js";
import { runQuery } from "./runQuery.js";

/**
 * Parses, validates and executes the query.
 * @param query - raw query string (e.g. "PROJECT first_name, last_name FILTER age > 18")
 * @param dataset - the loaded dataset from a CSV file
 * @param datasetColumns - an array of objects specifying the names of the columns and their type. Used for validation.
 * @returns an object containing "result", "error" and "meta"
 * - "result" contains the resulting subset of dataset returned as a result of a query
 * - "error" is a string returned if the query did not pass validation and is intended to be displayed to the user. If there was no error it is null.
 * - "meta" contains the execution duration (in ms) for parsing (parseDuration) and execution (queryDuration)
 */
export const query = (
  query: string,
  dataset: Dataset,
  datasetColumns: DatasetItemColumn[],
): QueryResult => {
  const parseStart = performance.now();
  const { parsedQuery, error } = parseQuery(query, datasetColumns);
  const parseEnd = performance.now();
  if (error) {
    return {
      result: [],
      error,
    };
  }
  const queryStart = performance.now();
  const result = runQuery(dataset, parsedQuery);
  const queryEnd = performance.now();
  return {
    result,
    meta: {
      parseDuration: parseEnd - parseStart,
      queryDuration: queryEnd - queryStart,
    },
    error: null,
  };
};
