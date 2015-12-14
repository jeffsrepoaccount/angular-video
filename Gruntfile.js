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
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        './dist/*'
                    ]
                }]
            }
        },
        usebanner: {
            options: {
                position: 'top',
                banner: '/*! <%= pkg.name %>, built <%= grunt.template.today("isoDateTime") %> */',
                linebreak: true
            },
            src: [ './tmp/*' ]
        },
        uglify: {
            js: {
                options: {
                    mangle: false
                }
            }
        }
    });

    grunt.registerTask('build', function() {
        grunt.task.run([
            'clean:dist',
            'concat:js',
            'uglify:js',
            'copy:js',
            'usebanner'
        ]);
    });

    grunt.registerTask('test', function() {
        //
    });
};
