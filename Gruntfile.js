var Dgeni = require('dgeni');

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

        
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', [
        'clean', 'doc', 'concat', 'uglify'
    ]);

    grunt.registerTask('doc', 'Generate docs via dgeni.', function() {
      var done = this.async();
      var dgeni = new Dgeni([require('./docs/dgeni-conf')]);
      dgeni.generate().then(done);
    });

    grunt.registerTask('test', [
        'default'
    ], function() {
        // Todo
    });
};