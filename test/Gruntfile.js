require('dotenv').config()
const path = require('path');
const fs = require('fs')
const runBackendServer = require('./scripts/run_backend_server');
const { setupTestDatabase } = require('./tasks/setup')

module.exports = function (grunt) {

    // Add the grunt-mocha-test tasks.
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-keepalive');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        mochaTest: {
            options: {
                noFail: false,
                showDiff: true,
                truncateThreshold: 0,
                captureFile: "api-test-log.txt",
                timeout: 10000,
                reporterOption: {
                    //Increase if your output gets truncated.
                    maxDiffSize: 1000000
                },
                // Add this to see full stack traces
                fullTrace: true,
                // Use spec reporter for better error visibility
                reporter: 'spec',
            },
            test: {
                src: [
                    // "./tests/**/*.js", 
                    "../plugins/**/api-tests/**/*.js",
                ]
            }
        },
        watch: {
            gruntfile: {
                tasks: ['backend'],
                files: ['../**/*.js'],
                options: {
                    reload: true
                }
            }
        }
    })

    grunt.registerTask('test', [
        'setup',
        // Run all mocha tests.
        'run-mocha'
    ])

    grunt.registerTask('test-keepalive', [
        'setup',
        // Run all mocha tests.
        'run-mocha',
        'keepalive'
    ])


    grunt.registerTask('setup', [
        // Creates a test database as defined in .env
        'setup-test-database',
        // The backend server must run to handle GraphQL requests
        'run-backend-server',
    ])

    grunt.registerTask('setup-and-keepalive', [
        'setup',
        //// You may want to keep the server alive after the tests, to run some manual queries on the test database.
        'keepalive'
    ])


    /**
     * Setup 
     */
    grunt.registerTask('setup-test-database', function () {
        let done = this.async()
        setupTestDatabase().then(done)
    })


    grunt.registerTask('backend', [
        'run-backend-server'
    ])

    grunt.registerTask('backend:keepalive', [
        'run-backend-server',
        'keepalive'
    ])

    grunt.registerTask('backend:watch', [
        'run-backend-server',
        'keepalive'
    ])

    grunt.registerTask('run-backend-server', function () {
        let done = this.async()
        runBackendServer().then(done).catch(console.error)
    })

    /** 
     * Test
     */

    grunt.registerTask('run-mocha', 'mochaTest')

    function getSetupFiles() {
        const basePath = path.join(__dirname, 'tests');
        const hooks = path.join(basePath, "_hooks.js");
        const test_preconditions_001 = path.join(basePath, "001_preconditions.js");
        const setup_002 = path.join(basePath, "002_setup.js");
        const user_003 = path.join(basePath, "003_user.js");

        return [hooks, test_preconditions_001, setup_002, user_003];
    }

    grunt.registerTask('test-setup', function () {
        const setupTasks = getSetupFiles();
        // Set the test files to run
        grunt.config.set('mochaTest.test.src', setupTasks);
        grunt.task.run(['setup', 'mochaTest']);
    })

    grunt.registerTask('test-file', function () {
        // Accept --file option OR environment variable TEST_FILE for shells that support path
        // auto-completion (e.g. PowerShell). Also allow an alternative grunt option 'path'.
        const optionFile = grunt.option('file');
        const envFile = process.env.GRUNT_TEST_FILE;
        const file = optionFile || envFile;

        if (!file) {
            grunt.fail.fatal('Please specify a test file via --file=path/to/test.js or set the GRUNT_TEST_FILE environment variable.');
        }

        // Resolve relative paths to absolute so existence checks are reliable
        const fs = require('fs');
        const path = require('path');
        const resolved = path.isAbsolute(file) ? file : path.join(process.cwd(), file);

        if (!fs.existsSync(resolved)) {
            grunt.fail.fatal(`Test file ${file} does not exist (resolved to: ${resolved}).`);
        }

        const setupTasks = getSetupFiles();
        // Set the test files to run (use resolved absolute path)
        grunt.config.set('mochaTest.test.src', [...setupTasks, resolved]);
        grunt.task.run(['setup', 'mochaTest']);
    });
}