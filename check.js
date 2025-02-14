const { items } = require('./lib/functions');
const fs = require('fs');

const itemNameSet = new Set();

for (const item of items) {
    itemNameSet.add(item.name);
}

function formatElement(name) {
    name = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
    return name.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function checkList(filename) {
    const content = fs.readFileSync(filename, 'utf8').trim();
    const names = content.split('\n');
    for (const name of names) {
        if (!itemNameSet.has(name)) {
            console.log(`- ${formatElement(name)}`);
        }
    }
}
console.log('Legendary:\n');
checkList('data/groups/special/legendary.txt');
console.log('\nEpic:\n');
checkList('data/groups/special/epic.txt');
console.log('\nRare:\n');
checkList('data/groups/special/rare.txt');

