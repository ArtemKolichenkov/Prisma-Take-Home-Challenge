import { CSVParsingErrors, parseCsv } from "./parseCsv.js";

describe("parseCsv", () => {
  it("parses valid csv file", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/organizations-5.csv",
    );
    expect(error).toBeNull();
    expect(columns).toStrictEqual([
      { name: "index", type: "number" },
      { name: "organization_id", type: "string" },
      { name: "name", type: "string" },
      { name: "website", type: "string" },
      { name: "country", type: "string" },
      { name: "description", type: "string" },
      { name: "founded", type: "number" },
      { name: "industry", type: "string" },
      { name: "number_of_employees", type: "number" },
    ]);
    expect(data).toStrictEqual([
      {
        index: 1,
        organization_id: "FAB0d41d5b5d22c",
        name: "Ferrell LLC",
        website: "https://price.net/",
        country: "Papua New Guinea",
        description: "Horizontal empowering knowledgebase",
        founded: 1990,
        industry: "Plastics",
        number_of_employees: 3498,
      },
      {
        index: 2,
        organization_id: "6A7EdDEA9FaDC52",
        name: "Mckinney, Riley and Day",
        website: "http://www.hall-buchanan.info/",
        country: "Finland",
        description: "User-centric system-worthy leverage",
        founded: 2015,
        industry: "Glass / Ceramics / Concrete",
        number_of_employees: 4952,
      },
      {
        index: 3,
        organization_id: "0bFED1ADAE4bcC1",
        name: "Hester Ltd",
        website: "http://sullivan-reed.com/",
        country: "China",
        description: "Switchable scalable moratorium",
        founded: 1971,
        industry: "Public Safety",
        number_of_employees: 5287,
      },
      {
        index: 4,
        organization_id: "2bFC1Be8a4ce42f",
        name: "Holder-Sellers",
        website: "https://becker.com/",
        country: "Turkmenistan",
        description: "De-engineered systemic artificial intelligence",
        founded: 2004,
        industry: "Automotive",
        number_of_employees: 921,
      },
      {
        index: 5,
        organization_id: "9eE8A6a4Eb96C24",
        name: "Mayer Group",
        website: "http://www.brewer.com/",
        country: "Mauritius",
        description: "Synchronized needs-based challenge",
        founded: 1991,
        industry: "Transportation",
        number_of_employees: 7870,
      },
    ]);
  });
  it("returns error if file is not found", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/invalid/doesnotexist.csv",
    );
    expect(data).toStrictEqual([]);
    expect(columns).toStrictEqual([]);
    expect(error).not.toBeNull();
  });
  it("returns error if file has less than 2 rows", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/invalid/emptyfile.csv",
    );
    expect(data).toStrictEqual([]);
    expect(columns).toStrictEqual([]);
    expect(error).toBe(CSVParsingErrors.NotEnoughRows);
  });
  it("returns error if headers have duplicates", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/invalid/duplicateHeaders.csv",
    );
    expect(data).toStrictEqual([]);
    expect(columns).toStrictEqual([]);
    expect(error).toBe(CSVParsingErrors.DuplicateHeaders);
  });
  it("returns error if there are no data rows (e.g. empty rows)", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/invalid/emptyDataRows.csv",
    );
    expect(data).toStrictEqual([]);
    expect(columns).toStrictEqual([]);
    expect(error).toBe(CSVParsingErrors.NoDataRows);
  });
  it("returns error if a row has more columns than headers", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/invalid/cellMismatch.csv",
    );
    expect(data).toStrictEqual([]);
    expect(columns).toStrictEqual([]);
    expect(error).toBe(CSVParsingErrors.CellsMismatch("John, Doe, 24, Canada"));
  });
  it("returns error if a column has type mismatch between rows", async () => {
    const { data, columns, error } = await parseCsv(
      "sampleFiles/invalid/columnTypeMismatch.csv",
    );
    expect(data).toStrictEqual([]);
    expect(columns).toStrictEqual([]);
    expect(error).toBe(
      CSVParsingErrors.TypeMismatch(
        "age",
        "number",
        "string",
        "Jane, Doe, Canada",
      ),
    );
  });
});
