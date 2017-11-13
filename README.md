
# jScraping

**Very simple web scraping in jQuery style**.  
  
This is my personal web scraping tool. I wanted the simplicity of jQuery in navigating and manipulanting the DOM and the ability to execute the webpages' javascript so that I didn't loose any ajax-loaded content. Anything I've found so fare had one or the other feature but not both, so here is my solution.

## Features
- **Executes visited pages' javascript** so you don't loose any ajax-loaded content;
- Use **jQuery** on each visited page **to retrieve and manipulate dom elements**;
- Build **detailed web scraping task as a single js file**;
- **Super simple and compact feature specification format**;
- Optionally **limit the number of records kept in memory** for big jobs;
- Optionally **limit the overall number of pages visited**;
- **Look for urls to visit in dom elements just specifying css selectors**;
- **Automatic url filtering** to rewrite relative paths and ignore internal links;
- **Automatic duplicate urls avoidance**;

## Usage



```bash
node jScraping.js ./tasks/default.js
```

    Opening: https://en.wikipedia.org/wiki/Fact_checking
    Opening: https://en.wikipedia.org/wiki/Journalism
    Opening: https://en.wikipedia.org/wiki/File:Simons_Perskaart_DOM.jpg
    Opening: https://en.wikipedia.org/wiki/News
    Opening: https://en.wikipedia.org/wiki/News_style
    Opening: https://en.wikipedia.org/wiki/Journalism_ethics_and_standards
    Opening: https://en.wikipedia.org/wiki/Journalistic_objectivity
    Opening: https://en.wikipedia.org/wiki/News_values
    Opening: https://en.wikipedia.org/wiki/Source_(journalism)
    Opening: https://en.wikipedia.org/wiki/Defamation
    0
    
    Writing to 0-output.json
    Opening: https://en.wikipedia.org/wiki/Editorial_independence
    Opening: https://en.wikipedia.org/wiki/Journalism_school
    Opening: https://en.wikipedia.org/wiki/Index_of_journalism_articles
    Opening: https://en.wikipedia.org/wiki/Arts_journalism
    Opening: https://en.wikipedia.org/wiki/Business_journalism
    Opening: https://en.wikipedia.org/wiki/Data-driven_journalism
    Opening: https://en.wikipedia.org/wiki/Entertainment_journalism
    Opening: https://en.wikipedia.org/wiki/Environmental_journalism
    Opening: https://en.wikipedia.org/wiki/Fashion_journalism
    Opening: https://en.wikipedia.org/wiki/Medical_journalism
    1
    
    Writing to 1-output.json
    Done. Bye!


As we can imagine from the logs **we now have two json files with scraped data**. Here what one of these looks like:
  
`[
   {
      "title":"Fact checking - Wikipedia",
      "main_heading_font_size":"2em",
      "first_paragraph":"Fact checking is the act"
   },
   {
      "title":"Journalism - Wikipedia",
      "main_heading_font_size":"2em",
      "first_paragraph":"Journalism is the production and"
   },
   {
      "title":"File:Simons Perskaart DOM.jpg - Wikipedia",
      "main_heading_font_size":"2em",
      "first_paragraph":"This is a document owned"
   },
   ...
]`

As we can see the default task scrapes data from wikipedia starting from the page about Fact Checking, gets the page title, the font size of the main heading and the first 5 words of the first paragraph.
  
We can also notice that jScraper has created two files, named 0-output.json and 1-output.json, each with 10 records inside and has stopped after visiting 20 pages.
  
The **entirety of our scraper behavior is specified in the task file** we gave as an argument when we called jScraper from our command line (if we don't give any jScraper will execute the dafault.js task).
  
When we need to execute a scraping task we can either edit the default.js task file or copy it and build our own task.

## Task Options

| **Field** | **Description** | **Default** |
|-------|-------------|---------|
| **exports.initToVisit** | An array of **initial urls to visit**. If the scraping function does not add anything to the toVisit array, these will be the only visited pages. | `['https://en.wikipedia.org/wiki/Fact_checking']` |
| **exports.nextUrlSelector** | A css selector to **retrieve further urls to visit** in each page. Can be an "a" tag or a different element. In the second case jScraper will search inside it for anchor tags. | `'a[href^="/wiki"]'` (all relative urls starting with "/wiki") |
| **exports.recordDescription** | **What to grab and how to store it.** A dictionary in the form `{"key": ["selector", filterFunction]}` where **"key"** is the feature name we want, **"selector"** is the css selector of the DOM element in which to look for the feature we are looking for and **filterFunction** is a function that gets the selected DOM elements as a parameter and returns a string that will be used as value for our feature. **If null** $(selector).text() will be used as feature value. | `exports.recordDescription = {"title": ["title", null], "main_heading_font_size": ["h1", function(el) { return el.css('font-size'); }], "first_paragraph": ["p", function(el) { return el.first().text().split(' ').splice(0,5).join(' '); }]};` |
| **exports.filename** | **Filename for the output file(s)** | "output.json" |
| **exports.maxRecInMemory** | **Write to a file and remove the records from memory after this many records** are retrieved. It's a good idea to use this limit when you have to retrieve huge quantities of data. | 10 |
| **exports.stopAfter** | **Max number of pages to visit** | 20 |
| **exports.scrape** | **The actual scraping function**. This function will execute in the context of the visited web page. It's like writing javascript code in the console of your browser while on the web page, plus you have jQuery and an array to store interesting urls to visit later (**toVisit**) and an array where to store records if you build one while on this page (**records**). The dafault function is quite complete, you shouldn't need to rewrite it for most tasks if you act on the other parameters. | (see source code in task/default.js) |


## Author
  
**Francesco Manfredi**
- [Data For Fun](https://www.datafor.fun/?page_id=10)
- [Facebook](https://www.facebook.com/francescomanfrediwd)
- [Linkedin](https://www.linkedin.com/in/francesco-manfredi-8914a453/)
  
**jQuery**
- [Official website](https://jquery.com/)
  
**jsdom**
- [Github page](https://github.com/tmpvar/jsdom)

## Third Parties Libraries Licenses

**jQuery**
[license](https://jquery.org/license/)
  
**jsdom**
[license](https://github.com/tmpvar/jsdom/blob/master/LICENSE.txt)


```bash

```
