export default {
  host: process.env.MM_EXPRESS_HOST || '0.0.0.0',
  http: {
    port: process.env.MM_EXPRESS_HTTP_PORT || '8080',
  },
  https: {
    enable: process.env.MM_EXPRESS_HTTPS || 'true', //Enabling SSL makes the entire site forced over SSL.
    port: process.env.MM_EXPRESS_HTTPS_PORT || '8443',
    options: {
      key: process.env.MM_EXPRESS_HTTPS_KEY || __dirname + '/../ssl/key.pem',
      cert: process.env.MM_EXPRESS_HTTPS_CERT || __dirname + '/../ssl/cert.pem'
    }
  },
  logs: {
    //https://github.com/expressjs/morgan
    morgan: {
      enable: process.env.MM_EXPRESS_MORGAN_ENABLE || 'true',
      format: process.env.MM_EXPRESS_MORGAN_FORMAT || 'short'
    }
  },
  helmet: {
    enable: process.env.MM_EXPRESS_HELMET_ENABLE || 'true',
    config: {}
  }
};
