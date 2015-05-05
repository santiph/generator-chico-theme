var _ = require('lodash');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var ast = require('ast-query');

_.mixin(require("underscore.string").exports());


module.exports = yeoman.generators.NamedBase.extend({
    initializing: function () {
        this.pkg = require('../package.json');
        this.components = require('../data/components.json');
        this.subthemes = this.config.get('subthemes') || {};

        if (/[^a-z0-9]/i.test(this.name[0])) {
            throw new Error('The name should begin with an alphanumeric symbol');
        }
        if (this.name.trim().toLowerCase() === 'theme') {
            throw new Error('Reserved word as a theme name is not allowed');
        }

        // Set the source root to a main generator's templates folder to do not DRY.
        this.sourceRoot(path.resolve(this.sourceRoot(), '../../app/templates'));
    },

    prompting: function () {
        var self = this;
        var done = this.async();
        var proceed = true;
        var componentsChoises = _.map(this.components, function (c, k) {
            return {
                name: k[0].toUpperCase() + k.substring(1),
                checked: ['base', 'reset'].indexOf(k.toLowerCase()) !== -1
            }
        });

        var prompts = [{
            name: 'subthemeOverwrite',
            message: 'Subtheme with the same name is already exist. Do you want to modify it?',
            type: 'confirm',
            default: true,
            when: function() {
                return !!self.subthemes[_.slugify(self.name)];
            }
        }, {
            name: 'customizeTheme',
            message: 'Would you like to customize the subtheme components?',
            type: 'confirm',
            default: false,
            when: function(props) {
                return !self.subthemes[_.slugify(self.name)] || props.subthemeOverwrite;
            }
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
        }];

        this.prompt(prompts, function (props) {
            this.options = {};
            this.options.name = this.name;
            this.options.slugifiedName = _.slugify(this.name);
            this.options.customizeTheme = props.customizeTheme;
            this.options.components = props.themeComponents || [];
            this.options.bower = this.config.get('bower') || {'directory': 'bower_components'};
            this.options.isSubtheme = true;
            this.options.subthemeExist = !!self.subthemes[this.options.slugifiedName];
            this.options.subthemeOverwrite = props.subthemeOverwrite;

            done();
        }.bind(this));
    },

    writing: {
        subtheme: function () {
            var uiComponents = [],
                mobileComponents = [];

            if (this.options.subthemeExist && !this.options.subthemeOverwrite) {
                return;
            }

            if (!this.fs.exists(this.destinationPath('src/styles/_settings-' + this.options.slugifiedName + '.scss'))) {
                this.fs.copyTpl(this.templatePath('_settings.scss'),
                    this.destinationPath('src/styles/_settings-' + this.options.slugifiedName + '.scss'),
                    this.options
                );
            }
            if (!this.fs.exists(this.destinationPath('src/styles/_settings-' + this.options.slugifiedName + '-ui.scss'))) {
                this.fs.write(
                    this.destinationPath('src/styles/_settings-' + this.options.slugifiedName + '-ui.scss'),
                    ''
                );
            }
            if (!this.fs.exists(this.destinationPath('src/styles/_settings-' + this.options.slugifiedName + '-mobile.scss'))) {
                this.fs.write(
                    this.destinationPath('src/styles/_settings-' + this.options.slugifiedName + '-mobile.scss'),
                    ''
                );
            }

            if (this.options.customizeTheme) {
                this.options.components.forEach(function (c) {
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

                this.fs.copyTpl(this.templatePath('_theme-ui-custom.scss'),
                    this.destinationPath('src/styles/' + this.options.slugifiedName + '-ui.scss'),
                    _.extend(this.options, {components: uiComponents})
                );
                this.fs.copyTpl(this.templatePath('_theme-mobile-custom.scss'),
                    this.destinationPath('src/styles/' + this.options.slugifiedName + '-mobile.scss'),
                    _.extend(this.options, {components: mobileComponents})
                );
            } else {
                _.each(this.components, function (c, k) {
                    if (c.ui) {
                        uiComponents.push(k);
                    }
                    if (c.mobile) {
                        mobileComponents.push(k);
                    }
                }.bind(this));

                this.fs.copyTpl(this.templatePath('_theme-ui-original.scss'),
                    this.destinationPath('src/styles/' + this.options.slugifiedName + '-ui.scss'),
                    _.extend(this.options, {components: uiComponents})
                );
                this.fs.copyTpl(this.templatePath('_theme-mobile-original.scss'),
                    this.destinationPath('src/styles/' + this.options.slugifiedName + '-mobile.scss'),
                    _.extend(this.options, {components: mobileComponents})
                );
            }

            this.fs.copyTpl(this.templatePath('_ui.html'),
                this.destinationPath('src/views/' + this.options.slugifiedName + '-ui.html'),
                _.extend(this.options, {components: uiComponents})
            );
            this.fs.copyTpl(this.templatePath('_mobile.html'),
                this.destinationPath('src/views/' + this.options.slugifiedName + '-mobile.html'),
                _.extend(this.options, {components: uiComponents})
            );
        },
        gulp: function() {
            var gulpfileTree = new ast(this.fs.read('gulpfile.js'));
            var sassTask = gulpfileTree.callExpression('gulp.task')
                .filter(function (node) {
                    return node.arguments[0].value === 'sass';
                });
            var currentDeps = sassTask.arguments.at(1);
            var currentTasks = currentDeps.nodes[0].elements.map(function (list) {
                return list.value;
            });
            var newTasks = ['sass:'+ this.options.slugifiedName +':ui', 'sass:'+ this.options.slugifiedName +':mobile'];
            newTasks.forEach(function (task) {
                if (currentTasks.indexOf(task) === -1) {
                    currentDeps.push('\'' + task + '\'');
                }
            });
            newTasks.forEach(function(task) {
                var currentTask = gulpfileTree.callExpression('gulp.task')
                    .filter(function (node) {
                        return node.arguments[0].value === task;
                    });
                var isMobile = /.+:mobile$/.test(task);
                if (!currentTask.length) {
                    gulpfileTree.body.append(
                        'gulp.task(\''+ task + '\', function() {\n' +
                        'return gulp.src(\'src/styles/' + this.options.slugifiedName + '-' + (isMobile ? 'mobile' : 'ui') +'.scss\')\n' +
                            '.pipe($.sass({\n' +
                                'includePaths: [bourbonPath]\n' +
                            '}))\n' +
                            '.pipe($.rename(\'' + this.options.slugifiedName + '.css\'))\n' +
                            '.pipe(gulp.dest(\'./build/' + (isMobile ? 'mobile' : 'ui') +'/\'))\n' +
                            '.pipe(reload({stream: true}));\n' +
                        '});\n'
                    );
                }
            }.bind(this));

            this.fs.write(path.join(process.cwd(), 'gulpfile.js'), gulpfileTree.toString());
        }
    },
    end: function() {
        this.subthemes[this.options.slugifiedName] = this.options.name;
        this.config.set('subthemes', this.subthemes);
    }
});
