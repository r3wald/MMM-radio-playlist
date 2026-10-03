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
      const tracks = station.type === "websocket"
        ? await this.receiveWebSocket(station)
        : await this.fetchHttp(station);
      return { station: station.name, tracks };
    } catch (error) {
      console.error("[MMM-radio-playlist] " + station.name + ": " + error.message);
      return { station: station.name, error: true, message: error.message };
    }
  },

  fetchHttp: async function (station) {
    const response = await fetch(station.url(), {
      headers: station.headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return station.parse(await response.text());
  },

  // Connects, waits for the first relevant message and disconnects again.
  receiveWebSocket: function (station) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(station.url(), { headers: station.headers });
      const finish = (callback, value) => {
        clearTimeout(timeout);
        ws.onmessage = ws.onerror = ws.onclose = null;
        ws.close();
        callback(value);
      };
      const timeout = setTimeout(() => finish(reject, new Error("Timeout")), REQUEST_TIMEOUT);
      ws.onmessage = (event) => {
        try {
          const tracks = station.parse(String(event.data));
          if (tracks) {
            finish(resolve, tracks);
          }
        } catch (error) {
          finish(reject, error);
        }
      };
      ws.onerror = (event) => finish(reject, new Error(event.message || "WebSocket error"));
      ws.onclose = (event) => finish(reject, new Error("WebSocket closed (" + event.code + ")"));
    });
  },

  stop: function () {
    Object.values(this.timers).forEach(clearInterval);
  }
});
