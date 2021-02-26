# JSONResume toolset

This is a tool made to help building JSONResume CVs, it mainly adds a spellchecker.

If you wanna check how it looks, [here it is](./example.pdf).

## How to install a theme

- Choose your theme (https://jsonresume.org/themes/)
- Install the npm package 

```bash
$ npm install jsonresume-theme-macchiato
```

## Running it

You must send the theme as a parameter to the export and serve commands

### Export PDF
```bash
$ npm run export-pdf -- --theme flat
```

### Export HTML
```bash
$ npm run export-html -- --theme flat
```

### Serve with live reload
```bash
$ npm run serve -- --theme flat
```
