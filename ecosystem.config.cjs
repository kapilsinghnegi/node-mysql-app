module.exports = {
  apps: [
    {
      name: "nodemysql",
      script: "app.js",
      cwd: "/home/ksnx/Desktop/node-mysql-app",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
