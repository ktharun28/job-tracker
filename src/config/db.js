const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "job_tracker",
    password: "hello2005",
    port: 5432
});

module.exports = pool;