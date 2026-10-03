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
    stations: ["radio-1"],   // ids from stations.js
    updateInterval: 60000    // ms
  }
}
```

New stations are added in `stations.js` (`name`, `url`, `headers`, `parse`).
