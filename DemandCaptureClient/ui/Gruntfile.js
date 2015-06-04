module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var developmentPort = 8089;
    var _ = require('lodash');

    var dev2Env = {
        mcaUsername: 'ibrefresh25@sb.co.za',
        mcaPassword: 'passwordJ123',
        cardNumber: '4451215410004246',
        cellPhoneNumber: '0788541124',
        atmPIN: '34701',
        fromAccount: 'ELITE - 08-144-462-1',
        toAccount: 'PURESAVE - 04-564-023-8',
        authContractsUsername: 'devautomation@sb.co.za',
        authContractsPassword: 'passwordJ123'
    };

    var sit2Env = {
        mcaUsername: 'proexplore@sb.co.za',
        mcaPassword: 'Pro123',
        cardNumber: '5221008363362364',
        cellPhoneNumber: '0845989920',
        atmPIN: '34470',
        fromAccount: 'ELITE - 06-055-841-5',
        toAccount: 'PLUS PLAN - 07-341-433-6',
        authContractsUsername: 'proexplore@sb.co.za',
        authContractsPassword: 'Pro123'
    };

    var dev1Env = {
        mcaUsername: 'koek1@standardbank.co.za',
        mcaPassword: 'Pro123',
        cardNumber: '4890612291724919',
        cellPhoneNumber: '0742224131',
        atmPIN: '14134',
        fromAccount: 'PRESTIGE - 27-338-548-8',
        toAccount: 'CURRENT - 13-838-453-3',
        authContractsUsername: 'koek1@standardbank.co.za',
        authContractsPassword: 'Pro123'
    };

    var sit1Env = {
        mcaUsername: 'new_contract_test@sb.co.za',
        mcaPassword: 'Pro123',
        cardNumber: '5239826800036006',
        cellPhoneNumber: '0846820331',
        atmPIN: '64180',
        fromAccount: 'PLUS PLAN - 00-676-321-9',
        toAccount: 'CREDIT CARD - 5239-8268-0003-6006',
        authContractsUsername: 'new_contract_test@sb.co.za',
        authContractsPassword: 'Pro123'
    };

    var prodEnv = {
        mcaUsername: 'chop.chop.sbsa@gmail.com',
        mcaPassword: 'Pro123',
        cardNumber: '5196120166505932',
        cellPhoneNumber: '0748433268',
        atmPIN: '19464',
        fromAccount: 'ELITE - 07-021-634-7',
        toAccount: 'PLUS PLAN - 07-341-432-8',
        authContractsUsername: 'chop.chop.sbsa@gmail.com',
        authContractsPassword: 'Pro123'
    };

    var environmentSpecificData = {
        local: _.merge({
            baseUrl: 'localhost',
            mcaPort: '9100',
            sbgMobileBaseUrl : 'localhost',
            sbgMobileBasePort : '9100'
        }, dev2Env),
        demo: _.merge({
            baseUrl: 'localhost',
            mcaPort: '9101',
            sbgMobileBaseUrl : 'localhost',
            sbgMobileBasePort : '9101'
        }, dev2Env),
        dev1: _.merge({
            baseUrl: 'dmcafhtp01.standardbank.co.za',
            mcaPort: '80'
        }, dev1Env),
        sit1: _.merge({
            baseUrl: 'sbg-ib-s1.standardbank.co.za',
            mcaPort: '443'
        }, sit1Env),
        dev2: _.merge({
            baseUrl: 'd2vmcafhtp1.standardbank.co.za',
            mcaPort: '80'
        }, dev2Env),
        sit2: _.merge({
            baseUrl: 'mcasit2.standardbank.co.za',
            mcaPort: '80'
        }, sit2Env),
        prod: _.merge({
            baseUrl: 'experience.standardbank.co.za',
            mcaPort: '443'
        }, prodEnv)

    };

    var env = function () {
        if (grunt.option('dev1')) {
            return environmentSpecificData.dev1;
        }
        if (grunt.option('sit1')) {
            return environmentSpecificData.sit1;
        }
        if (grunt.option('dev2')) {
            return environmentSpecificData.dev2;
        }
        if (grunt.option('sit2')) {
            return environmentSpecificData.sit2;
        }
        if (grunt.option('prod')) {
            return environmentSpecificData.prod;
        }
        if (grunt.option('demo')) {
            return environmentSpecificData.demo;
        }
        return environmentSpecificData.local;
    };

    var reverseProxy = [
        {
            context: '/api',
            host: env().baseUrl,
            port: 3000,
            http: 'api/demand',
            changeOrigin: false,
            forward: false,
            xforward: true
        }
    ];

    var fakeLocationHeaders = function(req, res, next) {
        req.headers.host = '';
        req.headers.referer = '';
        req.headers.origin = '';
        return next();
    };

    var useReverseProxy = function (connect, options) {
        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
        return [
            fakeLocationHeaders,
            proxy, // include the proxy first
            connect().use(
                '/bower_components',

                connect.static('target/bower_components')
            ),
            connect.static(options.base),
            connect.directory(options.base) // serve static files
        ];
    };

    var jsSource = [
        'src/main/assets/scripts/js/**/*.js',
        'src/main/domain/**/*.js',
        'src/main/common/**/*.js',
        'src/main/features/**/*.js'];

    var source = [jsSource, 'src/toggle/*.json'];

    var baseProtractorArgs = {
        chromeDriver: 'node_modules/chromedriver/bin/chromedriver',
        seleniumServerJar: 'node_modules/selenium-server/lib/runner/selenium-server-standalone-2.35.0.jar',
        directConnect: process.platform === 'linux',
        splitTestsBetweenCapabilities: true
    };

    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: developmentPort,
                    base: 'target/main',
                    hostname: '0.0.0.0',
                    middleware: useReverseProxy,
                    protocol: 'http'
                },
                proxies: reverseProxy
            },
            distri: {
                options: {
                    port: 8081,
                    base: 'distri/main',
                    hostname: '0.0.0.0',
                    middleware: useReverseProxy,
                    protocol: 'https',
                    keepalive: true
                },
                proxies: reverseProxy
            },
            acceptance: {
                options: {
                    port: 8888,
                    base: 'target/main',
                    hostname: '0.0.0.0',
                    middleware: useReverseProxy,
                    protocol: 'https'
                },
                proxies: reverseProxy
            },
            e2e: {
                options: {
                    port: 8889,
                    base: 'distri/main',
                    middleware: useReverseProxy,
                    protocol: 'https'
                },
                proxies: reverseProxy
            },
            smoke: {
                options: {
                    port: 8890,
                    base: 'distri/main',
                    middleware: useReverseProxy,
                    protocol: 'https'
                }
            }
        },

        open: {
            dev: {
                path: 'http://localhost:' + developmentPort + "/"
            },
            distri: {
                path: 'https://localhost:8081/'
            },
            live: {
                path: 'https://localhost:' + developmentPort + "/index.html"
            },
            coverage: {
                path: 'target/test/unit/report/coverage/Chrome 40.0.2214 (Mac OS X 10.9.5)/index.html'
            },
            metrics: {
                path: 'target/metrics/index.html'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: source,
                tasks: ['includeSource', 'copy:jsToTarget', 'redact:keepNoBackend', 'jshint']
            },
            bower: {
                files: ['bower.json'],
                tasks: ['bower:install', 'wiredep']
            },
            nobackend_json: {
                files: ['src/main/**/*.json'],
                tasks: ['copy:jsonToTarget']
            },
            html: {
                files: 'src/main/**/*.html',
                tasks: ['copy:htmlToTarget', 'redact:keepNoBackend']
            },
            sass: {
                files: ['src/main/**/*.scss'],
                tasks: ['copy:sassToTarget', 'sass']
            }
        },
        karma: {
            unit: {
                configFile: 'target/test/config/karma.conf.js',
                singleRun: true
            },
            watch: {
                configFile: 'src/test/config/karma.conf.js'
            }
        },
        protractor: {
            options: {
                args: baseProtractorArgs
            },
            acceptance: {
                options: {
                    configFile: 'target/test/config/protractor.acceptance.conf.js',
                    keepAlive: false
                }
            },
            acceptance_debug: {
                options: {
                    configFile: 'target/test/config/protractor.acceptance.debug.conf.js',
                    keepAlive: false
                }
            },
            smoke_against_local: {
                options: {
                    configFile: 'target/test/config/protractor.smoke.conf.js',
                    keepAlive: true,
                    args: _.merge({
                        baseUrl: 'https://localhost:8890/'
                    }, baseProtractorArgs)
                }
            },
            smoke_against_deployed: {
                options: {
                    configFile: 'target/test/config/protractor.smoke.conf.js',
                    keepAlive: true,
                    args: _.merge({
                        baseUrl: grunt.option('deployedAppUrl')
                    }, baseProtractorArgs)
                }
            },
            e2e_against_local: {
                options: {
                    configFile: 'target/test/config/protractor.e2e.conf.js',
                    keepAlive: true,
                    args: _.merge({
                        baseUrl: 'https://localhost:8889/'
                    }, baseProtractorArgs)
                }
            },
            e2e_against_deployed: {
                options: {
                    configFile: 'target/test/config/protractor.e2e.conf.js',
                    keepAlive: true,
                    args: _.merge({
                        baseUrl: grunt.option('deployedAppUrl')
                    }, baseProtractorArgs)
                }
            }
        },
        sass: {
            dev: {
                options: {
                    includePaths: [
                        'target/main/assets/stylesheets/sass/**/*.sass'
                    ],
                    sourceMap: true
                },
                files: [
                    {"target/main/assets/stylesheets/css/app.css": "target/main/assets/stylesheets/sass/app.scss"},
                    {"target/main/assets/stylesheets/css/style_guide.css": "target/main/assets/stylesheets/sass/style_guide.scss"},
                    {"target/main/assets/ie/css/ie9.css": "target/main/assets/stylesheets/sass/ie9.scss"},
                    {"target/main/assets/ie/css/upgrade_your_browser.css": "target/main/assets/stylesheets/sass/upgrade_your_browser.scss"}
                ]
            }
        },
        exec: {
            create_full_source_package: {
                cmd: 'mkdir -p distri && tar -czph --exclude=distri -f distri/ibrefresh.tgz ./'
            },
            create_distributable_package: {
                cmd: 'cd distri/main && tar -czph -f ../ibrefresh_distributable.tgz ./'
            },
            package_screenshots: {
                cmd: 'mkdir -p distri && zip -j -r distri/screenshots.zip reports/acceptance/screenshots/'
            },
            package_e2e_screenshots: {
                cmd: 'mkdir -p distri && zip -j -r distri/e2e_screenshots.zip reports/e2e/screenshots/'
            },
            package_coverage: {
                cmd: 'mkdir -p distri && cd reports/coverage/* && zip -r ../../../distri/coverage.zip ./ && cd -'
            },
            package_build_number: {
                cmd: 'mkdir -p distri/main && cd distri/main && echo { \\"buildVersion\\": \\"' + process.env.BUILD_NUMBER + '\\", \\"gitRevision\\": \\"' + process.env.BUILD_VCS_NUMBER + '\\" } > version.json'
            },
            clean_test_debug_flags: {
                cmd: "find src/test -name '*.js' -exec perl -pi -e 's/d(describe)|i(it)/$1$2/' {} \\;"
            }
        },
        coverage: {
            options: {
                thresholds: {
                    'statements': 100,
                    'branches': 100,
                    'lines': 100,
                    'functions': 100
                },
                dir: 'coverage',
                root: 'target/test/unit/report'
            }
        },
        plato: {
            metrics: {
                files: {
                    'target/metrics': ['src/main/**/*.js', 'src/test/**/*.js', '!src/main/assets/**/*.js', '!src/test/lib/**/*.js']
                }
            }
        },
        clean: ['target', 'distri', 'src/test/unit/report'],
        copy: {
            srcToTarget: {
                expand: true,
                cwd: 'src/',
                src: [ 'main/.htaccess', '**'],
                dest: 'target/'
            },
            jsToTarget: {
                expand: true,
                cwd: 'src/',
                src: jsSource.map(function (dir) {
                    return dir.replace('src/', '');
                }),
                dest: 'target/'
            },
            sassToTarget: {
                expand: true,
                cwd: 'src/main/assets/stylesheets/sass/',
                src: '**/*.scss',
                dest: 'target/main/assets/stylesheets/sass/'
            },
            jsonToTarget: {
                expand: true,
                cwd: 'src/main/',
                src: '**/*.json',
                dest: 'target/main/'
            },
            testsToTarget: {
                expand: true,
                cwd: 'src/test/',
                src: '**/*.js',
                dest: 'target/test/'
            },
            htmlToTarget: {
                expand: true,
                cwd: 'src/main/',
                src: '**/*.html',
                dest: 'target/main/'
            },
            targetToDist: {
                files: [
                    {
                        expand: true,
                        cwd: 'target/main',
                        dest: 'distri/main',
                        src: [  '.htaccess',
                            '**/*.min.js',
                            '**/*.min*.css',
                            'assets/ie/**/*.js',
                            'assets/ie/**/*.swf',
                            'assets/ie/**/*.css',
                            'assets/fonts/*',
                            'assets/images/**',
                            '**/*.html',
                            '!styleguide/**',
                            '!styleguide.html'
                        ]
                    }
                ]
            },
            targetToDistLazyLoadedFiles: {
                files: [
                    {
                        expand: true,
                        cwd: 'target',
                        dest: 'distri/main',
                        src: [
                            'bower_components/pdfmake/build/pdfmake.min.js',
                            'bower_components/pdfmake/build/vfs_fonts.js'
                        ]
                    }
                ]
            },
            unitResults: {
                expand: true,
                cwd: 'target/test/unit/report/junit/',
                src: '**/*',
                dest: 'reports/unit/'
            },
            coverageResults: {
                expand: true,
                cwd: 'target/test/unit/report/coverage/',
                src: '*/**/*',
                dest: 'reports/coverage/'
            },
            acceptanceResults: {
                expand: true,
                cwd: 'target/test/functional/acceptance/reports/',
                src: '**/*',
                dest: 'reports/acceptance/'
            },
            e2eResults: {
                expand: true,
                cwd: 'target/test/functional/e2e/reports/',
                src: '**/*',
                dest: 'reports/e2e/'
            }
        },
        redact: {
            keepNoBackend: {
                options: {
                    toggleStatesFile: 'src/toggle/toggles.json',
                    workingDirectory: 'target',
                    jsPatterns:['**/*.js', '!**/bower_components/**'],
                    htmlPatterns:['**/*.html', '!**/bower_components/**'],
                    toggleStates: {
                        nobackendOn: true
                    }
                },
                toggles: {
                }
            },
            removeNoBackend: {
                options: {
                    toggleStatesFile: "src/toggle/toggles.json",
                    workingDirectory: "target",
                    jsPatterns:['**/*.js', '!**/bower_components/**'],
                    htmlPatterns:['**/*.html', '!**/bower_components/**'],
                    toggleStates: {
                        nobackendOn: false
                    }
                },
                toggles: {
                }
            },
            everythingOn: {
                options: {
                    toggleStatesFile: "src/toggle/toggles.json",
                    workingDirectory: "target",
                    jsPatterns:['**/*.js', '!**/bower_components/**'],
                    htmlPatterns:['**/*.html', '!**/bower_components/**'],
                    everythingOn: true
                },
                toggles: {
                }
            }
        },
        env: {
            setVariables: {
                MCA_USERNAME: grunt.option('mcaUsername') || env().mcaUsername,
                MCA_PASSWORD: grunt.option('mcaPassword') || env().mcaPassword,
                CARD_NUMBER: env().cardNumber,
                ATM_PIN: env().atmPIN,
                CELLPHONE_NUMBER: env().cellPhoneNumber,
                FROM_ACCOUNT: env().fromAccount,
                TO_ACCOUNT: env().toAccount,
                AUTH_CONTRACTS_USERNAME: env().authContractsUsername,
                AUTH_CONTRACTS_PASSWORD: env().authContractsPassword
            }
        },

        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },

        bower_concat: {
            all: {
                dependencies: {
                    'angular': ['jquery', 'jquery.scrollTo', 'jquery-color']
                },
                exclude: ['pdfmake'],
                dest: 'target/main/bower.concat.js',
                callback: function(mainFiles) {
                    return _.map(mainFiles, function(filepath) {
                        // Use minified files if available
                        var min = filepath.replace(/\.js$/, '.min.js');
                        return grunt.file.exists(min) ? min : filepath;
                    });
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            distri: {
                src: [
                    'target/main/bower.concat.js',
                    'target/main/assets/lib/**/*.js',
                    'target/main/domain/**/*.js',
                    'target/main/common/**/*.js',
                    'target/main/features/**/*.js'
                ],
                dest: 'target/main/refresh.concat.js'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            distri: {
                files: {
                    'target/main/refresh.min.js': ['target/main/refresh.concat.js']
                }
            }
        },
        usemin: {
            html: 'target/main/index.html'
        },
        cssmin: {
            combine: {
                files: {
                    'target/main/assets/stylesheets/css/app.min.css': ['target/main/assets/stylesheets/css/app.css'],
                    'target/main/assets/stylesheets/css/style_guide.min.css': ['target/main/assets/stylesheets/css/style_guide.css']
                }
            }
        },
        bless: {
            options:{
                force: true,
                logCount: true
            },
            css: {
              files: {
                  'target/main/assets/stylesheets/css/app.min.css': 'target/main/assets/stylesheets/css/app.min.css'
              }
          }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                'src/main/domain/**/*.js',
                'src/main/common/**/*.js',
                'src/main/features/**/*.js',
                'src/test/**/*.js',
                '!src/test/config/**/*.js',
                '!src/test/unit/report/**/*.js',
                '!src/test/unit/coverage/**/*.js',
                '!src/test/lib/**/*.js'
            ]
        },
        'ddescribe-iit': {
            files: [
                'src/test/**/*.js'
            ]
        },
        includeSource: {
            client: {
                files: {
                    'src/main/index.html': 'src/main/index.html'
                }
            }
        },
        wiredep: {
            app: {
                src: ['src/main/index.html']
            },
            styleGuide: {
                src: ['src/main/styleguide/styleguide.html']
            },
            test: {
                src: ['src/test/config/karma.conf.js'],
                ignorePath: '../../',
                exclude: [/(.*\.min\.js)/gi],
                devDependencies: true
            }
        }
    });


    grunt.registerTask('package', "Create the IBR artifact", [
        'copy:srcToTarget',
        'redact:removeNoBackend',
        'sass',
        'minify',
        'copy:targetToDist',
        'copy:targetToDistLazyLoadedFiles',
        'exec:create_distributable_package',
        'exec:create_full_source_package'
    ]);




    grunt.registerTask('compile', "Clean and copy all the current static files", [
        'bower:install',
        'includeSource',
        'wiredep:app',
        'clean',
        'copy:srcToTarget',
        'redact:keepNoBackend',
        'jshint',
        'sass'
    ]);

    grunt.registerTask('start:server', [
        'compile',
        'connect:server',
        'configureProxies:server'
    ]);

    grunt.registerTask('develop', "Run the development server with stubs", [
        'start:server',
        'open:dev',
        'watch'
    ]);

    grunt.registerTask('default', [
        'develop'
    ]);

};
