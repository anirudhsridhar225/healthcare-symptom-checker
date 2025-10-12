"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var pg_1 = require("pg");
var node_postgres_1 = require("drizzle-orm/node-postgres");
var schema = require("./schema.js");
var pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
exports.db = (0, node_postgres_1.drizzle)({ client: pool, schema: schema });
