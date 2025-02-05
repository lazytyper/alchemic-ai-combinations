const fs = require('fs');

const word = process.argv[2];

const count = + process.argv[3];

const handle = fs.openSync('data/combinations.txt', 'a');

for (let i = 0; i < count; i++) {
    fs.writeSync(handle, word + ',\n');
}
