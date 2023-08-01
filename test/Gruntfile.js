require('dotenv').config()
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
                    maxDiffSize: 800
                }
            },
            test: {
                src: ["./tests/**/*.js"]
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
}