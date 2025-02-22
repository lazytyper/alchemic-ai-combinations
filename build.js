const fs = require('fs');

const items = {};
const itemNames = {}
const combinations = {};

let autoId = 1;

function addItem(name) {
    let o = itemNames[name];
    if (o === undefined) {
        o = {
            id: autoId++,
            name,
            create: [],
            use: [],
        };
        itemNames[name] = o;
        items[o.id] = o;
    }
    return o;
}

function addCombination(names, resultName) {
    let keyItems = names.map(addItem);
    let resultId = addItem(resultName).id;
    let keyIds = keyItems.map(item => item.id).sort((a, b) => a - b);
    let combinationKey = keyIds.join(',');
    let comb;
    if (combinations[combinationKey] === undefined) {
        comb = combinations[combinationKey] = [resultId];
    } else {
        comb = combinations[combinationKey];
        if (comb.includes(resultId)) {
            console.warn(`Duplicate combination: ${names.join(' + ')} = ${resultName}`);
            return;
        }
        comb.push(resultId);
    }
    let keyItems2 = Array.from(new Set(keyIds));
    for (let key of keyItems2) {
        const use = items[key].use;
        if (!use.includes(combinationKey)) {
            items[key].use.push(combinationKey);
        }
    }
    items[resultId].create.push(combinationKey);
}

function getItemsSortedByNames() {
    return Object.values(items).sort((a, b) => a.name.localeCompare(b.name));
}

function formatElement(name) {
    name = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
    return name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function addline(string) {
    let names = string.split(',');
    let resultName = names.pop();
    if (resultName === '') {
        console.warn(`Empty result name: ${string}`);
        return;
    }
    names = names.sort();
    addCombination(names, resultName);
}

// read data file
function readFile(filename) {
    if (!fs.existsSync(filename)) {
        //console.warn(`File not found: ${filename}`);
        return;
    }
    const dataContent = require('fs').readFileSync(filename, 'utf-8');
    const lines = dataContent.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#')) continue;
        if (line === '') continue;
        addline(line);
    }
}

readFile('data/combinations.txt');
readFile('data/new.txt');
//readFile('data/combinations2.txt');
//readFile('data/event.txt');
// read event data file
const eventDataContent = require('fs').readFileSync('data/groups/events/valentine2025.txt', 'utf-8').trim();
const eventItems = eventDataContent.split('\n').sort((a, b) => a.localeCompare(b));

const itemsSorted = getItemsSortedByNames();

function ref(name) {
    return '<a href="#' + name + '">' + formatElement(name) + '</a>';
}

function createSubIndex(names) {
    return names.map(item => {
        if (item in itemNames) {
            return `<a href="#${item}">${formatElement(item)}</a>`;
        } else {
            return '<span class="missing">' + formatElement(item) + '</span>';
        }
    }).join(', ');
}


function createHTML() {
    const preHTML = `<!DOCTYPE html>
<html>
<head>
    <title>AlchemicAI Combination List</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        h1 {
            font-size: 1.5em;
            text-decoration: underline;
        }
        h2 {
            text-decoration: underline;
            font-size: 1.2em;
        }
        h3 {
            font-size: 1em;
        }
        div.index {
            position: fixed;
            top: 10px;
            right: 10px;
            bottom: 10px;
            width: 300px;
            border: 1px solid black;
            padding: 10px;
            background-color: #f2f2f2;
            overflow-y: auto;
        }
        div.event-list {
            width: calc(100% - 320px);
            max-width: 800px;
            border: 1px solid black;
            padding: 10px;
            background-color: #f2f2f2;
        }
        span.missing {
            color: red;
            font-style: italic;
        }
    </style>
</head>
<body>`;
    const blocks = [];

    blocks.push('<h1>AlchemicAI Combination List</h1>');
    blocks.push('<h2>Event Items (Valentine 2025)</h2>');
    blocks.push('<div class="event-list">');

    blocks.push(createSubIndex(eventItems));

    blocks.push('</div>');

    blocks.push('<div class="index">');
    blocks.push(`<h2>Index (${itemsSorted.length} Items)</h2>`);

    blocks.push(itemsSorted.map(item => `<a href="#${item.name}">${formatElement(item.name)}</a>`).join(', '));

    blocks.push('</div>');

    for (let item of itemsSorted) {
        const { name, create, use } = item;
        let content = [
            `<a name="${name}"></a>`,
            `<h2>${formatElement(name)}</h2>`
        ];

        content.push('<h3>Created by:</h3>');
        content.push('<ul>');
        for (let c of create) {
            const ids = c.split(',');
            const names = ids.map(id => items[id].name);
            content.push(`<li>${names.map(ref).join(' + ')} = ${ref(name)}</li>`);
        }
        content.push('</ul>');

        if (use.length) {
            content.push('<h3>Usages:</h3>');
            content.push('<ul>');
            for (let c of use) {
                const ids = c.split(',');
                const names = ids.map(id => items[id].name);
                const resultNames = combinations[c].map(id => items[id].name);
                for (let resultName of resultNames) {
                    content.push(`<li>${names.map(ref).join(' + ')} = ${ref(resultName)}</li>`);
                }
            }
            content.push('</ul>');
        }
        content.push('<hr/>');

        blocks.push(content.join('\n'));
    }

    const postHTML = '</body></html>';

    fs.writeFileSync('index.html', preHTML + blocks.join('\n') + postHTML);
}

