"use strict";

const NodeHelper = require("node_helper");
const stations = require("./stations");

const REQUEST_TIMEOUT = 10000;

module.exports = NodeHelper.create({

  start: function () {
    // one timer per module instance
    this.timers = {};
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RADIO_PLAYLIST_START") {
      const { identifier, config } = payload;
      clearInterval(this.timers[identifier]);
      this.update(identifier, config);
      this.timers[identifier] = setInterval(() => this.update(identifier, config), config.updateInterval);
    }
  },

  update: async function (identifier, config) {
    const results = await Promise.all(config.stations.map((id) => this.fetchStation(id)));
    this.sendSocketNotification("RADIO_PLAYLIST_DATA", { identifier, stations: results });
  },

  fetchStation: async function (id) {
    const station = stations[id];
    if (!station) {
      return { station: id, error: true, message: "Unknown station" };
    }
    try {
      const response = await fetch(station.url(), {
        headers: station.headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return { station: station.name, tracks: station.parse(await response.text()) };
    } catch (error) {
      console.error("[MMM-radio-playlist] " + station.name + ": " + error.message);
      return { station: station.name, error: true, message: error.message };
    }
  },

  stop: function () {
    Object.values(this.timers).forEach(clearInterval);
  }
});
