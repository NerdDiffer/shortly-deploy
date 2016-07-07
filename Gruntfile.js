module.exports = function(grunt) {
  var files = {
    app: ['app/*.js', 'app/**/*.js'],
    lib: ['lib/*.js'],
    public: ['public/client/**/*.js']
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: { separator: ';' },
      dist: {
        src: files.public,
        dest: 'public/dist/<%= pkg.name %>.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      target: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': files.public
        }
      }
    },

    eslint: {
      target: [
        'app/**/*.js',
        'public/client/**/*.js',
        'server*.js',
        'app/*.js'  
      ]
    },

    cssmin: {
      target: {
        files: [{
          expand: false,
          src: ['public/*.css', '!public/*.min.css'],
          dest: 'public/dist/style.min.css'
        }]
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
          'app/*.js',
          'app/**/*.js'
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: 'git push live master'
      },
      nodeServer: {
        command: 'node server.js'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'cssmin'
  ]);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['shell:prodServer']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', function() {
    if (grunt.option('prod')) {
      grunt.task.run(['preBuild', 'build', 'shell:nodeServer']);
      // add your production server task here
    } else {
      grunt.task.run(['preBuild', 'build', 'shell:nodeServer']);
    }
  });


  grunt.registerTask('preBuild', [
    'test',
    'lintMe'
  ]);

  grunt.registerTask('lintMe', ['eslint']);

};
