/* eslint-disable no-console */
/* eslint-disable no-debugger */

import {DB, Keyword} from './prakula-core.mjs';
import Router from './prakula-router.mjs';

new Router();

export class ShareKeyword extends Keyword {
	constructor(keywordData) {
		super(keywordData);
		this.domain = keywordData.domain;
		this.url = keywordData.url;
		this.parent = keywordData.parent;
		this.region = keywordData.region;
		this.status = keywordData.status;
		this.process = keywordData.process;
		return this;
	}
}

export async function loadKeywordByPath(path) {
	try {
		const response = await fetch(`https://prakula.ru/prakula/api.php?method=getShareByPath&path=${path}`);
		const result = await response.json();
		if (!result.status) return result.status;
		const keyword = new ShareKeyword(result.data);
		return DB.keywords[keyword.id] = keyword;
	} catch (e) {
		console.error(e);
		return false;
	}
}

