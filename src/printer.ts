import { Dataset } from "./types.js";

const padString = (str: string, width: number) => str.padEnd(width, " ");

export const printResults = (result: Dataset) => {
  console.log(`#️⃣ Returned ${result.length} rows`);
  if (result.length === 0) {
    return;
  }
  const columns = Object.keys(result[0]);
  const columnWidths = columns.map((col) =>
    Math.max(col.length, ...result.map((row) => String(row[col] ?? "").length)),
  );
  const header = columns
    .map((col, index) => padString(col, columnWidths[index]))
    .join(" | ");
  console.log(header);
  console.log(columnWidths.map((width) => "-".repeat(width)).join("-+-"));
  result.forEach((row) => {
    const line = columns
      .map((col, index) =>
        padString(String(row[col] ?? ""), columnWidths[index]),
      )
      .join(" | ");
    console.log(line);
  });
};
