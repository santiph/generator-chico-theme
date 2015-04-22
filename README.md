# generator-chico-theme

[Yeoman](http://yeoman.io) generator for [Chico UI](http://chico-ui.com.ar/).

## Yo Chico UI
* Theme components customization
* Theme variations with `subtheme`
* Sass compiling
* Server with BrowserSync (127.0.0.1:3040)
* Automatic install of dependencies using Bower

## Getting Started

### Getting To Know Yeoman

If you'd like to get to know Yeoman better check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started). 

```bash
npm install -g yo
```

### Chico theme generator

To install generator-chico-theme from npm, run:

```bash
npm install -g generator-chico-theme
```

Finally, initiate the generator:

```bash
yo chico-theme
```

*While generating the theme you can customize the components that is not recommended. Create the main theme that
  includes all components and reuse them in subtheme* 

### Subtasks

To generate a subtheme (reuse the vars from main theme, customize components)

```bash
yo chico-theme:subtheme <Name>
```

### Theme structure

````
src/
|
|- styles/
   |
   |- _settings.scss // Common theme settings
   |- _settings-ui.scss // Contains the reference of all Sass variables for UI
   |- _settings-mobile.scss // Contains the reference of all Sass variables for Mobile
   |- theme-ui.scss // Main theme file for UI
   |- theme-mobile.scss // Main theme file for Mobile
````

*Preview theme on /ui.html or /mobile.html*

### Subtheme structure

````
src/
|
|- styles/
   |
   |- _settings-<name>.scss // Common subtheme settings
   |- _settings-<name>-ui.scss // An empty file, feel free to use it for UI theme overrides
   |- _settings-<name>-mobile.scss // An empty file, feel free to use it for Mobile theme overrides
   |- <name>-ui.scss // Main subtheme file for UI
   |- <name>-mobile.scss // Main subtheme file for Mobile
````

*Preview subtheme on /<name>-ui.html or /<name>-mobile.html*

## Gulp tasks:

run project
(compile Sass, execute BrowserSync server on 127.0.0.1:3040, watch changes, copy assets, uglify JS)
```
$ gulp
```
build project (no server)
```
$ gulp build
```

## License

MIT
