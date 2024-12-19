import { promises as fs } from "fs";
import { DatasetItemColumn, ParsedCsvResult } from "./types.js";

export const CSVParsingErrors = {
  NotEnoughRows: "CSV file must have at least two rows (header and data).",
  DuplicateHeaders: "Duplicate column names detected in CSV header.",
  NoDataRows: "CSV file contains no data rows.",
  TypeMismatch: (
    headerName: string,
    expectedType: "string" | "number",
    detectedType: "string" | "number",
    row: string,
  ) =>
    `Type mismatch in column '${headerName}': expected '${expectedType}', but found '${detectedType}' in row '${row}'.`,
  CellsMismatch: (row: string) =>
    `Number of cells in CSV row does not match the header: ${row}`,
  FailedToReadFile: (filePath: string, error: unknown) =>
    `Failed to read file ${filePath}, does it exist? Original error: \n${error}`,
};

const toSnakeCase = (str: string): string => {
  return str
    .replace(/\s+/g, "_")
    .replace(/\W/g, "")
    .replace(/(^_+)|(_+$)/g, "")
    .toLowerCase();
};

const detectType = (value: string): "string" | "number" => {
  if (/^-?\d+$/.test(value) || /^-?\d*\.\d+$/.test(value)) {
    return "number";
  }
  return "string";
};

const splitCsvRow = (row: string): string[] => {
  const cells: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (const char of row) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(currentCell);
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  cells.push(currentCell); // Add the last cell
  return cells.map((cell) => cell.trim().replace(/(^")|("$)/g, "")); // Trim and remove surrounding quotes
};

const parseValue = (
  value: string,
  type: "string" | "number",
): string | number => {
  if (type === "number") {
    return value.includes(".") ? parseFloat(value) : parseInt(value, 10);
  }
  return value;
};

/**
 * Given the filePath attempts to parse a CSV file
 * @param filePath - the path to the csv file, relative to the current working directory
 * @returns an object containing "data", "columns" and "error"
 * - "data" - is the parsed and formatted dataset, ready to be used for querying
 * - "columns" - an array of objects specifying the names of the columns and their type. Used for validation.
 * - "error" is a string returned if there were any problems with CSV parsing, it is intended to be displayed to the user. If there was no error it is null.
 */
export const parseCsv = async (filePath: string): Promise<ParsedCsvResult> => {
  try {
    const content = await fs.readFile(`${filePath}`);
    const lines = content
      .toString()
      .split("\n")
      .map((line) => line.trim());
    if (lines.length < 2) {
      return {
        error: CSVParsingErrors.NotEnoughRows,
        data: [],
        columns: [],
      };
    }

    const headerRow = lines[0];
    const headers = headerRow.split(",").map(toSnakeCase);
    if (new Set(headers).size !== headers.length) {
      return {
        error: CSVParsingErrors.DuplicateHeaders,
        data: [],
        columns: [],
      };
    }

    const dataRows = lines.slice(1).filter((row) => row.length > 0);
    if (dataRows.length === 0) {
      return {
        error: CSVParsingErrors.NoDataRows,
        data: [],
        columns: [],
      };
    }

    const parsedData: Record<string, string | number>[] = [];
    const columnTypes: (string | number | null)[] = new Array(
      headers.length,
    ).fill(null);
    for (const row of dataRows) {
      const cells = splitCsvRow(row);

      if (cells.length !== headers.length) {
        return {
          error: CSVParsingErrors.CellsMismatch(row),
          data: [],
          columns: [],
        };
      }

      const parsedRow: Record<string, string | number> = {};

      for (const [index, cell] of cells.entries()) {
        const detectedType = detectType(cell);
        if (columnTypes[index] === null) {
          columnTypes[index] = detectedType;
        }
        if (columnTypes[index] !== detectedType) {
          return {
            error: CSVParsingErrors.TypeMismatch(
              headers[index],
              columnTypes[index] as "string" | "number",
              detectedType,
              row,
            ),
            data: [],
            columns: [],
          };
        }
        parsedRow[headers[index]] = parseValue(cell, detectedType);
      }
      parsedData.push(parsedRow);
    }
    const columns: DatasetItemColumn[] = headers.map((name, index) => ({
      name,
      type: columnTypes[index] as "string" | "number",
    }));
    return { data: parsedData, columns, error: null };
  } catch (error) {
    return {
      data: [],
      columns: [],
      error: CSVParsingErrors.FailedToReadFile(filePath, error),
    };
  }
};
