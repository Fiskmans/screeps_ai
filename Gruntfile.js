module.exports = function(grunt) {

	grunt.log.error(process.cwd())
	let options = require('./Credentials.json');
	
	let server = grunt.option('server') || "mmo";
	console.log("pusing to " + server);
	
    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            options: {
                email: options.email,
                password: options.password,
                branch: options.branch,
                ptr: options.ptr,
				server: options.server
            },
            source: {
                files: [
                    {
                        expand: true,
                        cwd: 'source/',
                        src: ['**/*.{js,wasm,svg}'],
                        flatten: true
                    }
                ]
            }
        }
    });
}