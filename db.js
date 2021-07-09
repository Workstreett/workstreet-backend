const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	host: process.env.db_host,
	user: process.env.db_user,
	database: process.env.db_database,
	password: process.env.db_passwd,
	port: process.env.db_port,
	ssl: {
		rejectUnauthorized: false,
	},
});

// pool.query("SELECT * from users", (err, res) => {
// 	console.log(err, res);
// 	pool.end();
// });

module.exports = pool;
