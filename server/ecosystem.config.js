module.exports = {
  apps: [
    {
      name: "express-app",
      script: "./bin/www",
      env: {
        NODE_ENV: "local"
      },
      env_dev: {
        NODE_ENV: "dev"
      },
      env_prod: {
        NODE_ENV: "prod"
      }
    }
  ]
};
