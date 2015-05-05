# generator-chico-theme

[Yeoman](http://yeoman.io) generator for [Chico UI](http://chico-ui.com.ar/).

## Features
* Theme components customization
* Theme variations (subthemes)
* Sass compiling
* Development server with [BrowserSync](http://www.browsersync.io/)
* Automatic install of dependencies using Bower

## Getting Started

### Prerequisites

Before the begin you must have **yo**, **bower** and **gulp** installed globally.

```bash
npm install -g yo bower gulp
```

*Note*: You may need to prefix this and the next command with `sudo` on *nix systems.

If you'd like to get to know Yeoman better check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started).

### Usage

To install generator-chico-theme from npm, run:

```bash
npm install -g generator-chico-theme
```

Make a new directory and `cd` into it:

```bash
mkdir my-theme && cd $_
```

And initiate the generator:

```bash
yo chico-theme
```

After a few questions generator will generate the theme. Example:

```bash
yo chico-theme
    [?] What is the name of your new theme? My Theme
    [?] What is your username on GitHub? username
    [?] Would you like to customize the theme components? No
    [?] What is the path in which bower components should be saved? bower_components
```

*Note*: While generating a theme you can customize its components but this is not
recommended. Create the main theme that includes all components and reuse them later in
subthemes.

### Theme structure

````
src
│
└──styles
   │
   ├──_settings.scss               // Common theme settings
   ├──_settings-ui.scss            // Contains the reference of all Sass variables for UI
   ├──_settings-mobile.scss        // Contains the reference of all Sass variables for Mobile
   ├──theme-ui.scss                // Theme main file for UI
   └──theme-mobile.scss            // Theme main file for Mobile
````

*Note*: Preview is available on `/ui.html` or `/mobile.html` after the `gulp` command

### Subtasks

To generate a subtheme (reuse the vars from main theme, customize components)

```bash
yo chico-theme:subtheme <Name>
```

Example:
```bash
yo chico-theme:subtheme Home
    ? Would you like to customize the subtheme components? Yes
    ? Choose the components that you want to include: Reset, Base, Buttons, Form, Typography
```

### Subtheme structure

````
src
│
└──styles
   │
   ├──_settings-<name>.scss         // Common subtheme settings
   ├──_settings-<name>-ui.scss      // An empty file, feel free to use it for UI theme overrides
   ├──_settings-<name>-mobile.scss  // An empty file, feel free to use it for Mobile theme overrides
   ├──<name>-ui.scss                // Subtheme main file for UI
   └──<name>-mobile.scss            // Subtheme main file for Mobile
````

*Note*: Preview is available on `/<name>-ui.html` or `/<name>-mobile.html` after the `gulp` command

### Compiled theme structure
This structure is based on examples provided above

````
build
└──assets
   │
   ├──icons.woff
   ├──loading.gif
   ├──...                // everything else from original Chico UI
   ui
   │
   ├──home.css           // Subtheme style for ui (desktop)
   ├──theme.css          // Main theme style for ui (desktop)
   ├──ui.js              // Minified ui JS
   mobile
   │
   ├──home.css           // Subtheme style for mobile
   ├──theme.css          // Main theme style for mobile
   └──mobile.js          // Minified mobile JS
````

## Gulp tasks:

**run project**
(compile Sass, execute BrowserSync server on 127.0.0.1:3040, watch changes, copy assets, uglify JS)

```
$ gulp
```

**build project**
(same as default but no server)

```
$ gulp build
```

## License

MIT
