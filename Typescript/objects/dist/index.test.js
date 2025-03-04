import { hasKey } from "./index";
describe("hasKey", () => {
    test("returns true if the object has the key", () => {
        const obj = { name: "Alice", age: 30 };
        expect(hasKey(obj, "name")).toBe(true);
    });
    test("returns false if the object does not have the key", () => {
        const obj = { name: "Alice", age: 30 };
        expect(hasKey(obj, "address")).toBe(false);
    });
});
//# sourceMappingURL=index.test.js.map