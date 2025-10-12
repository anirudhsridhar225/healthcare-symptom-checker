"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
var trpc_js_1 = require("../trpc.js");
var authRouter_js_1 = require("./authRouter.js");
var llmRouter_js_1 = require("./llmRouter.js");
var userRouter_js_1 = require("./userRouter.js");
exports.appRouter = (0, trpc_js_1.router)({
    auth: authRouter_js_1.authRouter,
    llm: llmRouter_js_1.llmRouter,
    user: userRouter_js_1.userRouter,
});
