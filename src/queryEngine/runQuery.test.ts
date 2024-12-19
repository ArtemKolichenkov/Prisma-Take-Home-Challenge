import { DatasetItem, ParsedQuery } from "src/types.js";
import { runQuery } from "./runQuery.js";
import { billy, dataset, george, jane, john, maria } from "../testFixtures.js";

describe("runQuery", () => {
  it("returns correct columns when explicitly specified", () => {
    const query: ParsedQuery = {
      returnColumns: ["first_name", "age"],
      filterFn: () => true,
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual([
      { first_name: john.first_name, age: john.age },
      { first_name: jane.first_name, age: jane.age },
      { first_name: billy.first_name, age: billy.age },
      { first_name: maria.first_name, age: maria.age },
      { first_name: george.first_name, age: george.age },
    ]);
  });
  it("returns all columns when passed a wildcard", () => {
    const query: ParsedQuery = {
      returnColumns: ["*"],
      filterFn: () => true,
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual(dataset);
  });
  it("applies filtering (>) by number", () => {
    const query: ParsedQuery = {
      returnColumns: ["*"],
      filterFn: (datasetItem: DatasetItem) =>
        (datasetItem["age"] as number) > 18,
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual([john, billy, maria, george]);
  });
  it("applies filtering (<) by number", () => {
    const query: ParsedQuery = {
      returnColumns: ["*"],
      filterFn: (datasetItem: DatasetItem) =>
        (datasetItem["age"] as number) < 18,
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual([jane]);
  });
  it("applies filtering (=) by number", () => {
    const query: ParsedQuery = {
      returnColumns: ["*"],
      filterFn: (datasetItem: DatasetItem) =>
        (datasetItem["age"] as number) === 27,
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual([john, maria]);
  });
  it("applies filtering (=) by string", () => {
    const query: ParsedQuery = {
      returnColumns: ["*"],
      filterFn: (datasetItem: DatasetItem) =>
        (datasetItem["country"] as string) === "United Kingdom",
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual([jane, billy]);
  });
  it("applies filtering (>) by string", () => {
    const query: ParsedQuery = {
      returnColumns: ["*"],
      filterFn: (datasetItem: DatasetItem) =>
        (datasetItem["country"] as string) > "United",
    };
    const result = runQuery(dataset, query);
    expect(result).toStrictEqual([jane, billy, george]);
  });
});
