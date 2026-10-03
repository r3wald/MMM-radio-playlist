"use strict";

const cheerio = require("cheerio");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36";

/*
 * Station registry. Each station provides:
 *   name    - display name
 *   url     - function returning the URL to fetch (allows cache busting)
 *   headers - optional request headers
 *   parse   - function(responseText) returning an array of { artist, title }
 */
const stations = {
  "radio-1": {
    name: "Radio 1",
    url: () => "https://www.radioeins.de/include/rad/nowonair/now_on_air.html?cacheKiller=" + Date.now(),
    headers: {
      "accept": "text/html, */*; q=0.01",
      "referer": "https://www.radioeins.de/",
      "user-agent": USER_AGENT,
      "x-requested-with": "XMLHttpRequest"
    },
    // The endpoint returns an HTML fragment, or an empty body when no song is playing.
    parse: (html) => {
      const $ = cheerio.load(html);
      const track = {
        artist: $("p.artist").first().text().trim(),
        title: $("p.songtitle").first().text().trim()
      };
      return track.title ? [track] : [];
    }
  }
};

module.exports = stations;
