const Configstore = require('configstore');

const conf = new Configstore;

let account;

module.exports = {
  getInstance: () => {
    return account;
  },

  getStoredGithubToken: () => {
    return conf.get('squabble.token');
  },
};