"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
var better_auth_1 = require("better-auth");
var drizzle_1 = require("better-auth/adapters/drizzle");
var db_js_1 = require("./db.js");
var schema = require("./schema.js");
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, drizzle_1.drizzleAdapter)(db_js_1.db, {
        provider: "pg",
        schema: {
            user: schema.user,
            queries: schema.queries
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
});
