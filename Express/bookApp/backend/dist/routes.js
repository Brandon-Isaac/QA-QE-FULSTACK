"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookRouter = void 0;
const express_1 = __importDefault(require("express"));
const books_1 = require("./books");
exports.bookRouter = express_1.default.Router();
exports.bookRouter.get("/", (req, res) => {
    const books = (0, books_1.getBooks)(req.query);
    res.json(books);
});
