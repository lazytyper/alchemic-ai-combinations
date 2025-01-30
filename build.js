const fs = require('fs');

const items = {};
const itemNames = {}
const combinations = {};

let autoId = 1;

const startItems = [
    'air',
    'earth',
    'fire',
    'water'
];

function addItem(name) {
    let id = itemNames[name];
    if (id === undefined) {
        id = autoId++;
        itemNames[name] = id;
        items[id] = name;
    }
    return id;
}

function addCombination(names, resultName) {
    let ids = names.map(addItem);
    let resultId = addItem(resultName);

    ids.sort((a, b) => a - b);

    let key = ids.join('_');

    if (combinations[key] === undefined) {
        combinations[key] = [resultId];
    } else {
        if (combinations[key].includes(resultId)) {
            console.warn(`Duplicate combination: ${names.join(' + ')} = ${resultName}`);

        }
        combinations[key].push(resultId);
    }
}

function listCombinationsWith(name) {
    let result = { creations: [], usages: [] };
    let id = itemNames[name];
    for (let key in combinations) {
        let ids = key.split('_').map(id => parseInt(id));
        let resultIds = combinations[key];
        let resultNames = ids.map(id => Object.keys(itemNames).find(key => itemNames[key] == id));

        if (resultIds.includes(id)) {
            let creation = { names: resultNames, resultName: name };
            result.creations.push(creation);
        }

        if (ids.includes(id)) {
            for (let resultId of resultIds) {
                let usage = { names: resultNames, resultName: items[resultId] };
                result.usages.push(usage);
            }
        }

    }
    return result;
}

function getUnusedItems() {
    let result = [];
    for (let key in itemNames) {
        let id = itemNames[key];
        let found = false;
        for (let key2 in combinations) {
            let ids = key2.split('_');
            if (ids[0] == id || ids[1] == id) {
                found = true;
                break;
            }
        }
        if (!found) {
            result.push(key);
        }
    }
    return result;
}

function getMissingCombinations() {

    let itemSet = new Set();
    for (let key in itemNames) {
        itemSet.add(itemNames[key]);
    }

    startItems.map(name => itemNames[name]).forEach(id => itemSet.delete(id));

    const key = Object.keys(combinations);

    for (let k of key) {
        let ids = combinations[k];
        for (let id of ids) {
            itemSet.delete(id);
        }
    }

    return Array.from(itemSet).map(id => items[id]);
}

function formatElement(name) {
    name = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
    return name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}


function addline(string) {
    let names = string.split(',');
    let resultName = names.pop();
    names = names.sort();
    addCombination(names, resultName);
}

function createHTML() {
    const itemIds = Object.keys(itemNames).sort().map(key => itemNames[key]);
    function ref(name) {
        return '<a href="#' + name + '">' + formatElement(name) + '</a>';
    }
    const preHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Alchemy</title>
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
        .index a { margin-left: 5px; margin-right: 5px; }
    </style>
</head>
<body>`;

    const blocks = [];

    blocks.push('<h1>AlchemicAI Combination List</h1>');
    blocks.push('<div class="index">');
    blocks.push(`<h2>Index (${itemIds.length} Items)</h2>`);

    for (let id of itemIds) {
        const name = items[id];
        blocks.push(`<a class="element" href="#${name}">${formatElement(name)}</a>`);
    }

    blocks.push('</div>');

    for (let id of itemIds) {
        const name = items[id];
        const combinations = listCombinationsWith(name);

        let content = [
            `
            <a name="${name}"></a>
            <h2>${formatElement(name)}</h2>`,
            '<h3>Created by:</h3>',
            '<ul>'
        ];
        for (let c of combinations.creations) {
            content.push(`<li>${c.names.map(ref).join(' + ')} = ${ref(c.resultName)}</li>`);
        }
        content.push('</ul>');
        if (combinations.usages.length > 0) {
            content.push('<h3>Usages:</h3>');
            content.push('<ul>');
            for (let c of combinations.usages) {
                content.push(`<li>${c.names.map(ref).join(' + ')} = ${ref(c.resultName)}</li>`);
            }
            content.push('</ul>');
        }

        blocks.push(content.join('\n'));
    }

    const postHTML = '</body></html>';

    fs.writeFileSync('stat/index.html', preHTML + blocks.join('\n') + postHTML);
}

// read data file
const dataContent = require('fs').readFileSync('data.txt', 'utf-8');
const lines = dataContent.split('\n');
for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#')) continue;
    if (line === '') continue;
    addline(line);
}

// create item files
const itemIds = Object.keys(items);
itemIds.forEach(id => {
    const name = items[id];
    const combinations = listCombinationsWith(name);

    let content = [
        '==================================',
        '= ' + formatElement(name),
        '==================================',
        ''
    ];

    content.push('created by:');
    content.push('===========')
    for (let c of combinations.creations) {
        content.push(c.names.map(formatElement).join(' + ') + ' = ' + formatElement(c.resultName));
    }
    content.push('');
    content.push('Usages:');
    content.push('=======')
    for (let c of combinations.usages) {
        content.push(c.names.map(formatElement).join(' + ') + ' = ' + formatElement(c.resultName));
    }

    fs.writeFileSync(`stat/items/${name}.txt`, content.join('\n'));
});

// create file for unknown items
const missing = getMissingCombinations();
let content;
if (missing.length) {
    content = getMissingCombinations().map(formatElement).join('\n');
} else {
    content = 'No missing combinations';
}
fs.writeFileSync('stat/missing.txt', content);

createHTML();
