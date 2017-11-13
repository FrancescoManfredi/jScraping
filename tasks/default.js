/*
 * Default scraping task.
 * 
 */

var exports = module.exports;

// (initial) list of the urls to open for scraping.
exports.initToVisit = ['https://it.wikipedia.org/wiki/Verifica_dei_fatti'];

// look for other urls to visit in these DOM elements and descendents
exports.nextUrlSelector = 'a';

/* 
 * what will your record look like?
 * 
 * Specify a dictionary in the form:
 * {"key": ["selector", filterFunction]}
 * 
 * "key": the name of a feature to retrieve from the page.
 * "selector": the css selector of the element containing the value for this feature.
 * filterFunction: a function to manually handle the dom elemente. Gets the dom element 
 * (or elements) wrapped in a jQuery object and returns the desired data.
 *  If filter == null the text of the element (as in $(selector).text()) will be
 *  kept as feature value.
 */
exports.recordDescription = {
    "title": ["title", null], // page title
    "main_heading_size": ["h1", function(el) { return el.css('font-size'); }], // font size of the main headline
    "num_of_headings": ["h1, h2, h3, h4, h5, h6", function(el) { return el.length; }], // number of headlines in the page
    "first_paragraph": ["p", function(el) { return el.first().text(); }] // first paragraph in the page
};

// output file
exports.filename = "output.json";

// max records in memory: write to file after this number of records
// retrieved to free memory space.
// This will write more than one file.
// 0: just write to a single file once all the scraping is done.
exports.maxRecInMemory = 0;

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
            r[rk[i]] = exports.recordDescription[rk[i]][1]($(exports.recordDescription[rk[i]][0]));
        }
    }
    
    // add this record to the records list
    records.push(r);
    
    // grab links to the next pages
    var links = $(nextUrlSelector).filter('a');
    links.each(function(i,el){
        if ($(el).attr('href')!= undefined && $(el).attr('href').charAt(0)!=='#') {
            /*
             * Need to edit relative paths before adding them.
             */
            toVisit.push($(el).attr('href'));
        }
    });
    
    // grab links in descendents of selectors element
    var linksDesc = $(nextUrlSelector).find('a');
    linksDesc.each(function(i,el){
        if ($(el).attr('href')!= undefined && $(el).attr('href').charAt(0)!=='#') {
            toVisit.push($(el).attr('href'));
        }
    });
    
};

exports.fileCount = 0; // don't touch this