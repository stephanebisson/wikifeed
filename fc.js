const fetch = require('cross-fetch');
const fs = require("fs");

const CACHE_DIR = './fc_cache';
const FILE_OPTS = { encoding: 'utf-8' };

const fc = async function( key, url, opts, format ) {
	if (!fs.existsSync(CACHE_DIR)) {
	    fs.mkdirSync(CACHE_DIR)
	}
	const file = CACHE_DIR + '/' + key + '.cache';
	if (fs.existsSync(file)) {
		const text = fs.readFileSync(file, FILE_OPTS);
		return format === 'json' ? JSON.parse(text) : text;
	} else {
		const data = await fetch( url, opts ).then(res => format === 'json' ? res.json() : res.text());
		fs.writeFileSync(file, format === 'json' ? JSON.stringify(data) : data, FILE_OPTS);
		return data;
	}
}

module.exports = fc;
