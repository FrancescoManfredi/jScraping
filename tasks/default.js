/*
 * Default scraping task.
 * 
 */

var exports = module.exports;

// (initial) list of the urls to open for scraping.
exports.initToVisit = ['https://en.wikipedia.org/wiki/Fact_checking'];

// look for other urls to visit in these DOM elements and descendents
exports.nextUrlSelector = 'a[href^="/wiki"]';

/* 
 * what will your record look like?
 * 
 * Specify a dictionary in the form:
 * {"key": ["selector", filterFunction]}
 * 
 * "key": the name of a feature to retrieve from the page.
 * "selector": the css selector of the element containing the value for this feature.
 * filterFunction: a function to manually handle the dom element. Gets the dom element 
 * (or elements) wrapped in a jQuery object and returns the desired data.
 *  If filter == null the text of the element (as in $(selector).text()) will be
 *  kept as feature value.
 */
exports.recordDescription = {
    "title": ["title",
        null], // page title
    "main_heading_font_size": ["h1",
        function(el, $) { return el.css('font-size'); }], // font size of the main headline
    "first_paragraph": ["p",
        function(el, $) { return el.first().text().split(' ').splice(0,5).join(' '); }] // first 5 words in the first paragraph in the page
};

// output file
exports.filename = "output.json";

// max records in memory: write to file after this number of records
// retrieved to free memory space.
// This will write more than one file.
// 0: just write to a single file once all the scraping is done.
exports.maxRecInMemory = 10;

// stop after this many visited url
// if 0 go on until toVisit array is empty
exports.stopAfter = 20;

// time to wait for page to execute ajax requests (in ms)
// if < 1 no waiting time is set
exports.waitForPage = 200;

/*
 * This functions contains all the operations you want to perform on the current
 * web page.
 *  
 * @param {obj} window - the virtual browser. You don't really need to touch it
 * @param {function} $ - the jQuery function
 * @param {array} toVisit - the current array of urls to visit. You can push other urls in there.
 * @param {string} nextUrlSelector - the selector of dom elements tha should contain the next urls to visit.
 * @param {array} records - an array of records where to push the data you want to save.
 */
exports.scrape = function(window, $, toVisit, nextUrlSelector, records) {
    
    // get the features specified from recordDescription
    var rk = Object.keys(exports.recordDescription);
    var r = new Object();
    for (var i=0; i<rk.length; i++) {
        if (exports.recordDescription[rk[i]][1] === null) {
            r[rk[i]] = $(exports.recordDescription[rk[i]][0]).text();
        } else {
            r[rk[i]] = exports.recordDescription[rk[i]][1]($(exports.recordDescription[rk[i]][0], $));
        }
    }
    
    // add this record to the records list
    records.push(r);
    
    // grab and store links to visit
    var links = $(nextUrlSelector).filter('a');
    links.each(function(i,el){
        var candidateUrl = $(el).attr('href');
        cleanAndPushUrl(candidateUrl, window.location, toVisit);
    });
    
    // grab and store links to visit in descendents of selectors element
    var linksDesc = $(nextUrlSelector).find('a');
    linksDesc.each(function(i,el){
        var candidateUrl = $(el).attr('href');
        cleanAndPushUrl(candidateUrl, window.location, toVisit);
        
    });
    
};

exports.fileCount = 0; // to keep track of the number of output files

exports.visitedUrl = []; // to keep track of visited urls

/*
 * Filtering urls before adding them to the toVisit array
 */
function cleanAndPushUrl(candidateUrl, loc, toVisit) {
    if (candidateUrl !== undefined && candidateUrl.charAt(0)!=='#') {
        
        if (candidateUrl.startsWith("//")) {
            // urls with protocol omitted
            candidateUrl = loc.protocol + candidateUrl;
        } else if (candidateUrl.charAt(0)==='/') {
            // path relative to origin
            candidateUrl = loc.origin + candidateUrl;
        } else if (!candidateUrl.startsWith('http')) {
            // path relative to base url
            var subpath = loc.split('/');
            subpath.pop();
            candidateUrl = loc.protocol + "//" + loc.origin + subpath.join('/') + "/" + candidateUrl;
        }
        if (exports.visitedUrl.indexOf(candidateUrl)===-1) {
            toVisit.push(candidateUrl);
        }
    }
}