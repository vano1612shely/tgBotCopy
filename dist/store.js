"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const sqlite_1 = require("@telegraf/session/sqlite");
const SQLiteStore = (0, sqlite_1.SQLite)({
    filename: "./telegraf-sessions.sqlite",
});
exports.store = {
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield SQLiteStore.get(key);
        });
    },
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield SQLiteStore.set(key, value);
        });
    },
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield SQLiteStore.delete(key);
        });
    },
};
