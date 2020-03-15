/* eslint-disable no-console */
/* eslint-disable no-debugger */

export default class Router {

	constructor() {
		this.prepareHooks();
		document.addEventListener('DOMContentLoaded', () => this.init(location));
		window.addEventListener('popstate', () => this.init(location));
	}

	async init(targetLocation = location) {
		// targetLocation = new URL('http://share/share/A-development.ru/kupit-ofis/КУПИТЬОФИСВКАЗАНИ/Казань/'); // TODO: Remove this
		const structureConfig = this.loadRoutingConfig();
		const pathStructure = targetLocation.path = targetLocation.pathname.replace(/\/$/, '').split('/').slice(1);
		let parentNode = structureConfig;

		for (const path of pathStructure) {
			parentNode = await this.pathStructureWorker(parentNode, path, targetLocation);
			console.debug(path, parentNode);
			if (parentNode.wrap) break;
		}
		await this.triggerHook('preRender', [parentNode, targetLocation]);
		const result = await this.initRender(parentNode, targetLocation);
		await this.triggerHook('postRender', [parentNode, targetLocation]);
		return result;
	}

	loadRoutingConfig() {
		return {
			share: {
				wrap: true,
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

	async pathStructureWorker(parentNode, currentPath, targetLocation) {
		parentNode = await parentNode;
		if (!parentNode) return false;
		const targetNode = parentNode[currentPath] || parentNode['*'];
		if (!targetNode) return parentNode;
		const parentResult = parentNode._result || null;
		targetNode._result = targetNode.handler ? await this.initStructureHandler(targetNode.handler, parentResult, currentPath, null, targetLocation) : parentResult;
		return targetNode;
	}

	async initStructureHandler({type, path, method = 'default'}, parentResult = null, currentPath = null, index = null, targetLocation = []) {

		try {
			switch (type) {
				case 'module': {
					const module = await import(path);
					return await module[method].call(this, parentResult, currentPath, index, targetLocation);
				}
				default:
					return parentResult;
			}
		} catch (e) {
			console.error(e);
			return parentResult;
		}
	}

	async initRender({_result = null, render: {type, path, method = 'default'} = {}} = {}, targetLocation = location) {
		try {
			switch (type) {
				case 'module': {
					const module = await import(path);
					return await module[method].call(this, _result, targetLocation);
				}
				default:
					return _result;
			}
		} catch (e) {
			console.error(e);
			return _result;
		}
	}

	regHook(hook, func, scope) {
		if (!this.hooks[hook]) return false;
		this.hooks[hook].push(new Hook(hook, func, scope));
	}

	triggerHook(hook, args) {
		if (!this.hooks[hook]) return false;
		this.hooks[hook].forEach(hookData => console.debug('[' + hook + '] ' + hookData.func.name + ': ' + hookData.func(...args)));
	}

	prepareHooks() {
		this.hooks = {preRender: [], postRender: []};
	}
}

class Hook {
	constructor(hook, func, scope = null) {
		this.hook = hook;
		this.func = scope ? func.bind(scope) : func;
	}
}