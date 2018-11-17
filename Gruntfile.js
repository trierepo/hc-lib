module.exports = function (grunt) {
    var moduleName = 'hcLib';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            js: {
                src: ['./dist/src/hcLib.js', './dist/src/**/*.js'],
                dest: './dist/hc-lib.js'
            }
        },

        clean: {
            dist: ['./dist'],
            distSrc: ['./dist/src'],
        },
        
        uglify: {
            js: {
                src: ['./dist/hc-lib.js'],
                dest: './dist/hc-lib.min.js'
            }
        },

        ngtemplates: {
            options: {
                htmlmin: {
                    collapseBooleanAttributes:      true,
                    collapseWhitespace:             true,
                    removeAttributeQuotes:          false,
                    removeComments:                 true,
                    removeEmptyAttributes:          false,
                    removeRedundantAttributes:      true,
                    removeScriptTypeAttributes:     true,
                    removeStyleLinkTypeAttributes:  true
                },
                bootstrap: function(module, script) {
                    var header = "angular.module(\'" + moduleName + "\').run(['$templateCache', function($templateCache) {\n";
                    var footer = "}]);\n";

                    var cwd = grunt.template.process('');
                    script = script.replace(new RegExp(cwd, 'g'), '');
                    script = script.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    return grunt.template.process(header) + script + footer;
                }
            },
            app: {
                src: 'src/**/*.html',
                dest: 'dist/src/templates.js'
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: [{
                    expand: true,
                    src: ['src/**/*.js'],
                    dest: './dist',
                }]
            }
        }
    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ng-annotate'); 
    grunt.loadNpmTasks('grunt-angular-templates');


    //register grunt default task
    grunt.registerTask('default', ['clean:dist', 'ngAnnotate', 'ngtemplates', 'concat', 'uglify', 'clean:distSrc']);
    grunt.registerTask('build', ['clean:dist', 'ngAnnotate', 'ngtemplates', 'concat', 'uglify','clean:distSrc']);
};
