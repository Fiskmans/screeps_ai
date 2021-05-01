module.exports = function(grunt) {

	grunt.log.error(process.cwd())
	let options = require('./Credentials.json');
	let useToken = true;
	let server = grunt.option('server') || "persistent";
	console.log("Pushing to " + server);
	
	if(server === "localhost")
	{
		server = 
		{ 
			name: 'Localhost', 
			host: 'localhost',
			http: true,
			port: 21025,
			path: '/api/user/code' 
		}
		useToken = false;
	}
	grunt.loadNpmTasks('grunt-screeps');
	if(useToken)
	{
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
	else
	{
		grunt.initConfig({
			screeps: {
				options: {
					email: options.username,
					password: options.password,
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
    
    
}