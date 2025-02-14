const fs = require('fs');
const data = require('./lib/functions.js');

const pre = '<!DOCTYPE html><html><head><title></title>';

const blocks = [];

blocks.push('<!DOCTYPE html><html><head><title></title><style type="text/css">');
blocks.push(fs.readFileSync('./public/main.css', 'utf8'));
blocks.push('</style><script type="text/javascript">window.data=');
blocks.push(JSON.stringify({
    names: data.namesFormatted,
    create: data.create,
}));
blocks.push('\n');
blocks.push(fs.readFileSync('./public/app.js', 'utf8'));

blocks.push('</script></head><div class="container"><div id="inputform"><input id="search" type="text" placeholder="element" autocomplete="off"><button id="searchbtn">Search</button></div><div id="solutions"></div></div></body></html>');

fs.writeFileSync('alchemic.html', blocks.join(''));


