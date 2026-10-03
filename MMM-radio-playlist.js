/* eslint-disable indent */
"use strict";

Module.register("MMM-radio-playlist", {

  defaults: {
    updateInterval: 60000,
    animationSpeed: 1000,
    stations: ["radio-1", "berliner-rundfunk"],
    maxTracks: 1,
    fixUppercase: true,
    header: "Im Radio"
  },

  start: function () {
    this.stations = null;
    this.sendSocketNotification("RADIO_PLAYLIST_START", {
      identifier: this.identifier,
      config: this.config
    });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RADIO_PLAYLIST_DATA" && payload.identifier === this.identifier) {
      // only redraw (with a fade) when something actually changed
      if (JSON.stringify(payload.stations) !== JSON.stringify(this.stations)) {
        this.stations = payload.stations;
        this.updateDom(this.config.animationSpeed);
      }
    }
  },

  getHeader: function () {
    return this.data.header || this.config.header;
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "radio-playlist";

    if (!this.stations) {
      wrapper.className += " small dimmed light";
      wrapper.textContent = "Lade …";
      return wrapper;
    }

    this.stations.forEach((station) => {
      const block = document.createElement("div");
      block.className = "station";

      const name = document.createElement("div");
      name.className = "station-name xsmall dimmed";
      name.textContent = station.station;
      block.appendChild(name);

      if (station.error) {
        block.appendChild(this.createLine("status small dimmed light", "nicht erreichbar"));
      } else if (station.tracks.length === 0) {
        block.appendChild(this.createLine("status small dimmed light", "gerade kein Titel"));
      } else {
        station.tracks.slice(0, this.config.maxTracks).forEach((track) => {
          block.appendChild(this.createLine("title medium bright", this.formatName(track.title)));
          if (track.artist) {
            block.appendChild(this.createLine("artist small normal light", this.formatName(track.artist)));
          }
        });
      }
      wrapper.appendChild(block);
    });
    return wrapper;
  },

  createLine: function (className, text) {
    const line = document.createElement("div");
    line.className = className;
    line.textContent = text;
    return line;
  },

  // Some stations send everything in capitals ("ROOM WITH A VIEW") - convert those to title case.
  formatName: function (text) {
    if (!this.config.fixUppercase || text !== text.toUpperCase()) {
      return text;
    }
    return text.toLowerCase().replace(/(^|[\s\-\/(&"])(\p{L})/gu, (match, separator, letter) => separator + letter.toUpperCase());
  },

  getStyles: function () {
    return [
      "MMM-radio-playlist.css"
    ];
  }
});
