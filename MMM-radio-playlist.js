/* eslint-disable indent */
"use strict";

Module.register("MMM-radio-playlist", {

  defaults: {
    updateInterval: 60000,
    stations: ["radio-1"],
    header: "Currently playing..."
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
      this.stations = payload.stations;
      this.updateDom();
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    const header = document.createElement("header");
    header.className = "module-header";
    header.textContent = "Im Radio...";
    wrapper.appendChild(header);

    if (!this.stations) {
      const loading = document.createElement("div");
      loading.className = "dimmed";
      loading.textContent = "Lade...";
      wrapper.appendChild(loading);
      return wrapper;
    }

    const list = document.createElement("ul");
    this.stations.forEach((station) => {
      const item = document.createElement("li");
      let text;
      if (station.error) {
        text = "nicht verfügbar";
        item.className = "dimmed";
      } else if (station.tracks.length === 0) {
        text = "–";
      } else {
        text = station.tracks.map((track) => track.artist + " / " + track.title).join(", ");
      }
      item.textContent = station.station + ": " + text;
      list.appendChild(item);
    });
    wrapper.appendChild(list);
    return wrapper;
  },

  getStyles: function () {
    return [
      "MMM-radio-playlist.css"
    ];
  }
});
