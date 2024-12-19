// Definition of the query language keywords
export const KEYWORDS = {
  PROJECT: "PROJECT",
  FILTER: "FILTER",
} as const;

export const FILTER_OPERATIONS = ["=", "<", ">"] as const;

export const ErrorMessages = {
  MalformedQuery: "Malformed query",
  NoProjectKeyword: "Query must start with a PROJECT keyword",
  NoReturnColumns: "Query must specify at least one return column",
  WildcardMixedIn:
    "Wildcard (*) must not be mixed in with other explicitly defined columns",
  UnknownReturnColumns: (invalidColumns: string[]) =>
    `Columns ${invalidColumns.join(", ")} do not exist in the current dataset.`,
  MalformedFilterClause:
    "The FILTER condition must specify a column name, operator and a comparison value.",
  UnknownFilterColumn: (filterColumn: string) =>
    `The FILTER column ${filterColumn} does not exist in the current dataset.`,
  UnsupportedOperator: `Only ${FILTER_OPERATIONS.join(
    " ",
  )} operators are allowed in FILTER clause.`,
  FilterTypeMismatch: (
    filterColumn: string,
    datasetType: "string" | "number",
    filterValueType: "string" | "number",
  ) =>
    `The FILTER column ${filterColumn} is of type ${datasetType} and cannot be compared to ${filterValueType}. String values must be encased in double quotes.`,
  InvalidNumberValue: (filterColumn: string) =>
    `The comparison value for the number column ${filterColumn} is not a valid number`,
} as const;
