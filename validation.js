const pool = require("./db");
const fs = require("fs");
require("dotenv").config();
var endPoint=require("./endpoint")
const crypto=require("crypto")

const isUsernameValid = async (username) => {
	try {
		//change table name accordingly
		//let table=process.env.db_table;
		let res = await pool.query("SELECT * FROM users where username = $1", [
		 username,
		]);
		// console.log(res);
		
		
		return res.rows[0];
	} catch (err) {
		throw Error("Sorry the database can't be connected right now");
	}
};
const signUpChecker = async (obj)=>{
	try{
		let temp=await isUsernameValid(obj.username);
		console.log(obj.officialmailid);
		let temp2= await isMaildValid(obj.officialmailid);

		//console.log(`dedo output ${temp}`);
		//console.log(`dedo output pls ${temp2}`);
        console.log(obj.password);
		if( temp !== undefined) return -1;
		if(!endPoint.validPassword(obj.password)) return -2;
		if(!temp2) return -3;
		return 1; 
	}
	catch(err){
		throw Error("katgaya");
	}
}
const hashPassword = (passwd) => {
	passwd += process.env.passwd_salt;
	passwd = Buffer.from(passwd).toString("base64");
	let hashedPsswd = crypto.createHash("sha256").update(passwd).digest("hex");
	return hashedPsswd;
};

const searchForDomain = async (filename, domain) => {
	try{
		var domains = [];
		domains = fs.readFileSync(filename, "utf-8").toString().split("\r\n");
		for (let i = 0; i < domains.length; i++) {
			if (domains[i].localeCompare(domain) === 0) return true;
		}
		return false;
    }
	catch(err){
		throw Error("mail func error")
	}
};

const isMaildValid = async (mailId) => {
	let ind = mailId.indexOf("@");
	if (ind == -1) return false;
	mailId = mailId.substring(ind);
	console.log(mailId);
	let found = await searchForDomain("./mail_data/IIT_Domains.txt", mailId);
	if (found == true) return true;
	found = await searchForDomain("./mail_data/IIIT Domain.txt", mailId);
	if (found == true) return true;
	found = await searchForDomain("./mail_data/NIT Domain.txt", mailId);
	return found;
};

const test = async () => {
	var valid = await isUsernameValid("lol");
	if (valid === undefined) {
		console.log("User Not Found");
	} else {
		console.log(valid);
	}
};

//test();

module.exports = { isUsernameValid, hashPassword, isMaildValid, signUpChecker };
