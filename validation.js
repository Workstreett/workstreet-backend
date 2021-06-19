const pool = require("./db");
const fs = require("fs");
require("dotenv").config();

let userDetail = {};
const isUsernameValid = async (username) => {
	try {
		//change table name accordingly
		let res = await pool.query(
			"SELECT * FROM wk_table where username = $1",
			[username]
		);
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

const searchForDomain = async (filename, domain) => {
	var domains = [];
	domains = fs.readFileSync(filename, "utf-8").toString().split("\r\n");
	for (let i = 0; i < domains.length; i++) {
		if (domains[i].localeCompare(domain) === 0) return true;
	}
	return false;
};

const isMaildValid = async (mailId) => {
	let ind = mailId.indexOf("@");
	if (ind == -1) return false;
	mailId = mailId.substring(ind);
	let found = await searchForDomain("./mail_data/IIT_Domains.txt", mailId);
	if (found == true) return true;
	found = await searchForDomain("./mail_data/IIIT Domain.txt", mailId);
	if (found == true) return true;
	found = await searchForDomain("./mail_data/NIT Domain.txt", mailId);
	return found;
};

const test = async () => {
	var valid = await isMaildValid("pradeeps.asdasafsdj.@iiitp.ac.in");
	if (valid) {
		console.log("The mail id is valid");
	} else {
		console.log("The mail id is not valid");
	}
};

test();

module.exports = { isUsernameValid, hashPassword };
