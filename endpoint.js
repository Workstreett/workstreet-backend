const validation = require("./validation.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const encrypt = (plainText) => {
	const cipher = crypto.createCipheriv(
		"aes-256-gcm",
		Buffer.from(process.env.AES_SECRET_KEY, "hex"),
		Buffer.from(process.env.AES_IV, "hex")
	);
	let encryptedData = cipher.update(plainText, "utf-8", "hex");
	return encryptedData;
};

const decrypt = (cryptedText) => {
	const decipher = crypto.createDecipheriv(
		"aes-256-gcm",
		Buffer.from(process.env.AES_SECRET_KEY, "hex"),
		Buffer.from(process.env.AES_IV, "hex")
	);

	let data = decipher.update(cryptedText, "hex", "utf-8");

	return data;
};

const validPassword = (password) => {
	// console.log(`batao bro ${password} `);
	if (typeof password != "string") {
		throw Error("Password is not a string");
	}
	if (
		password.length > 6 &&
		/[0-9]/.test(password) &&
		/[a-z]/.test(password) &&
		/[A-Z]/.test(password) &&
		/[^A-Za-z0-9]/.test(password)
	) {
		return true;
	} else {
		return false;
	}
};

const mailer = (user_details) => {
	//  Step-1 create a transporter
	const transporter = nodemailer.createTransport({
		host: "smtp.workstreet.tech",
		port: 25,
		secure: false,
		requireTLS: false,
		ignoreTLS: true,
		auth: {
			user: process.env.Mail_Id,
			pass: process.env.Mail_Passwd,
		},
	});
	// Step-2 create the mail body
	var token = jwt.sign(user_details, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "1 days",
	});
	token = encrypt(token);
	//console.log(token);

	let mail_body = {
		from: `Team Workstreet 🤖 <${process.env.Mail_Id}>`,
		to: `${user_details.officialmailid}`,
		subject: "Verify your workstreet account",
		html: `<h1>Hello from Team Workstreet</h1>
		<p>Please visit the link given below to verify your account: </p>
		<p>https://workstreet.herokuapp.com/verify/${token}</p>`,
	};

	// Step-3 send the mail............................
	transporter.sendMail(mail_body, (err, data) => {
		if (err) {
			console.log(err.message);
			throw Error("The mail can't be send");
		} else {
			console.log("Mail Sent!!!");
		}
	});
	// token = decrypt(token);
	// console.log(token);
};

const signUpChecker = async (obj) => {
	try {
		let temp = await validation.isUsernameValid(obj.username);
		let temp2 = await validation.isMaildValid(obj.officialmailid);
		if (temp !== undefined) return -1;
		if (!validPassword(obj.password)) return -2;
		if (!temp2) return -3;
		return 1;
	} catch (err) {
		throw Error("katgaya");
	}
};

//simply for testing
const test = () => {
	valid = validPassword(1231231);
	if (valid) {
		console.log("cheers");
	} else {
		console.log("password not satisfy conditions");
	}
};
//test();
module.exports = { validPassword, signUpChecker, mailer, encrypt, decrypt };
