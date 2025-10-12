"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var express_2 = require("@trpc/server/adapters/express");
var node_1 = require("better-auth/node");
var trpc_js_1 = require("./trpc.js");
var index_js_1 = require("./routers/index.js");
var auth_js_1 = require("./auth.js");
var app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json());
app.all('/api/auth/*splat', (0, node_1.toNodeHandler)(auth_js_1.auth));
app.use("/api/trpc", (0, express_2.createExpressMiddleware)({
    router: index_js_1.appRouter,
    createContext: function (_a) {
        var req = _a.req, res = _a.res;
        return (0, trpc_js_1.createContext)({ req: req, res: res });
    },
}));
var port = process.env.PORT || 4000;
app.listen(port, function () {
    console.log("Server listening on", port);
});
