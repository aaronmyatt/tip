# DevSetup
Let's write a script to help install all the current (non-node) dependencies and run them inside a tmux shell - let's also install tmux 😂

As always, let's use [dax](https://jsr.io/@david/dax) to handle our shell interactions:
```ts
import $ from 'jsr:@david/dax';
```

## helper
Made a small blunder here, should be `$.logError(result.stderr);` not `$.log.error(result.stderr);`
```ts
input.quietUnlessError = async (cmd, successMessage, errorMessage) => {
  const result = await $(cmd)
  if (result.code !== 0) {
    $.logError(result.stderr);
    throw new Error(`${errorMessage}
    Try it manually: ${cmd}` || `Failed: ${cmd}`);
  }
  $.logStep(successMessage || `Success: ${cmd}`);
}
```

## Check if commands exist
```ts
input.commandMissing = {
  brew:       !(await $.commandExists('brew')),
  bun:        !(await $.commandExists('bun')),
  tmux:       !(await $.commandExists('tmux')),
  datasette:  !(await $.commandExists('datasette')),
  pocketbase: !($.path('./_pocketbase').isFileSync()),
}
console.log('Missing: ', input.commandMissing);
```

## Install Homebrew
1 hour rule:  I spent an hour trying to figure how to install brew via this script but kept running up against the same error:
`Error: Not implemented: command`
It seems to be failing inside the Dax library, so there's a chance we could run it by using [`Deno.Command`](https://docs.deno.com/api/deno/~/Deno.Command) manually. However, I prefer a simple outcome rather than sinking more hours into something that would only result in a marginal improvement.

Notice the use of `input.errors`. Pipedown uses this array internally to display caught errors from functins (codebocks). It will then skip all subsquent functions in the file. So we are piggybacking on this behaviour to bail out of the script early. 
- if: /commandMissing/brew
  ```ts
  input.errors = [`Brew is not installed.
  Please install brew manually with this command:
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  and then run this script again`]
  ```

## Install bun
I will replace this with Deno at the earliest opportunity, but so far Nuxt doesn't play nice with Deno.
- if: /commandMissing/bun
  ```ts
  await input.quietUnlessError(
    `brew install bun`, 
    "Success: Bun installed", 
    "Failed: Could not install Bun"
  );
  ```

## Install tmux
The average brew stdout is noisy as hell, I want it to be quite unless there's an error. 
- if: /commandMissing/tmux
  ```ts
  await input.quietUnlessError(
    `brew install tmux`, 
    "Success: Tmux installed", 
    "Failed: Could not install tmux"
  );
  ```

## Install datasette
https://docs.datasette.io/en/stable/installation.html#using-pipx
https://datasette.io/plugins/datasette-import

We use Datasette to provide some additional sqlite functionality and data exploration capabilities. I'm still thinking about whether to host it alongside the app behind pocketbases auth!
- if: /commandMissing/datasette
  ```ts
      const result = await $`brew install pipx; pipx ensurepath; pipx install datasette; pipx inject datasette datasette-import; pipx install sqlite-utils;`
        .stderr("piped");
      if(result.code !== 0) {
        $.log.error(result.stderr);
        throw new Error("Failed to install Datasette");
      }
      $.log("Datasette + dependencies installed ");
  ```
  
## Install pocketbase
https://pocketbase.io/

I have used this handy file download utility a few times now but it's disappointing to see that it was not ported to jsr. Seems like a good opportunity for a library pipe 😸

> _How do I run a checksum on the downloaded file?_ 
- if: /commandMissing/pocketbase
  ```ts
  import { download } from "https://deno.land/x/download/mod.ts";
  await download("https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_darwin_amd64.zip", {dir: "/tmp", file: 'pocketbase.zip'});
  await $`unzip -o /tmp/pocketbase.zip -d /tmp/`;
  await $`mv /tmp/pocketbase ./_pocketbase`;
  const exists = $.path('./_pocketbase').isFileSync()
  $.log(`Pocketbase installed: ${exists}`);
  ```

