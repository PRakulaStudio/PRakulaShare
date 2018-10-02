import {DB, Keyword} from './prakula-core.mjs';

export default function init() {
	window.addEventListener('readystatechange', () => router(location.pathname));
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
	const structureConfig = loadRoutingConfig();
	const pathStructure = targetPath.split('/');
	/*pathStructure.reduce((structureNode, targetPath) => {
		if (!structureNode[targetPath]) return false;
	}, pathStructure);*/
	const workerResult = await pathStructure.reduce(pathStructureWorker, structureConfig);
	return await initRender(workerResult);
}

async function pathStructureWorker(parentNode, currentPath, index, pathStructure) {
	if (!parentNode) return false;
	const targetNode = parentNode[currentPath] || parentNode['*'];
	if (!targetNode) return parentNode;//{_result: parentResult};
	const parentResult = parentNode._result || null;
	targetNode._result = targetNode.handler ? await initStructureHandler(targetNode.handler, parentResult, currentPath, index, pathStructure) : parentResult;
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

export async function loadKeywordByPath(path) {
	const response = await fetch(`/api/keyword.json?path=${path}`);
	const result = await response.json();
	if (!result.status) return result.status;
	const keyword = new Keyword(result.data);
	return DB.keywords[keyword.id] = keyword;
}

async function initRender({_result = null, render: {type, path, method = 'default'}} = {}) {
	switch (type) {
		case 'module': {
			const module = await import(path);
			return await module[method](_result);
		}
		default:
			return _result;
	}
}