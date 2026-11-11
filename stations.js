"use strict";

const cheerio = require("cheerio");

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36";

// iamrad.io sockets push the current song as JSON right after connecting, then on every change.
const parseIamradio = (message) => {
  const data = JSON.parse(message);
  if (data.type !== "now") {
    return null;
  }
  return data.song ? [{ artist: data.artist, title: data.song }] : [];
};

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
    parse: parseIamradio
  },
  "rs2": {
    name: "rs2",
    type: "websocket",
    url: () => "wss://websocket.iamrad.io/v2/4/metadata/channel/7",
    headers: {
      "origin": "https://www.rs2.de",
      "user-agent": USER_AGENT
    },
    parse: parseIamradio
  },
  "radio-paradiso": {
    name: "Radio Paradiso",
    url: () => "https://radio-paradiso.api.radiosphere.io/channels/3fa6d22c-39b3-4bff-a9df-b74fd9a8211b/current-track?time=" + Date.now(),
    headers: {
      "accept": "application/json",
      "origin": "https://www.paradiso.de",
      "user-agent": USER_AGENT
    },
    // Returns { trackInfo: { title, artistCredits, ... }, lastUpdated }; trackInfo may be missing between songs.
    parse: (json) => {
      const track = JSON.parse(json).trackInfo;
      return track && track.title ? [{ artist: track.artistCredits || "", title: track.title }] : [];
    }
  }
};

module.exports = stations;
