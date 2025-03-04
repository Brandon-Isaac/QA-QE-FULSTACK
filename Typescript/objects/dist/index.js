// type User = {
//   name: string;
//   email: string;
// }&BaseEntity;
const scores = {
    math: 95,
    english: 90,
};
scores.athletics = 100;
scores.french = 75;
scores.spanish = 70;
const configurations = {
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
export const hasKey = (obj, key) => {
    return obj.hasOwnProperty(key);
};
//# sourceMappingURL=index.js.map