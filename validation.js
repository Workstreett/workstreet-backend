const pool = require("./db");
require("dotenv").config();

let userDetail = {};
const isUsernameValid = async (username) => {
	try {
		//change table name accordingly
		let res = await pool.query("SELECT * FROM wk_table where username = $1", [
			username,
		]);
		console.log(res);
		userDetail = res.rows[0];
		
		if (userDetail.user_id == undefined) {
			return true;
		} else {
			return false;
		}
	} catch (err) {
		throw Error("Sorry the database can't be connected right now");
	}
};

const hashPassword = (passwd) => {
	passwd += process.env.passwd_salt;
	passwd = Buffer.from(passwd).toString("base64");
	let hashedPsswd = crypto.createHash("sha256").update(passwd).digest("hex");
	return hashedPsswd;
};

const test = async () => {
	valid = await isUsernameValid("pradeopsh2203");
	if (valid) {
		console.log("Username is not in the database");
	} else {
		console.log("Username exists choose another one");
		console.log(userDetail);
	}
};

test();
module.exports = { isUsernameValid, hashPassword };
