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
        combinations[key].push(resultId);
    }


}

function getCombination(name1, name2) {
    let id1 = itemNames[name1];
    let id2 = itemNames[name2];

    if (id2 > id1) {
        let tmp = id1;
        id1 = id2;
        id2 = tmp;
    }

    let key = id1 + '_' + id2;

    return combinations[key];
}

function listCombinations() {
    let result = [];
    for (let key in combinations) {
        let ids = key.split('_');
        let name1 = Object.keys(itemNames).find(key => itemNames[key] == ids[0]);
        let name2 = Object.keys(itemNames).find(key => itemNames[key] == ids[1]);

        let resultIds = combinations[key];

        for (let resultId of resultIds) {
            let resultName = Object.keys(itemNames).find(key => itemNames[key] == resultId);
            result.push({ name1, name2, resultName });
        }
    }
    return result;
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
            let usage = { names: resultNames, resultName: Object.keys(itemNames).find(key => itemNames[key] == resultIds[0]) };
            result.usages.push(usage);
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
    return name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}


function addline(string) {
    let names = string.split(',');
    let resultName = names.pop();
    names = names.sort();
    addCombination(names, resultName);
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
        content.push('');
        content.push('Usages:');
        content.push('=======')
        for (let c of combinations.usages) {
            content.push(c.names.map(formatElement).join(' + ') + ' = ' + formatElement(c.resultName));
        }

        fs.writeFileSync(`stat/items/${name}.txt`, content.join('\n'));
    }
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