function createShortHTML() {
    const preHTML = `<!DOCTYPE html>
<html>
<head>
    <title>AlchemicAI Combination List</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        h1 {
            font-size: 1.5em;
            text-decoration: underline;
        }
        h2 {
            text-decoration: underline;
            font-size: 1.2em;
        }
        h3 {
            font-size: 1em;
        }
        p.item {
            margin: 0;
        }
        a {
            color: #000;
        }
        a:hover {
            color: #00f;
        }
        div.index {
            position: fixed;
            top: 10px;
            right: 10px;
            bottom: 10px;
            width: 300px;
            border: 1px solid black;
            padding: 10px;
            background-color: #f2f2f2;
            overflow-y: auto;
        }
        div.event-list {
            width: calc(100% - 320px);
            max-width: 800px;
            border: 1px solid black;
            padding: 10px;
            background-color: #f2f2f2;
        }
        span.missing {
            color: red;
            font-style: italic;
        }
        span.combi {
            background: #ffc;
            border: solid 1px #cc9;
            padding: 2px 8px;
            border-radius: 4px;
        }
    </style>
</head>
<body>`;
    const blocks = [];
    blocks.push('<h1>AlchemicAI Combination List</h1>');
    blocks.push('<h2>Event Items (Valentine 2025)</h2>');
    blocks.push('<div class="event-list">');

    blocks.push(createSubIndex(eventItems));

    blocks.push('</div>');

    blocks.push('<div class="index">');
    blocks.push(`<h2>Index (${itemsSorted.length} Items)</h2>`);

    blocks.push(itemsSorted.map(item => `<a href="#${item.name}">${formatElement(item.name)}</a>`).join(', '));

    blocks.push('</div><hr/>');

    for (let item of itemsSorted) {
        const { name, create, use } = item;
        let content = [
            `<a name="${item.name}"></a><p class="item"><strong>${formatElement(name)}</strong>: `
        ];
        content.push(create.map(c => {
            const ids = c.split(',');
            const names = ids.map(id => items[id].name);
            return `<span class="combi">${names.map(ref).join(' + ')}</span>`;
        }).join(' or '));

        content.push('</p><hr/>');

        blocks.push(content.join('\n'));
    }

    const postHTML = '</body></html>';

    fs.writeFileSync('index-short.html', preHTML + blocks.join('\n') + postHTML);
}


// items without known combinations
const itemsWithNoCreate = itemsSorted.filter(item => item.create.length === 0 && !(['air', 'earth', 'fire', 'water', 'random_item'].includes(item.name)));
let content = itemsWithNoCreate.map(item => formatElement(item.name)).join('\n');
fs.writeFileSync('stat/missing.txt', content);

const itemsSortedByUsage = [...itemsSorted].sort((a, b) => {
    if (a.use.length > b.use.length) return 1;
    if (a.use.length < b.use.length) return -1;
    return a.name.localeCompare(b.name);
});
content = itemsSortedByUsage.map(item => `${formatElement(item.name)}: ${item.use.length}`).join('\n');
fs.writeFileSync('stat/statistics.txt', content);
createHTML();
createShortHTML();

