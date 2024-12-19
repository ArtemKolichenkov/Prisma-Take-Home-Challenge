import { Dataset, DatasetItemColumn } from "./types.js";

export const john = {
  first_name: "John",
  last_name: "Doe",
  age: 27,
  country: "Canada",
};
export const jane = {
  first_name: "Jane",
  last_name: "Doe",
  age: 17,
  country: "United Kingdom",
};
export const billy = {
  first_name: "Billy",
  last_name: "Joel",
  age: 19,
  country: "United Kingdom",
};
export const maria = {
  first_name: "Maria",
  last_name: "Kirby",
  age: 27,
  country: "Australia",
};
export const george = {
  first_name: "George",
  last_name: "Owens",
  age: 33,
  country: "United States of America",
};
export const dataset: Dataset = [john, jane, billy, maria, george];
export const datasetColumns: DatasetItemColumn[] = [
  { name: "first_name", type: "string" },
  { name: "last_name", type: "string" },
  { name: "age", type: "number" },
  { name: "country", type: "string" },
];
