/* eslint-disable no-console */

export const DB = {
	keywords: new Proxy({}, {
		async get(keywords, id) {
			if (id in keywords) return keywords[id];
			return await loadKeywordById(id);
		}
	})
};

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

export function getElementsList(array = false) {
	if (array) return [
		{id: 'h1', caption: 'Заголовок первого уровня'},
		{id: 'h2', caption: 'Заголовок второго уровня'},
		{id: 'title', caption: 'Основной заголовок'},
	];
	else return {
		h1: {id: 'h1', caption: 'Заголовок первого уровня'},
		h2: {id: 'h2', caption: 'Заголовок второго уровня'},
		title: {id: 'title', caption: 'Основной заголовок'},
	};
}

export function getParametersList() {
	return [
		{id: 'length', caption: 'Общая длинна'},
		{id: 'cs', caption: 'Среднее % содержание', multiplier: 100, symbol: '%'},
	];
}