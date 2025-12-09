module.exports = {
  apps: [
    {
      name: "shobdodhara",
      script: "server.js",
      env: {
        NODE_ENV: "development",
        ENV_FILE: ".env.development",
      },
      env_production: {
        NODE_ENV: "production",
        ENV_FILE: ".env.production",
      },
    },
  ],
};
