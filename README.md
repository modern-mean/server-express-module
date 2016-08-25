[![Join the chat at https://gitter.im/modern-mean](https://badges.gitter.im/modern-mean.svg)](https://gitter.im/modern-mean?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/modern-mean/server-express-module.svg?branch=master)](https://travis-ci.org/modern-mean/server-express-module)
[![Coverage Status](https://coveralls.io/repos/github/modern-mean/server-express-module/badge.svg?branch=master)](https://coveralls.io/github/modern-mean/server-express-module?branch=master)
[![dependencies Status](https://david-dm.org/modern-mean/server-express-module/status.svg)](https://david-dm.org/modern-mean/server-express-module)
#Modern-Mean Express Module
This is a core module for a Modern-Mean server application.  This module sets up express.

#Exports
* MMExpress class

#MMExpress Methods
* listen - Instructs the Express app to start listening
* destroy - Gracefully destroys the class, including the express App, http Server, and https server.  <b>Not available in Production Environment</b>
* getExpressApp -  Returns the express app.  Useful for passing into additional modules.
* getHttpServer - Returns the Node http server
* getHttpsServer - Returns the Node https server.

#Configuration
This module has configurations for MMConfig and MMLogger.  You can choose to set environment variables to override the configuration or pass them into the MMExpress constructor

##Environment Variables
You can use environment variables on the commandline to override the configuration.  Environment variables must be strings so you cannot use object, arrays, boolean, etc.  Ex:
```sh
MM_EXPRESS_HTTP_PORT=8081 gulp
```
Or set them in your main applications gulpfile.babel.js.
https://github.com/modern-mean/generator-modern-mean/blob/master/generators/app/templates/server/gulpfile.babel.js

You can set any environment variables in these two files.
https://github.com/modern-mean/server-express-module/blob/master/src/config.es6
https://github.com/modern-mean/server-express-module/blob/master/src/logger.es6

##Constructor
You can also override the configuration in the MMExpress Constructor.  This is useful for configurations that cannot exist as strings.  The constructor configuration will override the default configuration AND environment variable configuration.  For example if you wanted to customize the Helmet middleware:

https://github.com/helmetjs/helmet

If you wanted to configure the frameguard middleware then you would override the helmet configuration
```js
let expressConfig = {
	MMConfig: {
		helmet: {
			config: {
				frameguard: {
			    action: 'deny'
			  }
			}
		}
	}
};
let expressModule = new MMExpress(expressConfig);
```
