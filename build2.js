const fs = require('fs');
const data = require('./lib/functions.js');

const blocks = [];

blocks.push('<!DOCTYPE html><html><head><title>AlchemicAI elements search</title><style type="text/css">');
blocks.push(fs.readFileSync('./public/main.css', 'utf8'));
blocks.push('</style><script type="text/javascript">window.data=');
blocks.push(JSON.stringify({
    names: data.namesFormatted,
    create: data.create,
}));
blocks.push('\n');
blocks.push(fs.readFileSync('./public/app.js', 'utf8'));

blocks.push('</script></head><body><div class="container"><h1>Alchemic AI elements search</h1><p> <span id="element-count">0</span> elements available</p><div id="inputform"><input id="search" type="text" placeholder="element" autocomplete="off"><button id="searchbtn">Search</button> <label style="margin-left:2em">Search method:</label> <select id="search-method"><option value="0">Fuzzy search</option><option value="1">Contains term (like in game)</option><option value="2">Begins with term (like in game)</option><option value="3">Ends with term</option></select></div><div id="solutions"></div></div></body></html>');

fs.writeFileSync('alchemic.html', blocks.join(''));


