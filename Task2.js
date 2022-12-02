var request = require("request");
var cheerio = require("cheerio");
var prompt = require("prompt-sync")();
var URL = require("url-parse");
var START_URL = "https://en.wikipedia.org";
var SEARCH_WORD = "Apple";

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = "https://" + url.hostname;
console.log(url.protocol);
console.log(url.hostname);

pagesToVisit.push(START_URL);

var MAX_PAGES_TO_VISIT = 0;
MAX_PAGES_TO_VISIT = prompt("Input the number from 1 to 20 = ");
if (MAX_PAGES_TO_VISIT >= 1 && MAX_PAGES_TO_VISIT <= 20) {
  console.log("Number is = ", MAX_PAGES_TO_VISIT);
  crawl();
} else {
  console.log("Number is = ", MAX_PAGES_TO_VISIT);
  console.log("Number is Greater 20 & Less than 1");
}

function crawl() {
  if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");

    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    crawl();
  } else {
    visitPage(nextPage, crawl);
  }
}
function visitPage(url, callback) {
  pagesVisited[url] = true;
  numPagesVisited++;

  console.log("Visiting page " + url);
  request(url, function (error, response, body) {
    console.log("Status code: " + response.statusCode);
    if (response.statusCode !== 200) {
      callback();
      return;
    }

    var $ = cheerio.load(body);
    var isWordFound = searchForWord($, SEARCH_WORD);
    if (isWordFound) {
      console.log("Word " + SEARCH_WORD + " found at page " + url);
    } else {
      collectInternalLinks($);

      callback();
    }
  });
}

function searchForWord($, word) {
  var bodyText = $("html > body").text().toLowerCase();
  return bodyText.indexOf(word.toLowerCase()) !== -1;
}
function collectInternalLinks($) {
  var relativeLinks = $("a[href^='/']");
  console.log("Found " + relativeLinks.length + " relative links on page");
  relativeLinks.each(function () {
    pagesToVisit.push(START_URL + $(this).attr("href"));
  });
}
