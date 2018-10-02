/* eslint-disable no-console */
import {loadKeywordByPath} from './prakula-share.mjs';
import {getElementsList, getParametersList} from './prakula-core.mjs';

export async function initKeyword(parentResult, currentPath, item, pathStructure) {
	return await loadKeywordByPath(pathStructure.join('/'));
}

export function renderKeywordPage(keywordData = {}) {
	try {
		document.title = genTitle(keywordData);
		const rootNode = document.body;
		rootNode.innerHTML = '';
		rootNode.appendChild(genPageHeader(keywordData));
		rootNode.appendChild(genPageElementsSection(keywordData));
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
	getElementsList().forEach(function (element) {
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

		output += `</div><a class="details-button" href="${location.pathname + '#' + element.id}">Подробнее</a></div>`;
	});
	return output + '</section>';
}