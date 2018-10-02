// import {DB} from './prakula-core.mjs';
import {loadKeywordByPath} from './prakula-share.mjs';

export async function initKeyword(parentResult, currentPath, item, pathStructure) {
	return await loadKeywordByPath(pathStructure.join('/'));
}

export async function renderKeywordPage(keywordData = {}) {
	document.title = genTitle(keywordData);
	const rootNode = document.body;
	rootNode.innerHTML = '';
	rootNode.appendChild(genPageHeader(keywordData));
	rootNode.appendChild(genPageElementsSection(keywordData));
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
	return elementsSection;
}