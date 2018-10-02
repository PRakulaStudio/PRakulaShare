/* eslint-disable no-console */
import {DB, Keyword} from './prakula-core.mjs';

export default function init() {
	document.addEventListener('DOMContentLoaded', () => router(location.pathname));
	window.addEventListener('popstate', () => router(location.pathname));
}

function loadRoutingConfig() {
	return {
		share: {
			handler: {
				type: 'module',
				path: './prakula-share-gui.mjs',
				method: 'initKeyword'
			},
			render: {
				type: 'module',
				path: './prakula-share-gui.mjs',
				method: 'renderKeywordPage'
			}
		}
	};
}

async function router(targetPath) {
	targetPath = '/share/A-development.ru/kupit-ofis/КУПИТЬОФИСВКАЗАНИ/Казань#h1';
	const structureConfig = loadRoutingConfig();
	const pathStructure = targetPath.split('/').slice(1);
	let parentNode = structureConfig;
	for (const path of pathStructure) {
		parentNode = await pathStructureWorker(parentNode, path, pathStructure);
	}
	return await initRender(parentNode);
}

async function pathStructureWorker(parentNode, currentPath, pathStructure) {
	parentNode = await parentNode;
	if (!parentNode) return false;
	const targetNode = parentNode[currentPath] || parentNode['*'];
	if (!targetNode) return parentNode;
	const parentResult = parentNode._result || null;
	targetNode._result = targetNode.handler ? await initStructureHandler(targetNode.handler, parentResult, currentPath, null, pathStructure) : parentResult;
	return targetNode;
}

async function initStructureHandler({type, path, method = 'default'}, parentResult = null, currentPath = null, index = null, pathStructure = []) {
	switch (type) {
		case 'module': {
			const module = await import(path);
			return await module[method](parentResult, currentPath, index, pathStructure);
		}
		default:
			return parentResult;
	}
}

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
	const response = await fetch(`/api/keyword.json?path=${path}`);
	const result = await response.json();
	if (!result.status) return result.status;
	const keyword = new ShareKeyword(result.data);
	return DB.keywords[keyword.id] = keyword;
}

async function initRender({_result = null, render: {type, path, method = 'default'}} = {}) {
	try {
		switch (type) {
			case 'module': {
				const module = await import(path);
				return await module[method](_result);
			}
			default:
				return _result;
		}
	} catch (e) {
		console.error(e);
		return _result;
	}
}