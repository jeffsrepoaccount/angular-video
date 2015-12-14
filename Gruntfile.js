/**
 * Streaming Gruntfile
 *
 * Usage: grunt build:<environment>
 *
 * <environment> is one of:
 *  develop
 *  staging
 *  production
 */
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-banner');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            js: {
                files: [{
                    expand: true,
                    flatten: true,
                    dest: './dist/',
                    src: [ './tmp/*' ]
                }]
            },
            html: {
                files: [{
                    expand: true,
                    flatten: true,
                    dest: './dist/',
                    src: [ './src/*.html' ]
                }]
            },
            css: {
                files: [{
                    expand: true,
                    flatten: true,
                    dest: './dist/',
                    src: [ './tmp/*.css' ]
                }]
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        './dist/*', 
                    ]
                }]
            },
            cleanup: {
                files: [{
                    dot: true,
                    src: [ './tmp' ]
                }]
            }
        },
        usebanner: {
            options: {
                position: 'top',
                banner: '/*! <%= pkg.name %>, built <%= grunt.template.today("isoDateTime") %> */',
                linebreak: true
            },
            src: [ './dist/*' ]
        },
        uglify: {
            js: {
                files: {
                    './tmp/angular-video.min.js': [ './src/*.js' ]
                },
                options: {
                    mangle: false
                }
            }
        },
        cssmin: {
            build: {
                files: {
                    './tmp/angular-video.min.css': [ './src/angular-video.css' ]
                }
            }
        }
    });

    grunt.registerTask('build', function() {
        grunt.task.run([
            'clean:dist',
            'uglify:js',
            'cssmin:build',
            'copy:js',
            'copy:css',
            'usebanner',
            'copy:html',
            'clean:cleanup'
        ]);
    });

    grunt.registerTask('test', function() {
        //
    });
};
