if (process.argv[2] === undefined) {
    // default scraping task
    var scrape = require('./tasks/default.js');
} else {
    // user defined scraping task
    var scrape = require(process.argv[2]);
}

// library to create the virtual browser
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var fs = require('fs');
var url = require('url');
// jquery library to inject in the browser
var jquery = require('./jquery-3.1.1.min.js');

// pages to scrape content from
var toVisit = scrape.initToVisit;
var next_url;

// where to look for the next urls in the current page?
var nextUrlSelector = scrape.nextUrlSelector;

// records to export in output file
var records = [];

// virtual console, because I don't want to see the long css parsing errors
var vconsole = new jsdom.VirtualConsole();

function scrapeAndRepeat(window) {

    if (window !== null && window !== undefined) {
        
        var $ = window.$;
        
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
    if (toVisit.length > 0 && (scrape.stopAfter===0 || scrape.visitedUrl.length < scrape.stopAfter)) {
        next_url = toVisit.shift();
        scrape.visitedUrl.push(next_url);
        
        var options = {
            runScripts: "dangerously",
            pretendToBeVisual: true,
            resources: "usable",
            virtualConsole: vconsole
        };
        JSDOM.fromURL(next_url, options).then(function(dom){
            var window = dom.window;
            var $ = jquery(window);
            $(window.document).ready(function(){
                var timer = dom.window.setTimeout(function(){
                    console.log("opening: " + dom.window.location.href);
                    scrapeAndRepeat(window);
                    window.clearTimeout(timer);
                }, scrape.waitForPage);
            });
            
        },
        function(status){
            console.log(status);
        });
        
    } else {
        // all urls visited. Export all the records.
        if (records.length > 0)
            serializeAndWrite(records, scrape.filename);
        
        console.log("Done. Bye!");
    }

}

/*
 * Serializing and writing to output file.
 */

function serializeAndWrite(data, filename) {

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