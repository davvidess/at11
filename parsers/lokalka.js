var cheerio = require('cheerio');
require('./parserUtil');

module.exports.parse = function(html, date, callback) {
    var $ = cheerio.load(html);
    var dayMenu = [];
    var todayDate = date.format('DD.MM.YYYY');

    var elements = $('li.fdm-item', 'div.entry-content.post-content');
    elements.each(function(){
      var node = $(this);
      var title = node.find('p.fdm-item-title').text();
      if(isToday(title)){
        parseDailyMenu(node.find('table'));
        return false;
      }
    });

    callback(dayMenu);

    function isToday(title) {
      return title.toLowerCase().indexOf(todayDate) !== -1;
    }

    function parseDailyMenu(table) {
      var rows = table.find('tr');
      rows.each(function(index, elem){
        if(index === 0){
          return;
        }
        if(index === 1){
          dayMenu = dayMenu.concat(parseSoup(elem));
        }
        else{
          dayMenu.push(parseOther(elem));
        }
      });
    }

    function parseSoup(row) {
      var cells = $(row).find('td');
      var price = parseFloat(cells.eq(6).text().replace(',', '.'));
      var text = cells.eq(2).text() + " " + cells.eq(3).text();
      var soups = text.split('/');

      return soups.map(function(item) { return { isSoup: true, text: item.trim(), price: price }; });
    }

    function parseOther(row) {
      var cells = $(row).find('td');
      return { isSoup: false, text: cells.eq(1).text(), price: parseFloat(cells.eq(4).text().replace(',', '.')) };
    }
  };
