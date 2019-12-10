module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
	
	grunt.log.error(process.cwd())
	let options = require('./Credentials.json');
    grunt.initConfig({
        screeps: {
            options: {
                email: options.email,
                password: options.password,
                branch: options.branch,
                ptr: options.ptr
            },
            source: {
                files: [
                    {
                        expand: true,
                        cwd: 'source/',
                        src: ['**/*.{js,wasm}'],
                        flatten: true
                    }
                ]
            }
        }
    });
}