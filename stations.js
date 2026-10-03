"use strict";

const cheerio = require("cheerio");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36";

/*
 * Station registry. Each station provides:
 *   name    - display name
 *   type    - "http" (default) or "websocket"
 *   url     - function returning the URL to fetch (allows cache busting)
 *   headers - optional request headers
 *   parse   - http: function(responseText) returning an array of { artist, title }
 *             websocket: function(message) returning an array of { artist, title },
 *             or null to ignore the message and wait for the next one
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
  },
  "berliner-rundfunk": {
    name: "Berliner Rundfunk",
    type: "websocket",
    url: () => "wss://websocket.iamrad.io/v2/4/metadata/channel/5",
    headers: {
      "origin": "https://www.berliner-rundfunk.de",
      "user-agent": USER_AGENT
    },
    // The socket pushes the current song as JSON right after connecting, then on every change.
    parse: (message) => {
      const data = JSON.parse(message);
      if (data.type !== "now") {
        return null;
      }
      return data.song ? [{ artist: data.artist, title: data.song }] : [];
    }
  }
};

module.exports = stations;
