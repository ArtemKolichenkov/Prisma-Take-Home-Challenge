import { parseCsv } from "./parseCsv.js";
import readline from "readline";
import { query } from "./queryEngine/index.js";
import { Dataset, DatasetItemColumn } from "./types.js";
import { printResults } from "./printer.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

const evaluate = (
  input: string,
  dataset: Dataset,
  datasetColumns: DatasetItemColumn[],
) => {
  const { result, meta, error } = query(input, dataset, datasetColumns);
  if (error) {
    console.log(`⛔️ ${error}`);
    return;
  }
  if (meta) {
    console.log(
      `⏱️ Parsed in ${meta.parseDuration.toFixed(
        2,
      )} ms | Executed in ${meta.queryDuration.toFixed(2)} ms`,
    );
  }
  if (result) {
    printResults(result);
  }
};

const startRepl = async () => {
  console.log("💎 Prisma Take Home Challenge 💎");
  const csvFile = process.argv[2];
  if (!csvFile) {
    console.log("⛔️ Please specify a .csv file as a CLI argument.");
    process.exit(0);
  }
  console.log("⏳ Loading dataset from CSV file", csvFile);
  const { data, columns, error } = await parseCsv(csvFile);
  if (error) {
    console.log(`⛔️ ${error}`);
    process.exit(0);
  }
  console.log("✅ Dataset loaded");
  console.log(`Items in dataset: ${data.length}`);
  console.log("Dataset has the following columns:");
  columns.forEach((c) => {
    console.log(`- ${c.name} (${c.type})`);
  });
  console.log(`🖥️ REPL started, please write your query (to exit type "exit")`);
  rl.prompt();
  rl.on("line", (line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    evaluate(trimmedLine, data, columns);
    rl.prompt();
  });
  rl.on("close", () => {
    process.exit(0);
  });
};

startRepl();
