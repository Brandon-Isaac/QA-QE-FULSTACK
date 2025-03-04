// type User = {
//   name: string;
//   email: string;
// }&BaseEntity;

// type Product = {
//   name: string;
//   price: number;
// }& BaseEntity;

interface WithId {
  id: string;
}
interface WithCreatedAt {
  createdAt: Date;
}
interface User extends WithId, WithCreatedAt {
  name: string;
  email: string;
}
interface Product extends WithId, WithCreatedAt {
  name: string;
  price: number;
}

// const scores: { [key: string]: number } = {};

// scores.math = 95;
// scores.english = 90;
// scores.science = 85;
// console.log(scores);

interface Scores {
  [key: string]: number;
}

const scores: Scores = {
  math: 95,
  english: 90,
};

scores.athletics = 100;
scores.french = 75;
scores.spanish = 70;
// console.log(scores);

type Environment = "development" | "production" | "staging";

type Configurations = Record<
  Environment,
  {
    apiBaseUrl: string;
    timeout: number;
  }
>;
const configurations: Configurations = {
  development: {
    apiBaseUrl: "http://localhost:8080",
    timeout: 5000,
  },
  production: {
    apiBaseUrl: "https://api.example.com",
    timeout: 10000,
  },
  staging: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
  },

  // @ts-expect-error
  notAllowed: {
    apiBaseUrl: "https://staging.example.com",
    timeout: 8000,
  },
};

export const hasKey = (obj: object, key: string) => {
  return obj.hasOwnProperty(key);
};
