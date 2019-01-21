/* eslint-disable indent */
"use strict";

Module.register("MMM-radio-playlist", {

  defaults: {
    animationSpeed: 60000,
    header: "Currently playing..."
  },

  start: function () {
    var self = this;
    setInterval(function () {
      self.updateDom();
    }, this.config.animationSpeed);
  },

  stations: {
    "berliner-rundfunk": function () {
      let result = null;
      // avoid CORS problems
      const url = "https://cors-anywhere.herokuapp.com/https://www.berliner-rundfunk.de/node/playlist/1/";
      jQuery
        .get({
          url: url,
          dataType: "xml",
          async: false
        })
        .done((xml) => {
          const x = jQuery(xml);
          result = {
            station: "Berliner Rundfunk",
            tracks: []
          };
          x.find("playlist > song").each(function (i, song) {
            song = jQuery(song);
            const r = {
              artist: song.children("artist").text(),
              title: song.children("song").text()
            };
            result.tracks.push(r);
          });
          return result;
        })
        .fail((error) => {
          return {
            station: "Berliner Rundfunk",
            error: true,
            message: error
          };
        });
      return result;
    },
    "radio-1": function () {
      let result = null;
      jQuery
        .get({
          url: "https://www.radioeins.de/include/rad/nowonair/now_on_air.html",
          async: false
        })
        .done((message) => {
          const x = jQuery("<div>" + message + "</div>");
          const track = {
            artist: x.children("p.artist").text(),
            title: x.children("p.songtitle").text()
          };
          result = {
            station: "Radio 1",
            tracks: []
          };
          if (track.title) {
            result.tracks.push(track);
          }
          return result;
        })
        .fail((error) => {
          return {
            station: "Radio 1",
            error: true,
            message: error
          };
        });
      return result;
    }
  },

  getAllStations: function () {
    let result = [];
    result.push(this.stations["berliner-rundfunk"]());
    result.push(this.stations["radio-1"]());
    return result;
  },

  getDom: function () {
    // moment.locale("de");
    var wrapper = document.createElement("div");
    const stations = this.getAllStations();
    let output = "<header class=\"module-header\">Im Radio...</header>";
    output += "<ul>";
    jQuery(stations).each(function (i, j) {
      output += "<li>" + j.station + ": ";
      jQuery(j.tracks).each(function (k, l) {
        output += "" + l.artist + " / " + l.title + ", ";
      });
      output += "</ul></li>";
    });
    output += "</ul>";
    wrapper.innerHTML = output;
    return wrapper;
  },

  getScripts: function () {
    return [
      "jquery-2.2.3.min.js"
    ];
  },

  getStyles: function () {
    return [
      "MMM-radio-playlist.css"
    ];
  }
});
