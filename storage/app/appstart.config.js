module.exports = {
  apps: [
    {
      name: "storage-api",
      script: "./bin/www",
      watch: true,
      ignore_watch: ["node_modules", "views", "public", "bin", "log.txt", "logs"],
      exec_mode: "cluster",
      instances: 1,
      //max_memory_restart: "200M",
      time: true,
      env: {
        "NODE_ENV": "development",
        "PORT": "5001"
      },
      env_production: {
        "NODE_ENV": "production",
        "PORT": "5001"
      }
    }
  ]
};
