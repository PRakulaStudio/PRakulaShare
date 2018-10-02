/* eslint-disable no-console */
export const DB = {
	keywords: new Proxy({}, {
		async get(keywords, id) {
			if (id in keywords) return keywords[id];
			return await loadKeywordById(id);
		}
	})
};

/*async function loadKeywordById(id) {
	return fetch(`/api/keyword.json?id=${id}`)
		.then(response => response.json())
		.then(result => {
			if (!result.status) return result.status;
			const keyword = new Keyword(result.data);
			return DB.keywords[keyword.id] = keyword;
		})
		.catch((error) => {
			console.error(error);
			return false;
		});
}*/

async function loadKeywordById(id) {
	try {
		const response = await fetch(`/api/keyword.json?id=${id}`);
		const result = await response.json();
		if (!result.status) return result.status;
		const keyword = new Keyword(result.data);
		return DB.keywords[keyword.id] = keyword;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export class Keyword {
	constructor({id, title, position, urlId, elements} = {}) {
		this.id = id;
		this.title = title;
		this.position = position;
		this.urlId = urlId;
		this.elements = elements;
		return this;
	}
}
