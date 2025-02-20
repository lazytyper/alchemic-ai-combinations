const fs = require('fs');

const items = [];
const itemNames = {}
const combinations = {};
const create = [];

let autoId = 0;

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
    if (create[resultId])
        create[resultId].push(keyIds);
    else
        create[resultId] = [keyIds];

}

function formatElement(name) {
    name = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
    return name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

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

function findCombinationsWith(name) {
    const id = itemNames[name].id;
    const result = [];
    for (let key in combinations) {
        const keys = key.split(',').map(id => parseInt(id));
        if (keys.includes(id)) {
            const results = combinations[key];
            result.push({ keys, results });
        }
    }
    return result;
}

readFile('data/combinations.txt');

const namesFormatted = [];

for (let i = 0; i < autoId; i++) {
    const item = items[i];
    namesFormatted.push(formatElement(item.name));
}

module.exports = {
    items,
    combinations,
    itemNames,
    namesFormatted,
    create,
    findCombinationsWith,
    formatElement,
};

