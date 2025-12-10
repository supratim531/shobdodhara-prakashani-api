module.exports = {
  apps: [
    {
      // ---------- BACKEND APP ----------
      name: "shobdodhara-prakashani-api",
      script: "./server.js",

      env: {
        NODE_ENV: "development",
        ENV_FILE: ".env.development",
      },

      env_production: {
        NODE_ENV: "production",
        ENV_FILE: ".env.production",
      },
    },
    {
      // ---------- EMAIL WORKER ----------
      name: "email-worker",
      script: "./workers/emailWorker.js",

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
