const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const getContainerIP = require('./get-container-ips');

const BASE_URL = 'https://www.amazon.com/dp';
//onst asin = 'B002QYW8LW';

const getPageData = async (asin) => {
    const chrome = await getContainerIP('chrome');

    const response = await fetch(`http://${chrome}:9222/json/list`, { json: true });
    const data = await response.json();
    const webSocket = data[0].webSocketDebuggerUrl;

    const browser = await puppeteer.connect({
        browserWSEndpoint: webSocket,
        headless: true
    });
    const page = await browser.newPage();
    page.setJavaScriptEnabled(true);
    await page.goto(`${BASE_URL}/${asin}`);

    const pageData = await page.evaluate(() => {

        // get title
        const title = document.querySelector("#title").innerText;

        // get dimensions
        let dim = "";
        if (document.querySelector('#prodDetails') !== null) {
            dim = document.querySelector('#prodDetails div.pdTab:nth-child(1) tr.size-weight:nth-child(2) td.value').innerText;
        } else if (document.querySelector("#detail-bullets") !== null) {
            console.log("here");
            const $x = document.evaluate("//b[contains(., 'Product Dimensions')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
            if ($x && $x.nextSibling) {
                dim = $x.nextSibling.textContent;
            }
        }
        
        // get ranks and categories
        const ranks = [];
        const $ranks = document.querySelectorAll('#SalesRank ul.zg_hrsr > li.zg_hrsr_item');
        $ranks.forEach(($el) => {
            ranks.push({
                rank: $el.querySelector('.zg_hrsr_rank').innerText,
                category: $el.querySelector('.zg_hrsr_ladder').innerText
            });
        });

        return {
            dimension: dim,
            ranks: ranks,
            title: title
        };
    });

    await browser.close();
    
    pageData.asin = asin;

    return pageData;
};

module.exports = getPageData;
