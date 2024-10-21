# GSheet Exporter
Download a public Google Sheet as a CSV file. Optionally, you can specify the format and the file name via the following input parameters:
- `sheet`: The URL of the Google Sheet to download.
- `format`: The format of the file to download. Default is `csv`.
- `exportName`: The name of the file to download. Default is `sheet` (results in `sheet.csv`).

## Libraries
We are using the [Dax library](https://jsr.io/@david/dax#shell) to handle all interactions with the command line.
```ts
import $ from 'jsr:@david/dax';
```

## Sheet to download
Found this [example Google Sheet](https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?gid=0#gid=0) after quick search. This function is skipped if `input.sheet` is already set.
- not: /sheet
  ```ts
  input.sheet = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?gid=0#gid=0'
  ```

## Some variables
Setup some variables to be used later. If `input.format` is not set, we default to `csv`. If `input.exportName` is not set, we default to `sheet`.
```ts
input.format = input.format || 'csv'
input.fileName = `${input.exportName || 'sheet'}.${input.format}`
```

## Download gsheet data

![Export CSV](/images/gsheetExporter/exportCsvFromGsheet.png)

When we request to download a Google Sheet a very similar URL to the one we were using to view the spreadsheet can be seen in the network requests. The main differences are that the URL has `/export` appended to it. The URL also has a `format` query parameter set to `csv`. 👇

- example export url: https://docs.google.com/spreadsheets/u/1/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms&gid=0
- cdn redirect url: https://doc-10-5c-sheets.googleusercontent.com/export/bhtpn0s58k5p00cuujrfvbqrdg/bvvqemusqkon8atd8qjbn91m30/1728659400000/100630705629414352418/112239389343096482311/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms?format=csv&id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms&gid=0&dat=AAt6Q5UEXD_8dRKJt0hDz1mBOkxdqciBIEgdpcXtn9cF1tZC5qf1h9bAhSVgDTJHJEMvUN5R7_Lv6tNxZSwxEqLOSMIZ8tr7NzysXn9XlTeY3WVdIZxa87Qyi9UV-6matJY7RAkfh9cZB7L7Mpxlx8dLxyuWXVhzCOJxuPsqDz5v0U6NAlZp-RU3QOvf5v3BHm8muB12sm9S2LHa5oRiSlDJUwxuvwiURxQjMHM-nQ_84FevX1D5-tY3eUqypPcdATJ6c73kG_zVMb_rrQMiuU9v9dszlEITiH6RVG2zTPNBhqzEq3Odqv-gz3jIZk32NEB5s9zxRw_NkDws83orqs_R2RB3B5ONU0tBWUFR_TMqdB4IJTOrv5MsFtye_MVdT6LAzDoVrBNjKz5QI2kt7pC53PWGu8U0wQyEcE3J3mvEbdfyNTEfqeapgyEgtHw60oEeIwSeix6LB-24tyySNo9CgfNWPQxxspiJmKupe81GXPwe6bcrawWxGDN9eXs04oyahAPa6LlDXHQuV3bRJhCMeVgsgNWvEtXnteXPBzlR1EHE8fwjRtr-McNIuFw_hgP85eMBzxdTavT8i8P0dq_P9zgGU6ElR0hjJC90UjB6hplLHUlweni7q_cp7yOnfNLJegaDsk7xZHJgTvKvjl8CRn-3rGwQrY0TUy4c7RDkcQpcPnQL_3qzD-QAsPTBg9zG_LuxKBxuzMPEF5YPDjtJtZlbwwpH08-gYZyr2lRVloi-OKgYso_PRj_J00-gthVcyKXefugDEw7FODF_5fVcdTlflCwTXXOaz05ey4m3ZsoL5bOEFMRZe0QXODPKmNnJ6ylrF00XXsmhI91XTdgFSDgtKcpEFxp_I_uuXhnr5hIfRrWTXR-Uwobkt6A4cw94suW6-uOL1qOSsD1KjesCwL-NpeIXT7j2CevBAobUZfoK9zv0gJhmXuMrJEAMOOq0fDHgRf74Xll_vQeHVogWihnCAht0JHDnetBBonHHiOXNI2w

Let's use a [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) to extract out the pieces of the "view" URL and build a new URL to download the data.

exportUrl will be updated with the values extracted from the pattern (`input.sheet`).
```ts
input.exportUrl = new URL('https://docs.google.com/spreadsheets')
input.pattern = new URLPattern('https://docs.google.com/spreadsheets/d/:id/edit?gid=:gid#gid=:gid')
```

## Check if file already exists
To save us from doing unnecessary work, we can check if the file already exists in the `/tmp/` directory. If it does, we can skip the next download steps.
```ts
input.gogoDownload = true
input.tmpDirFiles = await $`ls /tmp/`.lines()
if(input.tmpDirFiles.find(file => file === input.fileName)) {
  input.gogoDownload = false // skip download
  $.log(`File already exists: ${input.fileName}`)
} else {
  $.log(`File missing, let's download it: ${input.fileName}`)
}
```

## Build the download URL
Extract the `id`, `gid`, and `hash` from the `input.sheet` URL and update the `exportUrl` with the new values.
- if: /gogoDownload
  ```ts
  const url = input.pattern.exec(input.sheet)
  const [id, gid, hash] = [$p.get(url, '/pathname/groups/id'), $p.get(url, '/search/groups/gid'), $p.get(url, '/hash/input')]
  input.exportUrl.searchParams.set('format', input.format)
  input.exportUrl.searchParams.set('id', id)
  input.exportUrl.searchParams.set('gid', gid)
  input.exportUrl.hash = hash
  input.exportUrl.pathname = input.exportUrl.pathname+`/u/1/d/${id}/export`
  $.log(`Export URL: ${input.exportUrl}\n`)
  ```
  

## Download the file
Download the file using `curl` and save it to `/tmp/` directory.
- if: /gogoDownload
  ```ts
  input.curlResult = await $`curl -L -o /tmp/${input.fileName} ${input.exportUrl}`
  $.log(`File downloaded: ${input.fileName}`)
  ```
