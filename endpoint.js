var validation = require("./validation.js");

const validPassword = (password) => {
	console.log(`batao bro ${password} `);
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

const signUpChecker = async (obj) => {
	try {
		let temp = await validation.isUsernameValid(obj.username);
		console.log(obj.officialmailid);
		let temp2 = await validation.isMaildValid(obj.officialmailid);
		console.log(obj.password);
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
module.exports = { validPassword, signUpChecker };
