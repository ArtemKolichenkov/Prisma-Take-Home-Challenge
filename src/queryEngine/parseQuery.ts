import { ErrorMessages, FILTER_OPERATIONS, KEYWORDS } from "./constants.js";
import {
  DatasetItem,
  DatasetItemColumn,
  FilterCondition,
  FilterFunction,
  FilterOperator,
  ParsedQuery,
  ParsedQueryResult,
} from "../types.js";

const RETURN_COLUMNS_START_IDX = 1;

const NOOP_PARSED_QUERY: ParsedQuery = {
  returnColumns: [],
  filterFn: () => false,
};

/**
 * Parses and validates a query string.
 * @param query - raw query string (e.g. "PROJECT first_name, last_name FILTER age > 18")
 * @param datasetColumns - an array of objects specifying the names of the columns and their type. Used for validation.
 * @returns an object containing "parsedQuery" and "error"
 * - if there are any validation errors during parsing - error is a string describing the issue with the query (parsedQuery in this case is a dummy "return 0 rows" query)
 * - if there are no validation errors - "parsedQuery" contains "returnColumns"
 * - parsedQuery is ready to be used by the consumer in runQuery function
 */
export const parseQuery = (
  query: string,
  datasetColumns: DatasetItemColumn[],
): ParsedQueryResult => {
  const splitQuery = query.split(" ");
  if (splitQuery.length <= 1) {
    return {
      parsedQuery: NOOP_PARSED_QUERY,
      error: ErrorMessages.MalformedQuery,
    };
  }
  if (splitQuery[0] !== KEYWORDS.PROJECT) {
    return {
      parsedQuery: NOOP_PARSED_QUERY,
      error: ErrorMessages.NoProjectKeyword,
    };
  }
  const filterKeywordIndex = splitQuery.findIndex((v) => v === KEYWORDS.FILTER);
  const hasFilterClause = filterKeywordIndex !== -1;
  const returnColumns = splitQuery
    .slice(
      RETURN_COLUMNS_START_IDX,
      hasFilterClause ? filterKeywordIndex : undefined,
    )
    .map((value) => value.replace(",", ""));
  const { isValid, error } = validateReturnColumns(
    returnColumns,
    datasetColumns,
  );
  if (!isValid) {
    return {
      parsedQuery: NOOP_PARSED_QUERY,
      error,
    };
  }
  if (hasFilterClause) {
    const filterTokens = tokenizeFilterClause(
      splitQuery.slice(filterKeywordIndex + 1).join(" "),
    );
    const { filterCondition, error } = parseFilterClause(
      filterTokens,
      datasetColumns,
    );
    if (error) {
      return {
        parsedQuery: NOOP_PARSED_QUERY,
        error,
      };
    }
    return {
      parsedQuery: {
        returnColumns,
        filterFn: getFilterFn(filterCondition),
      },
      error: null,
    };
  }
  return {
    parsedQuery: {
      returnColumns,
      filterFn: getFilterFn(),
    },
    error: null,
  };
};

const tokenizeFilterClause = (filterClause: string) => {
  const tokens: string[] = [];
  let currentToken = "";
  let inQuotes = false;

  for (const char of filterClause) {
    if (char === '"') {
      inQuotes = !inQuotes;
      currentToken += char;
    } else if (char === " " && !inQuotes) {
      tokens.push(currentToken);
      currentToken = "";
    } else {
      currentToken += char;
    }
  }

  tokens.push(currentToken);
  return tokens;
};

const parseFilterClause = (
  filterTokens: string[],
  datasetColumns: DatasetItemColumn[],
): { filterCondition?: FilterCondition; error: string | null } => {
  if (filterTokens.length !== 3) {
    return {
      error: ErrorMessages.MalformedFilterClause,
    };
  }
  const filterColumn = filterTokens[0];
  const datasetColumn = datasetColumns.find(
    (col) => col.name === filterColumn.toLowerCase(),
  );
  if (!datasetColumn) {
    return {
      error: ErrorMessages.UnknownFilterColumn(filterColumn),
    };
  }
  const filterOperation = filterTokens[1];
  if (!isAllowedFilterOperator(filterOperation)) {
    return {
      error: ErrorMessages.UnsupportedOperator,
    };
  }
  const filterValue = filterTokens[2];
  const filterValueType =
    filterValue.startsWith(`"`) && filterValue.endsWith(`"`)
      ? "string"
      : "number";
  if (datasetColumn.type !== filterValueType) {
    return {
      error: ErrorMessages.FilterTypeMismatch(
        filterColumn,
        datasetColumn.type,
        filterValueType,
      ),
    };
  }
  let formattedFitlerValue: string | number = filterValue;
  if (filterValueType === "number") {
    formattedFitlerValue = parseFloat(filterValue);
    if (isNaN(formattedFitlerValue)) {
      return {
        error: ErrorMessages.InvalidNumberValue(filterColumn),
      };
    }
  } else {
    formattedFitlerValue = formattedFitlerValue.replaceAll(`"`, "");
  }
  const filterCondition: FilterCondition = {
    column: filterColumn,
    operator: filterOperation,
    value: formattedFitlerValue,
  };
  return {
    filterCondition,
    error: null,
  };
};

/**
 * Checks whether the operator in a query is a valid one.
 * Also promotes it from type string to FilterOperator if it is.
 */
const isAllowedFilterOperator = (
  operator: string,
): operator is FilterOperator =>
  FILTER_OPERATIONS.includes(operator as FilterOperator);

const validateReturnColumns = (
  returnColumns: string[],
  datasetColumns: DatasetItemColumn[],
) => {
  if (returnColumns.length === 0) {
    return {
      isValid: false,
      error: ErrorMessages.NoReturnColumns,
    };
  }
  if (returnColumns.length === 1 && returnColumns[0] === "*") {
    return {
      isValid: true,
      error: null,
    };
  }
  if (returnColumns.length > 1 && returnColumns.some((rc) => rc === "*")) {
    return {
      isValid: false,
      error: ErrorMessages.WildcardMixedIn,
    };
  }
  const invalidColumns = returnColumns.reduce<string[]>((acc, cur) => {
    const foundColumn = datasetColumns.find(
      (col) => col.name === cur.toLowerCase(),
    );
    return foundColumn ? acc : [...acc, cur];
  }, []);
  if (invalidColumns.length !== 0) {
    return {
      isValid: false,
      error: ErrorMessages.UnknownReturnColumns(invalidColumns),
    };
  }
  return {
    isValid: true,
    error: null,
  };
};

// Using closure to get required filter function, to reduce number of branches (if statements) in the consumer
const getFilterFn = (condition?: FilterCondition): FilterFunction => {
  if (!condition) {
    return () => true;
  }
  switch (condition.operator) {
    case "=" as FilterOperator:
      return (datasetItem: DatasetItem) =>
        datasetItem[condition.column] === condition.value;
    case "<" as FilterOperator:
      return (datasetItem: DatasetItem) =>
        datasetItem[condition.column] < condition.value;
    case ">" as FilterOperator:
      return (datasetItem: DatasetItem) =>
        datasetItem[condition.column] > condition.value;
    default:
      return () => true;
  }
};
