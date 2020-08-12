const puppeteer = require('puppeteer');
const { execSync, exec } = require('child_process');
const path = require('path');

const packagejsonpath = path.resolve(__dirname, '../');
let browser;
let page;

const isRedux = process.argv[2] === 'redux';

function runServer() {
    execSync(`cd ${packagejsonpath}&&yarn build${isRedux ? ':redux' : ''}`);
    return exec(`cd ${packagejsonpath}&&http-server public`);
}

async function find(selector) {
    await page.waitFor(selector);
    return await page.$(selector);
}

async function runTest() {
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:8080');

    page.on('console', async msg => console[msg._type](
        ...await Promise.all(msg.args().map(arg => arg.jsonValue()))
    ));

    await page.waitFor('#node-0');

    await page.tracing.start({ path: path.resolve(__dirname, 'dist', process.argv[2] === 'redux' ? 'trace-redux.json' : 'trace.json'), screenshots: true });

    (await find(`#node-0 .caret`)).click();

    (await find('#node-0-0')).click();
    
    (await find('#row-0-0-0')).click();

    await page.waitFor('#row-0-0-0.selected');

    (await find('#row-0-0-1')).click();

    await page.waitFor('#row-0-0-1.selected');

    await type('#input-name-0-0-1');    

    await page.screenshot({ path: path.resolve(__dirname, 'dist', isRedux ? 'final-redux.jpg' : 'final.jpg') });

    await page.tracing.stop();
};

async function type(to, text = 'test') {
    const rowSelector = to.replace('input-name', 'row');
    console.log(rowSelector);

    await page.focus(to);

    for (const ch of text) {
        const value = (await page.evaluate(el => el.value, await page.$(to))) + ch;

        await page.keyboard.type(ch);

        await page.waitFor(({value, rowSelector}) => {
            const column = document.querySelector(rowSelector + ' .name');
            // console.log(column);
            return column.innerHTML === value;
        }, {}, {value, rowSelector});
    }
}


async function run() {
    const server = await runServer();

    try {
        browser = await puppeteer.launch();
        page = await browser.newPage({});
        await runTest();
    } catch (error) {
        console.error(error);
        server.kill();
    } finally {
        await browser.close();
        process.exit();
    }
}

run();