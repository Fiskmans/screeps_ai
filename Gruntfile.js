module.exports = function(grunt) {

	grunt.log.error(process.cwd())
	let options = require('./Credentials.json');
	
	let server = grunt.option('server') || "persistent";
	console.log("pushing to " + server);
	
    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            options: {
                token: options.token,
                branch: options.branch,
                ptr: options.ptr,
				server: server
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