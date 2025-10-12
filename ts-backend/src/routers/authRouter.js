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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var zod_1 = require("zod");
var auth_js_1 = require("../auth.js");
var trpc_js_1 = require("../trpc.js");
exports.authRouter = (0, trpc_js_1.router)({
    health: trpc_js_1.publicProcedure.query(function () { return ({ status: "ok" }); }),
    signUp: trpc_js_1.publicProcedure
        .input(zod_1.z.object({ name: zod_1.z.string(), email: zod_1.z.email(), password: zod_1.z.string().min(8).max(128) }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var user;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, auth_js_1.auth.api.signUpEmail({
                        body: {
                            name: input.name,
                            email: input.email,
                            password: input.password,
                        }
                    })];
                case 1:
                    user = _c.sent();
                    return [2 /*return*/, { user: user }];
            }
        });
    }); }),
    signIn: trpc_js_1.publicProcedure
        .input(zod_1.z.object({ email: zod_1.z.email(), password: zod_1.z.string().min(8).max(128) }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var session;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, auth_js_1.auth.api.signInEmail({
                        body: {
                            email: input.email,
                            password: input.password,
                        }
                    })];
                case 1:
                    session = _c.sent();
                    return [2 /*return*/, { session: session }];
            }
        });
    }); }),
    me: trpc_js_1.publicProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return { user: ctx.user || null };
    })
});
