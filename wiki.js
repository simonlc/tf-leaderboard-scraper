const fs = require('fs');

// const json = fs.readFileSync('./sprint.json');

// let records = JSON.parse(json);
// records.map(record => {
//   if (!record.bio) {
//     record.bio = '';
//   }
//   return record;
// });

const map = ['rank', 'name', 'bio', 'playtime', 'dateTime'];

module.exports = function(game, records, map = map) {
  const wiki = `{| class="wikitable"
|-
${map.map(key => `! ${key}`).join('\n')}${records
    .map(
      record =>
        `|-
${map.map(key => `| ${record[key]}`).join('\n')}`,
    )
    .join('\n')}
|}`;

  fs.writeFile(`backup/${game}.wiki`, wiki, 'utf8', () =>
    console.log(`wiki done for ${game}`),
  );
};
