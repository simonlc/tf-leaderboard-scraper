const cheerio = require('cheerio');
const fetch = require('isomorphic-fetch');
const fs = require('fs');
const wiki = require('./wiki');

const commonSelectors = {
  rank: 'th',
  name: '.leaderboard_username_cell a',
  bio: '.leaderboard_username_cell p', // optional
};

const defaultSelectors = {
  score: '.leaderboard_stat_cell[class$=leaderboard_stat_cell]',
  level: '.leaderboard_stat_cell:not([class$=leaderboard_stat_cell])',
};

const ultraSelectors = {
  score: '.leaderboard_stat_cell[class$=leaderboard_stat_cell]',
  dateTime: '.leaderboard_stat_cell:not([class$=leaderboard_stat_cell])',
};

const sprintSelectors = {
  playtime: '.leaderboard_stat_cell[class$=leaderboard_stat_cell]',
  dateTime: '.leaderboard_stat_cell:not([class$=leaderboard_stat_cell])',
};
const cfg = {
  sprint: {
    url: index =>
      `https://www.tetrisfriends.com/leaderboard/ajax/leaderboard_page.php?platformId=3&productId=84&leaderboardType=1&startIndex=${index}&gameName=Sprint&lbRegion=0`,
    selectors: { ...commonSelectors, ...sprintSelectors },
  },
  marathon: {
    url: index =>
      `https://www.tetrisfriends.com/leaderboard/ajax/leaderboard_page.php?platformId=3&productId=10&leaderboardType=1&startIndex=${index}&gameName=Marathon&lbRegion=0`,
    selectors: { ...commonSelectors, ...defaultSelectors },
  },
  ultra: {
    url: index =>
      `https://www.tetrisfriends.com/leaderboard/ajax/leaderboard_page.php?platformId=3&productId=23&leaderboardType=1&startIndex=${index}&gameName=Ultra&lbRegion=0`,
    selectors: { ...commonSelectors, ...ultraSelectors },
  },
  1989: {
    url: index =>
      `https://www.tetrisfriends.com/leaderboard/ajax/leaderboard_page.php?platformId=3&productId=102&leaderboardType=1&startIndex=${index}&gameName=Mono&lbRegion=0`,
    selectors: { ...commonSelectors, ...defaultSelectors },
  },
  survival: {
    url: index =>
      `https://www.tetrisfriends.com/leaderboard/ajax/leaderboard_page.php?platformId=3&productId=12&leaderboardType=1&startIndex=${index}&gameName=Survival&lbRegion=0`,
    selectors: { ...commonSelectors, ...defaultSelectors },
  },
  nblox: {
    url: index =>
      `https://www.tetrisfriends.com/leaderboard/ajax/leaderboard_page.php?platformId=3&productId=85&leaderboardType=1&startIndex=${index}&gameName=NBlox&lbRegion=0`,
    selectors: { ...commonSelectors, ...defaultSelectors },
  },
};

function getScores(data = []) {
  return async function recursive(game = 'sprint', index = 0) {
    const response = await fetch(cfg[game].url(index));
    const text = await response.text();
    const $ = cheerio.load(text);

    if ($('.leaderboard_main_table').text()) {
      $('.leaderboard_main_table tr:last-child').each((index, element) => {
        const obj = {};
        Object.entries(cfg[game].selectors).forEach(([key, selector]) => {
          if ($(selector, element).text()) {
            obj[key] = $(selector, element).text();
          } else {
            obj[key] = '';
          }
        });
        data.push(obj);
      });
      console.log(`progress ${game}: ${index}`);
      recursive(game, index + 10);
    } else {
      const json = JSON.stringify(data);
      fs.writeFile(`backup/${game}.json`, json, 'utf8', () =>
        console.log(`json done for ${game}`),
      );
      wiki(game, data, Object.keys(cfg[game].selectors));
    }
  };
}

for (let game in cfg) {
  getScores()(game);
}
