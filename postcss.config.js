module.exports = {
	syntax: "postcss-scss",
	plugins: {
		"postcss-import": {},
		"autoprefixer": {
			browsers: ["last 2 versions","ie 11"]
		}
	}
};