export default () => {
  //https://github.com/winstonjs/winston
  return {
    winston: {
      level:  process.env.EXPRESSMODULE_LOG_LEVEL,
      file: process.env.EXPRESSMODULE_LOG_FILE,
      console: process.env.EXPRESSMODULE_LOG_CONSOLE
    }
  };
};
