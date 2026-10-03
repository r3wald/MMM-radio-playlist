# MMM-radio-playlist
show what's currently playing on the radio

## Installation

```bash
cd ~/MagicMirror/modules
git clone <repo-url> MMM-radio-playlist
cd MMM-radio-playlist
npm install
```

## Configuration

```js
{
  module: "MMM-radio-playlist",
  position: "top_right",
  config: {
    stations: ["radio-1", "berliner-rundfunk"],   // ids from stations.js
    updateInterval: 60000,   // ms
    animationSpeed: 1000,    // fade duration on change, ms
    maxTracks: 1,            // tracks per station
    fixUppercase: true,      // "ROOM WITH A VIEW" -> "Room With A View"
    header: "Im Radio"
  }
}
```

New stations are added in `stations.js` (`name`, `type`, `url`, `headers`, `parse`).
Stations can be polled via HTTP or read from a WebSocket (requires Node.js 22+).
