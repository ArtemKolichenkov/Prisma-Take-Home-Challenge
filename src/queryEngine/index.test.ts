import { query } from "./index.js";
import { ErrorMessages } from "./constants.js";
import {
  billy,
  dataset,
  datasetColumns,
  george,
  john,
  maria,
} from "../testFixtures.js";

describe("query", () => {
  it("parses, validates and runs a valid query", () => {
    const { result, error } = query(
      "PROJECT first_name, age FILTER age > 18",
      dataset,
      datasetColumns,
    );
    expect(error).toBeNull();
    expect(result).toStrictEqual([
      { first_name: john.first_name, age: john.age },
      { first_name: billy.first_name, age: billy.age },
      { first_name: maria.first_name, age: maria.age },
      { first_name: george.first_name, age: george.age },
    ]);
  });

  it("returns error if query is not valid", () => {
    const { result, error } = query(
      "PROJECT first_name, age FILTER age ~ 18",
      dataset,
      datasetColumns,
    );
    expect(error).toBe(ErrorMessages.UnsupportedOperator);
    expect(result.length).toBe(0);
  });
});
