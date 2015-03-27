# NodeScrapper

A simple [Node.js](http://nodejs.org/) application for scrapping [TechCrunch](http://techcrunch.com) website, saving its articles on home page to a [MongoDB](http://mongodb.org/) database and exposing a REST API for querying.

## REST API

### GET /sites/

Return the list of websites being scrapped. (Currently only TechCrunch)

### GET /writers/

Return the list of all writers on database.

### GET /writers/:site_url

Return the list of all writers from `:site_url` on database.

**Example:** `GET /writers/http://techcrunch.com`

### GET /articles/:site_url

Return the list of all articles from `:site_url` on database.

**Example:** `GET /articles/http://techcrunch.com`

### GET /articles/:site_url?query=:text

Return the list of all articles from `:site_url` on database where the query can be found on its title or content.

**Example:** `GET /articles/http://techcrunch.com?query=facebook`
