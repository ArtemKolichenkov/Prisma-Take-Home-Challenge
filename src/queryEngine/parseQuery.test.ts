import { parseQuery } from "./parseQuery.js";
import { ErrorMessages } from "./constants.js";
import { datasetColumns, jane, john } from "../testFixtures.js";

describe("parseQuery", () => {
  describe("parses valid queries", () => {
    it("with no filter (specific columns)", () => {
      const q = `PROJECT first_name, last_name`;
      const result = parseQuery(q, datasetColumns);
      expect(result.error).toBeNull();
      expect(result.parsedQuery.returnColumns).toStrictEqual([
        "first_name",
        "last_name",
      ]);
      expect(result.parsedQuery.filterFn(john)).toBe(true);
      expect(result.parsedQuery.filterFn(jane)).toBe(true);
    });
    it("with no filter (wildcard)", () => {
      const q = `PROJECT *`;
      const result = parseQuery(q, datasetColumns);
      expect(result.error).toBeNull();
      expect(result.parsedQuery.returnColumns).toStrictEqual(["*"]);
      expect(result.parsedQuery.filterFn(john)).toBe(true);
      expect(result.parsedQuery.filterFn(jane)).toBe(true);
    });
    it.each`
      query                                                                | filterType | valueType   | expectedReturnColumns          | expectedFilterReturn
      ${"PROJECT first_name, last_name FILTER age > 18"}                   | ${">"}     | ${"number"} | ${["first_name", "last_name"]} | ${{ john: true, jane: false }}
      ${"PROJECT first_name, last_name FILTER age < 18"}                   | ${"<"}     | ${"number"} | ${["first_name", "last_name"]} | ${{ john: false, jane: true }}
      ${"PROJECT first_name, last_name FILTER age = 17"}                   | ${"="}     | ${"number"} | ${["first_name", "last_name"]} | ${{ john: false, jane: true }}
      ${`PROJECT first_name, last_name FILTER country = "United Kingdom"`} | ${"="}     | ${"string"} | ${["first_name", "last_name"]} | ${{ john: false, jane: true }}
      ${`PROJECT first_name, last_name FILTER country > "United"`}         | ${"<"}     | ${"string"} | ${["first_name", "last_name"]} | ${{ john: false, jane: true }}
      ${`PROJECT first_name, last_name FILTER country < "United"`}         | ${"<"}     | ${"string"} | ${["first_name", "last_name"]} | ${{ john: true, jane: false }}
    `(
      "with $filterType filter (on $valueType)",
      ({ query, expectedReturnColumns, expectedFilterReturn }) => {
        const result = parseQuery(query, datasetColumns);
        expect(result.error).toBeNull();
        expect(result.parsedQuery.returnColumns).toStrictEqual(
          expectedReturnColumns,
        );
        expect(result.parsedQuery.filterFn(john)).toBe(
          expectedFilterReturn.john,
        );
        expect(result.parsedQuery.filterFn(jane)).toBe(
          expectedFilterReturn.jane,
        );
      },
    );
  });
  describe("returns error for malformed queries", () => {
    it.each`
      query                                                          | description                                              | expectedError
      ${"PROJECT"}                                                   | ${"malformed query"}                                     | ${ErrorMessages.MalformedQuery}
      ${"first_name FILTER age > 18"}                                | ${"no PROJECT keyword"}                                  | ${ErrorMessages.NoProjectKeyword}
      ${"PROJECT height FILTER age > 18"}                            | ${"invalid return column names"}                         | ${ErrorMessages.UnknownReturnColumns(["height"])}
      ${`PROJECT first_name FILTER age > 18 AND country = "Canada"`} | ${"malformed filter cause"}                              | ${ErrorMessages.MalformedFilterClause}
      ${`PROJECT first_name FILTER city = "Toronto"`}                | ${"filter clause column name does not exist"}            | ${ErrorMessages.UnknownFilterColumn("city")}
      ${`PROJECT first_name FILTER country ~ "Canada"`}              | ${"invalid filter clause operator"}                      | ${ErrorMessages.UnsupportedOperator}
      ${`PROJECT first_name FILTER age = "Adult"`}                   | ${"invalid filter clause comparison (number to string)"} | ${ErrorMessages.FilterTypeMismatch("age", "number", "string")}
      ${`PROJECT first_name FILTER country = 12`}                    | ${"invalid filter clause comparison (string to number"}  | ${ErrorMessages.FilterTypeMismatch("country", "string", "number")}
      ${`PROJECT first_name FILTER age = notanumber`}                | ${"number comparison with non-number value"}             | ${ErrorMessages.InvalidNumberValue("age")}
      ${`PROJECT first_name * last_name`}                            | ${"wildcard mixed in with column names"}                 | ${ErrorMessages.WildcardMixedIn}
    `("$description", ({ query, expectedError }) => {
      const result = parseQuery(query, datasetColumns);
      expect(result.error).toBe(expectedError);
    });
  });
});
