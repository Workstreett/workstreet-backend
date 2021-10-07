const fs = require("fs");

const deletePost = (fileName, ind, withImage) => {
	var data = require(`./company_data/${fileName}.json`);
	if (ind >= data.length) {
		res.send("Error");
		return;
	}
	if (withImage) fs.unlinkSync(`./uploads/${data[ind].img}`);
	data.splice(ind, 1);
	fs.writeFileSync(`./company_data/${fileName}.json`, JSON.stringify(data));
};

const creatPost = (filename, obj, imageName) => {
	var data = require(`./company_data/${filename}.json`);
	data.push({
		title: obj.title,
		company: obj.company,
		desc: obj.desc,
		extra: obj.extra,
		url: obj.url,
		tags: obj.tags,
		compUrl: obj.compUrl,
		img: imageName,
	});
	fs.writeFileSync(`./company_data/${filename}.json`, JSON.stringify(data));
};

const deleteImageIfRequired = (filename, ind, company, title, image) => {
	var data = require(`./company_data/${filename}.json`);
	var obj = data[ind];
	let newImageName = " ";
	if (obj.company !== company || obj.title !== title) {
		if (typeof image !== "undefined") {
			fs.unlinkSync("./uploads/" + obj.img);
			newImageName = image.filename;
		} else {
			console.log("Renaming Image");
			const str = data[ind].img;
			const fileExtension = str.substring(str.lastIndexOf("."));
			newImageName = `${company}_${title}${fileExtension}`;
			fs.renameSync(
				`./company_data/${data[ind].img}`,
				`./company_data/${newImageName}`
			);
		}
	}
	return newImageName;
};

module.exports = { deletePost, creatPost, deleteImageIfRequired };
