// src/modules/index.js
module.exports = {
  auth: require('./auth/auth.router'),
  startup: require('./startup/startup.router'),
  audience: require('./audience/audience.router'),
  // brands: require('./brands/brands.router'),
};
