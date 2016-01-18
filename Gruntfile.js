module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: ["js/PixLive.bundle.js", "js/PixLive.bundle.min.js", "build"],

        concat: {
            options: {

            },
            dist: {
                src: ['js/_declaration.js','js/Pixlive.js','js/RemoteController.js','js/SDKController.js','js/PixLiveEvent.js'],
                dest: 'js/PixLive.bundle.js'
            }
        },

        uglify: {
            uglify: {
                files: {
                    'js/PixLive.bundle.min.js': ['js/PixLive.bundle.js']
                }
            }
        },

        jsdoc: {
            dist: {
              src: ['js'],
              options: {
                destination: 'build/docs',
                configure: 'node_modules/angular-jsdoc/common/conf.json',
                template: 'node_modules/angular-jsdoc/angular-template',
                tutorial: 'tutorials',
                readme: './README.md'
              }
            }
        }

        
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', [
        'clean', 'jsdoc', 'concat', 'uglify'
    ]);


    grunt.registerTask('test', [
        'default'
    ], function() {
        // Todo
    });
};