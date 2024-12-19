import { FILTER_OPERATIONS } from "./queryEngine/constants.js";

export type DatasetItem = Record<string, string | number>;
export type DatasetItemColumn = {
  name: string;
  type: "string" | "number";
};
export type Dataset = DatasetItem[];

export interface ParsedCsvResult {
  data: Record<string, string | number>[];
  columns: DatasetItemColumn[];
  error: string | null;
}

export type FilterOperator = (typeof FILTER_OPERATIONS)[number];

export type FilterCondition = {
  column: string;
  operator: FilterOperator;
  value: string | number;
};

export type FilterFunction = (datasetItem: DatasetItem) => boolean;

export interface ParsedQuery {
  returnColumns: string[];
  filterFn: FilterFunction;
}

export interface ParsedQueryResult {
  parsedQuery: ParsedQuery;
  error: string | null;
}

export interface QueryResult {
  result: Dataset;
  meta?: {
    parseDuration: number;
    queryDuration: number;
  };
  error: string | null;
}
