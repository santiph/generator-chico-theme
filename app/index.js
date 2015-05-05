'use strict';
var _ = require('lodash');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var url = require('url');
var path = require('path');
var wrench = require('wrench');

_.mixin(require("underscore.string").exports());


var githubOptions = {
    version: '3.0.0'
};

var proxy = process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy ||
    process.env.HTTPS_PROXY || null;

if (proxy) {
    var proxyUrl = url.parse(proxy);
    githubOptions.proxy = {
        host: proxyUrl.hostname,
        port: proxyUrl.port
    };
}

var GitHubApi = require('github');
var github = new GitHubApi(githubOptions);

// Uses personal access token with minimal rights and readonly access
github.authenticate({
    type: 'oauth',
    token: '9fb31a0b851d299e369a37a01502e896d625bec0'
});

var emptyGithubRes = {
    name: '',
    email: '',
    html_url: ''
};

var githubUserInfo = function (name, cb, log) {
    github.user.getFrom({
        user: name
    }, function (err, res) {
        if (err) {
            log(chalk.red('Cannot fetch your github profile. Make sure you\'ve typed it correctly.'));
            res = emptyGithubRes;
        }
        cb(JSON.parse(JSON.stringify(res)));
    });
};

module.exports = yeoman.generators.Base.extend({
    initializing: function () {
        this.pkg = require('../package.json');
        this.components = require('../data/components.json');
    },

    prompting: function () {
        var done = this.async();
        var componentsChoises = _.map(this.components, function (c, k) {
            return {
                name: k[0].toUpperCase() + k.substring(1),
                checked: ['base', 'reset'].indexOf(k.toLowerCase()) !== -1
            }
        });

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the mind-blowing ' + chalk.red('ChicoTheme') + ' generator!'
        ));

        var prompts = [{
            name: 'name',
            message: 'What is the name of your new theme?',
            default: 'Chico Theme',
            store: true,
            validate: function(name) {
                if (/[^a-z0-9]/i.test(name[0])) {
                    return 'The theme name should begin with an alphanumeric symbol';
                }

                return true;
            }
        }, {
            name: 'author',
            message: 'What is your username on GitHub?',
            store: true
        }, {
            name: 'customizeTheme',
            message: 'Would you like to customize the theme components?',
            type: 'confirm',
            default: false
        }, {
            name: 'themeComponents',
            message: 'Choose the components that you want to include',
            type: 'checkbox',
            when: function (props) {
                return props.customizeTheme;
            },
            choices: componentsChoises,
            validate: function (answers) {
                if (answers.length < 1) {
                    return "You must choose at least one component";
                }
                return true;
            }
        }, {
            name: 'bowerDirectory',
            message: 'What is the path in which bower components should be saved?',
            default: 'bower_components',
            store: true
        }];

        this.prompt(prompts, function (props) {
            this.opts = {};
            this.opts.name = props.name;
            this.opts.slugifiedName = _.slugify(props.name);
            this.opts.customizeTheme = props.customizeTheme;
            this.opts.components = props.themeComponents || [];
            this.opts.bower = {
                directory: props.bowerDirectory
            };
            this.opts.isSubtheme = false;
            this.config.set('bower', {
                directory: props.bowerDirectory
            });
            this.config.save();

            githubUserInfo(props.author, function (res) {
                this.opts.author = res;
                done();
            }.bind(this), this.log);
        }.bind(this));
    },

    configuring: function () {
        this.copy(this.templatePath('editorconfig'), this.destinationPath('.editorconfig'));
        this.copy(this.templatePath('jshintrc'), this.destinationPath('.jshintrc'));
        this.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
        this.fs.copyTpl(this.templatePath('bowerrc'), this.destinationPath('.bowerrc'), this.opts.bower);
    },

    writing: {
        app: function () {
            this.fs.copyTpl(this.templatePath('_gulpfile.js'), this.destinationPath('gulpfile.js'), this.opts);
        },
        theme: function () {
            var uiComponents = [],
                mobileComponents = [];

            this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), this.opts);
            this.fs.copyTpl(this.templatePath('_bower.json'), this.destinationPath('bower.json'), this.opts);

            if (this.opts.customizeTheme) {
                this.opts.components.forEach(function (c) {
                    var component = c.toLowerCase();
                    if (this.components.hasOwnProperty(component)) {
                        if (this.components[component].ui) {
                            uiComponents.push(component);
                        }
                        if (this.components[component].mobile) {
                            mobileComponents.push(component);
                        }
                    }
                }.bind(this));

                this.fs.copyTpl(this.templatePath('_theme-ui-custom.scss'), this.destinationPath('src/styles/theme-ui.scss'), {
                    components: uiComponents
                });
                this.fs.copyTpl(this.templatePath('_theme-mobile-custom.scss'), this.destinationPath('src/styles/theme-mobile.scss'), {
                    components: mobileComponents
                });
            } else {
                _.each(this.components, function (c, k) {
                    if (c.ui) {
                        uiComponents.push(k);
                    }
                    if (c.mobile) {
                        mobileComponents.push(k);
                    }
                }.bind(this));

                this.fs.copyTpl(this.templatePath('_theme-ui-original.scss'), this.destinationPath('src/styles/theme-ui.scss'), this.opts);
                this.fs.copyTpl(this.templatePath('_theme-mobile-original.scss'), this.destinationPath('src/styles/theme-mobile.scss'), this.opts);
            }

            this.fs.copyTpl(this.templatePath('_ui.html'), this.destinationPath('src/views/ui.html'), _.extend(this.opts, {
                components: uiComponents
            }));
            this.fs.copyTpl(this.templatePath('_mobile.html'), this.destinationPath('src/views/mobile.html'), _.extend(this.opts, {
                components: uiComponents
            }));
        }
    },

    install: function () {
        if (!this.options['skip-install']) {
            this.installDependencies({
                skipMessage: this.options['skip-install-message'],
                skipInstall: this.options['skip-install']
            });
        }
    },

    end: function() {
        if (this.options.test) {
            return this;
        }

        var sharedVariables = {},
            uiVariables = {},
            mobileVariables = {},

            chicoSrc = path.join(process.cwd(), this.opts.bower.directory, 'chico/src/'),
            sharedStyles = path.join(chicoSrc, 'shared/styles/'),
            sharedFiles = wrench.readdirSyncRecursive(sharedStyles),
            uiStyles = path.join(chicoSrc, 'ui/styles/'),
            uiFiles = wrench.readdirSyncRecursive(uiStyles),
            mobileStyles = path.join(chicoSrc, 'mobile/styles/'),
            mobileFiles = wrench.readdirSyncRecursive(mobileStyles);

        function extractSassVars(f, t) {
            var matches,
                groupName;

            if(matches = /_(.+)-variables\.scss/i.exec(f)) {
                groupName = matches[1];
                if (t === 'shared' && !sharedVariables[groupName]) {
                    sharedVariables[groupName] = {};
                }
                if ((t === 'shared' || t === 'ui') && !uiVariables[groupName]) {
                    uiVariables[groupName] = {};
                }
                if ((t === 'shared' || t === 'mobile') && !mobileVariables[groupName]) {
                    mobileVariables[groupName] = {};
                }

                var fr = new wrench.LineReader(path.join(t === 'mobile' ? mobileStyles : (t === 'ui' ? uiStyles : sharedStyles), f));
                while(fr.hasNextLine()) {
                    var line = fr.getNextLine(),
                        matches = /^\s?(\$.+):(.+);/.exec(line);

                    if (matches) {
                        var k = matches[1].trim(),
                            v = matches[2].trim().replace(/\s+\!default/, '');

                        if (t === 'shared') {
                            sharedVariables[groupName][k] = v;
                        }
                        if (t === 'shared' || t === 'ui') {
                            uiVariables[groupName][k] = v;
                        }
                        if (t === 'shared' || t === 'mobile') {
                            mobileVariables[groupName][k] = v;
                        }
                    }
                }
            }
        }
        sharedFiles.forEach(function(f){ extractSassVars(f, 'shared') });
        uiFiles.forEach(function(f){ extractSassVars(f, 'ui') });
        mobileFiles.forEach(function(f){ extractSassVars(f, 'mobile') });

        this.log('Generating the Sass variables reference for ' + chalk.green(this.opts.name) + ' theme');
        this.fs.copyTpl(
            this.templatePath('_settings.scss'),
            this.destinationPath('src/styles/_settings.scss'),
            {
                _: _,
                groups: sharedVariables
            }
        );
        this.fs.copyTpl(
            this.templatePath('_settings-ui.scss'),
            this.destinationPath('src/styles/_settings-ui.scss'),
            {
                _: _,
                groups: uiVariables
            }
        );
        this.fs.copyTpl(
            this.templatePath('_settings-mobile.scss'),
            this.destinationPath('src/styles/_settings-mobile.scss'),
            {
                _: _,
                groups: mobileVariables
            }
        );

        if (!this.config.get('subthemes')) {
            this.config.set('subthemes', {});
        }
    }
});
