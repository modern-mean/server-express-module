[![Join the chat at https://gitter.im/modern-mean][gitter-image]][gitter-url]&nbsp;[![npm version][npm-image]][npm-url]&nbsp;[![dependencies Status][david-image]][david-url]&nbsp;[![devDependencies Status][davidDev-image]][davidDev-url]&nbsp;[![Build Status][travis-image]][travis-url]&nbsp;[![Coverage Status][coveralls-image]][coveralls-url]&nbsp;

#server-express-module
Modern Mean module for express server

#Installation
```sh
$ npm install --save @modern-mean/server-express-module
```

#Exports
* ExpressModule class

#ExpressModule Methods
* listen - Instructs the Express app to start listening
* destroy - Gracefully destroys the class, including the express App, http Server, and https server.  <b>Not available in Production Environment</b>
* getExpressApp -  Returns the express app.  Useful for passing into additional modules.
* getHttpServer - Returns the Node http server
* getHttpsServer - Returns the Node https server.

#Configuration
You can choose to set environment variables to override the configuration or pass them into the ExpressModule constructor

##Environment Variables
You can use environment variables on the commandline to override the configuration.  Environment variables must be strings so you cannot use object, arrays, boolean, etc.  Ex:
```sh
EXPRESSMODULE_HTTP_PORT=8081
```
Or set them in your main applications gulpfile.babel.js.
https://github.com/modern-mean/generator-modern-mean/blob/master/generators/app/templates/server/gulpfile.babel.js

You can set any environment variables in these two files.
https://github.com/modern-mean/server-express-module/blob/master/src/config.js
https://github.com/modern-mean/server-express-module/blob/master/src/logger.js

##Constructor
You can also override the configuration in the ExpressModule Constructor.  This is useful for configurations that cannot exist as strings.  The constructor configuration will override the default configuration AND environment variable configuration.  For example if you wanted to customize the Helmet middleware:

https://github.com/helmetjs/helmet

If you wanted to configure the frameguard middleware then you would override the helmet configuration
```js
let expressConfig = {
	config: {
		helmet: {
			config: {
				frameguard: {
			    action: 'deny'
			  }
			}
		}
	}
};
let expressModule = new ExpressModule(expressConfig);
```


[gitter-image]: https://badges.gitter.im/modern-mean.svg
[gitter-url]: https://gitter.im/modern-mean?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[npm-image]: https://badge.fury.io/js/%40modern-mean%2Fserver-express-module.svg
[npm-url]: https://npmjs.org/package/%40modern-mean%2Fserver-express-module

[travis-image]: https://travis-ci.org/modern-mean/server-express-module.svg?branch=master
[travis-url]: https://travis-ci.org/modern-mean/server-express-module

[david-image]: https://david-dm.org/modern-mean/server-express-module/status.svg
[david-url]: https://david-dm.org/modern-mean/server-express-module

[davidDev-image]: https://david-dm.org/modern-mean/server-express-module/dev-status.svg
[davidDev-url]: https://david-dm.org/modern-mean/server-express-module?type=dev

[coveralls-image]: https://coveralls.io/repos/github/modern-mean/server-express-module/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/modern-mean/server-express-module?branch=master
