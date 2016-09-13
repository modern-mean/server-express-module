export default () => {
  return {
    host: process.env.EXPRESSMODULE_HOST || '0.0.0.0',
    http: {
      port: process.env.EXPRESSMODULE_HTTP_PORT || '8080',
    },
    https: {
      enable: process.env.EXPRESSMODULE_HTTPS || 'true', //Enabling SSL makes the entire site forced over SSL.
      port: process.env.EXPRESSMODULE_HTTPS_PORT || '8443',
      options: {
        key: process.env.EXPRESSMODULE_HTTPS_KEY || __dirname + '/ssl/key.pem',
        cert: process.env.EXPRESSMODULE_HTTPS_CERT || __dirname + '/ssl/cert.pem'
      }
    },
    logs: {
      //https://github.com/expressjs/morgan
      morgan: {
        enable: process.env.EXPRESSMODULE_MORGAN_ENABLE || 'true',
        format: process.env.EXPRESSMODULE_MORGAN_FORMAT || 'short'
      }
    },
    helmet: {
      enable: process.env.EXPRESSMODULE_HELMET_ENABLE || 'true',
      config: {}
    }
  };
};
