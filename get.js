#!/usr/local/bin/node

const cheerio = require('cheerio')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fc = require('./fc')

const fetchOpts = {
	headers: {'User-Agent': 'Today/0.1.0 (https://github.com/today/; today@gmail.com)'}
}

let id = 1
const nextId = () => id++

function extract(li) {
    const text = li.textContent
    const dashIndex = text.indexOf('–')
    const parts = text.split('–')
    const year = text.substr(0, dashIndex).trim()
    const caption = text.substr(dashIndex+2).trim().replace(/\[\d*\]/g, '')
    return [year, caption]
}

async function searchCommons(lang, query) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&uselang=${lang}&generator=search&gsrsearch=filetype%3Abitmap%7Cdrawing%20${encodeURIComponent(query)}&gsrlimit=40&gsroffset=0&gsrinfo=totalhits%7Csuggestion&gsrprop=snippet&prop=imageinfo&gsrnamespace=6&iiprop=url%7Cextmetadata&iiurlheight=180&iiextmetadatafilter=License%7CLicenseShortName%7CImageDescription%7CArtist&iiextmetadatalanguage=${lang}`
    const key = `${lang}-commons-${query}`;
    const data = await fc(key, url, fetchOpts, 'json')
    return Object.values(data?.query?.pages || {}).map(p => {
        const info = p.imageinfo[0];
        const urls = info.responsiveUrls;
        return {
            articleTitle: p.title,
            img: urls && urls['1.5'],
            text: p.snippet,
            link: info.descriptionurl,
            id: nextId()
        }
    });
}

async function parseLineEvents(li, lang) {
    const [year, caption] = extract(li)
	const response = [ {
        title: year,
        text: caption,
        link: '',
        img: '',
        id: nextId()
    } ]
	const wikiLinks = Array.from(li.querySelectorAll('a[rel="mw:WikiLink"]'))
	let link
	for (var i = 1; i < wikiLinks.length; i++) {
		link = await parseWikiLink(wikiLinks[i], lang)
		if (link) {
			response.push(link)
		}
	}
    if (response.length >= 2) {
        response[0].img = response[1].img;
        response[0].link = response[1].link;
        const suggested = await getSuggestedArticles('en', response[1].articleTitle);
        for (var j = 0; j < suggested.length; j++) {
            let summary = await getSummary(lang, suggested[j].title)
            if (summary) {
                response.push(summary);
            }
        }
        return response;
    }
}

function extractOtherYear(caption) {
    const match = caption.match(/.*\(\w\.\s(.*)\)/)
    if (match) {
        const otherYear = match[1]
        const c = caption.replace(/\(.*\)$/, '')
        return [c, otherYear]
    }
    return [caption]
}

async function parseLineBirthsDeaths(li, lang) {
    const [year, c] = extract(li)
    const [caption, otherYear] = extractOtherYear(c)
    const response = [ {
        title: year + (otherYear ? ` – ${otherYear}` : ''),
        text: caption,
        link: '',
        img: '',
        id: nextId()
    } ]
    const wikiLinks = Array.from(li.querySelectorAll('a[rel="mw:WikiLink"]'))
    let link
    for (var i = 1; i < wikiLinks.length; i++) {
        link = await parseWikiLink(wikiLinks[i], lang)
        if (link) {
            response.push(link)
        }
    }
    if (response.length >= 2) {
        response[0].img = response[1].img;
        response[0].link = response[1].link;
        // const commons = await searchCommons(lang, response[1].articleTitle);
        // commons.forEach(c => response.push(c));
        return response
    }
}

const defautParams = {
  format: 'json',
  formatversion: 2,
  origin: '*'
}

const buildMwApiUrl = (lang, params) => {
  params = Object.assign({}, defautParams, params)
  const baseUrl = `https://${lang}.wikipedia.org/w/api.php`
  return baseUrl + '?' + Object.keys(params).map(p => {
    return `${p}=${encodeURIComponent(params[p])}`
  }).join('&')
}

async function getSuggestedArticles(lang, title) {
    const params = {
        action: 'query',
        prop: 'pageimages|description',
        piprop: 'thumbnail',
        pithumbsize: 160,
        pilimit: 3,
        generator: 'search',
        gsrsearch: `morelike:${title}`,
        gsrnamespace: 0,
        gsrlimit: 3,
        gsrqiprofile: 'classic_noboostlinks',
        uselang: 'content'
    }

    const url = buildMwApiUrl(lang, params)
    const key = `${lang}-morelike-${title}`
    const data = await fc(key, url, fetchOpts, 'json')
    return data?.query?.pages
}

async function getSummary(lang, title) {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const key = `${lang}-page-summary-${title}`
    const summary = await fc(key, url, fetchOpts, 'json')
    if (summary.thumbnail) {
        return {
            articleTitle: summary.titles.canonical,
            img: summary.thumbnail?.source,
            text: summary.extract_html,
            link: summary.content_urls.mobile.page,
            id: nextId()
        }
    }
}

async function parseWikiLink(a, lang) {
	const title = a.getAttribute('href').substr(2)
	return getSummary(lang, title)
}

async function today (day, month, lang) {
    const response = []
	const url = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${month}_${day}`
	const key = `${lang}-page-html-${month}_${day}`
	const data = await fc(key, url, fetchOpts, 'text')
	const dom = new JSDOM(data)
	const sections = Array.from(dom.window.document.querySelectorAll('body > section'))
    for (var i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTitle = section.querySelector('h2')?.textContent
        if (!sectionTitle) {
            continue;
        }
        const lis = Array.from(section.querySelectorAll('ul > li'))
        for (var j = 0; j < lis.length; j++) {
            if (sectionTitle === 'Events') {
                const line = await parseLineEvents(lis[j], lang)
                if (line) {
                    response.push(line)
                }

            } else if (sectionTitle === 'Births' || sectionTitle === 'Deaths') {
                const line = await parseLineBirthsDeaths(lis[j], lang)
                if (line) {
                    response.push(line)
                }
            }
        }
    }
    return response
}

async function main() {
	const resp = await today(12, 'October', 'en')
	console.log(JSON.stringify(resp, null, 4))
}

main()
