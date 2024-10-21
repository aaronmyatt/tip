# Wiki Wallpaper Fetcher

Fetch image of the day from Wikimedia and use it as the wallpaper of a Mac

## Usage potentional:
```bash
deno compile .pd/wikiWallpaperAutomater/cli.ts
./dailyWallpaper
```

```bash
deno install -gf -n wikiWallpaperAutomater .pd/wikiWallpaperAutomater/cli.ts
dailyWallpaper
```

```js skip
// from a Pipedown .md file
// or `pd repl`
import dailyWallpaper from "./wikiWallpaperAutomater.ts";
```

### Call the WikiMedia API

> Note that the header requirements are quite strict and you need to generate an
> API key Outputs:

- input.wikiJson
- input.imageUrl

```ts
let today = new Date();
let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, "0");
let day = String(today.getDate()).padStart(2, "0");
let url =
  `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

let response = await fetch(url, {
  headers: {
    Authorization:
      "Bearer " + $p.get(opts, '/config/wikiKey'),
    "Api-User-Agent": `Pipedown (${$p.get(opts, '/config/myEmail')})`,
  },
});
input.wikiJson = await response.json();
input.imageUrl = input.wikiJson["image"]["image"]["source"];
```

---

## Download the Image
Now that we have a reference to the image of the day, we can use the "download" Deno library to save the image from Wikimedia locally
```ts
import { download } from "https://deno.land/x/download/mod.ts";

try {
  input.imageFile = await download(input.imageUrl);
} catch (err) {
  input.error = err;
}
```

---

### Set Wallpaper

Finally, we the super Dax library to run a simple (awkward af) Applescript to save override the current wallpaper. 

> I can't overstate how much Googling it took to find a workable `osascript` command. Need to dig into the AppleScript documentation at some point!

```ts
import _$ from "https://deno.land/x/dax/mod.ts";
input.osaout =
  await _$`osascript -e 'tell application "System Events" to tell every desktop to set picture to "${input.imageFile.fullPath}"'`
    .captureCombined();
```