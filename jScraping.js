
if (process.argv[2] === undefined) {
    // default scraping task
    var scrape = require('./tasks/default.js');
} else {
    // user defined scraping task
    var scrape = require(process.argv[2]);
}


// library to create the virtual browser
var jsdom  = require('jsdom');
var fs     = require('fs');
var url = require('url');
// jquery library to inject in the browser
var jquery = fs.readFileSync('jquery-3.1.1.min.js');

// pages to scrape content from
var toVisit = scrape.initToVisit;
var next_url;

// where to look for the next urls in the current page?
var nextUrlSelector = scrape.nextUrlSelector;

// records to export in output file
var records = [];

function scrapeAndRepeat(window) {

    if (window !== null && window !== undefined) {
        /*
         * when called with a window parameter we need to start the scraping
         * for the document rendered in the current window.
         */
        var $ = window.$;

        // The scraping function should also retrieve other urls to visit inside
        // the page (if any)
        scrape.scrape(window, $, toVisit, nextUrlSelector, records);

        // do I have a limit to records to keep in memory?
        if (scrape.maxRecInMemory > 0 && records.length >= scrape.maxRecInMemory) {
            serializeAndWrite(records, scrape.filename);
            records = [];
        }

        // no need to touch this
        window.close();

    }

    // are there urls to visit? Let's visit the next.
    if (toVisit.length > 0 && (scrape.stopAfter===0 || scrape.visitedUrl.length <= scrape.stopAfter)) {
        next_url = toVisit.shift();
        scrape.visitedUrl.push(next_url);
        
        jsdom.env({

            url: next_url,
            src: [
            jquery
            ],
            done: function(errors, window) {
                
                if (errors == null) {
                    console.log("Opening: " + window.location.href);
                    return scrapeAndRepeat(window);
                } else {

                    
                    // this will make us jump to the next url
                    // before doing this we should try to recover from error.
                    return scrapeAndRepeat(null);
                    
                    /*
                     * The most common error is invalid url when you get relative
                     * paths instead of absolute. If you edit the relative paths
                     * before adding them to toVisit in the scrape.scrape()
                     * function, that won't happen and we can crawl better.
                     */
                    
                }

            }

        });
    } else {
        // all urls visited. Export all the records.
        serializeAndWrite(records, scrape.filename);
        
        console.log("Done. Bye!");
    }

}

/*
 * Serializing and writing to output file.
 */

function serializeAndWrite(data, filename) {
    console.log(scrape.fileCount);
    var fn = filename;
    
    if (scrape.maxRecInMemory > 0) {
        var fn = "" + scrape.fileCount + "-" + filename;
        scrape.fileCount++;
    }

    var serializedData = JSON.stringify(records);
    
    console.log("\nWriting to " + fn);

    fs.writeFileSync(fn, serializedData);
    
}

scrapeAndRepeat();