module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      css: {
        src: [
          'css/**'
        ],
        dest: 'combined.css'
      },
      js: {
        src: ['js/**/*.js'],
        dest: 'dev/combined.js'
      }
    },
    cssmin: {
      css: {
        src: 'combined.css',
        dest: 'combined.min.css'
      }
    },
    uglify: {
      js: {
        files: {
          'combined.js': ['combined.js']
        }
      }
    },
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['concat:css', 'cssmin:css', 'concat:js', 'uglify:js']);
};