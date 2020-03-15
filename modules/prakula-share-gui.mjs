/* eslint-disable no-console */
/* eslint-disable no-debugger */

import {loadKeywordByPath} from './prakula-share.mjs';
import {getElementsList, getParametersList} from './prakula-core.mjs';

export async function initKeyword(parentResult, currentPath, item, {path: targetPath}) {
	// const basePathDepth = targetPath.indexOf('share');
	// if (basePathDepth === -1) return console.error('Share base path not found');
	const sharePath = targetPath;//.slice(0);
	if (getElementsList()[sharePath.slice(-1).pop()])
		this.regHook('postRender', function (keywordData, targetLocation) {
			renderElementSection(this.targetElement, keywordData._result, targetLocation);
		}, {targetElement: sharePath.pop()});
	return await loadKeywordByPath(sharePath.join('/'));
}

export function renderKeywordPage(keywordData = {}, targetLocation = location) {
	try {
		if (!keywordData) return renderErrorPage({
			title: 'Нет данных',
			message: '<h1>Не удалось найти данные для запрошенной страницы</h1><h2>Проверьте корректность адреса или повторите запрос позднее</h2>'
		});
		document.title = genTitle(keywordData);
		const rootNode = document.body;
		rootNode.innerHTML = '';
		rootNode.appendChild(genPageHeader(keywordData));
		rootNode.appendChild(genPageElementsSection(keywordData));
		// if (targetLocation.hash) ;
	} catch (e) {
		console.error(e);
	}

}

function genTitle(keywordData) {
	if (!keywordData.domain) throw new Error('Domain not specified in Keyword Data');
	return `SEO Рекомендации для сайта ${capitalizeFirstLetter(keywordData.domain)}`;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function genPageHeader(keywordData) {
	const headerNode = document.createElement('header');
	headerNode.innerHTML = `<header>
    <h2 class="url-section caption-bottom">
        <span class="caption">Адрес страницы </span>
        <span class="path">
            ${genUrlPath(keywordData)}
        </span>
    </h2>
    <div class="title-section">
        <h1 class="keyword-section caption-bottom">
            <span class="caption">Поисковый запрос </span>
            <span class="keyword">${keywordData.title}</span>
        </h1>
        <div class="rating-section caption-bottom">
            <span class="caption"> Место в <span class="yandex-letter">Я</span>ндекс</span>
            <span class="position">${keywordData.position < 1 ? '50+' : keywordData.position}</span>
        </div>
    </div>
</header>`;
	return headerNode;
}

function genUrlPath(keywordData) {
	let output = `<span>${capitalizeFirstLetter(keywordData.domain)}</span>`;
	let urlPath = new URL(keywordData.url).pathname;
	if (urlPath.length > 0 && urlPath !== '/')
		urlPath.split('/').forEach(function (pathNode) {
			if (pathNode.length > 0) output += `<span>${pathNode}</span> `;
		});
	return output;
}

function genPageElementsSection(keywordData) {
	const elementsSection = document.createElement('main');
	elementsSection.className = `elements`;
	elementsSection.innerHTML = genElementsGroup(keywordData, 'base');
	return elementsSection;
}

function genElementsGroup(keywordData, type = 'base') {
	let output = `<h3 class="title">Базовые параметры: </h3><section class="group">`;
	getElementsList(true).forEach(function (element) {
		if (!keywordData.elements[element.id]) return;
		const elementData = keywordData.elements[element.id];
		output += `<div class="element-section">
            <div class="content-section">
                <h4 class="title caption-left">
                    <span class="caption">${element.caption}</span>
                    <span class="tag${elementData.process < 0.3 ? ' red' : ''}">${element.id}</span>
                </h4>`;
		getParametersList().forEach(function (parameter) {
			if (!elementData[parameter.id]) return;
			const parameterData = keywordData.elements[element.id][parameter.id];

			let multiplier = parameter.multiplier ? parameter.multiplier : 1;
			let symbol = parameter.symbol ? parameter.symbol : '';
			let currentValue = Math.round(parameterData.value * multiplier) + symbol;
			let targetValue = Math.round(parameterData.dispersion.average * multiplier) + symbol;
			output += `<div>
                    <span>${parameter.caption} </span>
                    <span>`;
			if (parameterData.process < 0.8) {
				output += `<span class="red">${currentValue}</span> -> `;
				output += `<span class="green">${targetValue}</span>`;
			} else output += `<span class="green">${currentValue}</span>`;
			output += `</span>
                </div>`;
		});

		output += `</div><a class="details-button" href="${getLink('./' + element.id + '/')}">Подробнее</a></div>`;
	});
	return output + '</section>';
}

function renderElementSection(targetElement = null, keywordData = {}, targetLocation = location) {
	console.debug(targetElement, keywordData, targetLocation);
	const elementData = keywordData.elements[targetElement];
	const element = getElementsList()[targetElement];
	let wrapper = document.getElementById('element');
	if (!wrapper) {
		wrapper = document.createElement('div');
		wrapper.id = 'element';
		wrapper.className = 'modal-wrapper';
		document.body.appendChild(wrapper);
	}
	wrapper.innerHTML = `<div class="content-section">
        <h4 class="title caption-left">
            <span class="caption">${element.caption}</span>
            <span class="tag">${element.id}</span>
        </h4>
        <div class="parameters-section">${genElementParameters(elementData)}</div>
        <a class="close" href="${getLink('..')}">Закрыть</a>
    </div>
    <a class="backdrop-close" href="${getLink('..')}">Вернутся к списку параметров</a>`;
}

function genElementParameters(elementData) {
	let output = '';
	getParametersList().forEach(function (parameter) {
		const parameterData = elementData[parameter.id];
		let multiplier = parameter.multiplier ? parameter.multiplier : 1;
		let symbol = parameter.symbol ? parameter.symbol : '';
		let currentValue = Math.round(parameterData.value * multiplier) + symbol;
		let minValue = Math.round(parameterData.dispersion.min * multiplier) + symbol;
		let targetValue = Math.round(parameterData.dispersion.average * multiplier) + symbol;
		let maxValue = Math.round(parameterData.dispersion.max * multiplier) + symbol;
		output += `<div class="parameter">
                <div class="title">${parameter.caption}</div>
                <div class="content">
                    <div>Текущее значение: <span class="red">${currentValue}</span></div>
                    <div>Рекомендуемое: <span class="green">${targetValue}</span></div>
                    <div><span>Мин: ${minValue}</span><span>Макс: ${maxValue}</span></div>
                    <div>Содержит: <span>${elementData.value}</span></div>
                    <div></div>
                </div>
            </div>`;
	});
	return output;
}

function renderErrorPage({title = '', message = ''}) {
	document.title = title;
	document.body.innerHTML = message;
}

function getLink(path) {
	let pathname = location.pathname;
	if (location.pathname.substr(-1) !== '/') pathname += '/';
	const url = location.protocol + '//' + location.host + pathname + location.search + location.hash;
	return new URL(path, url).pathname;
}

async function genChart() {
	const module = await import('/node_modules/chart.js/dist/Chart.bundle.js'); // TODO: Replace by ESM version for Node
	return new Chart();
}