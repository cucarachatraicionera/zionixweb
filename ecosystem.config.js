module.exports = {
  apps: [
    {
      name: "zionixweboficial",
      cwd: "/root/zionixweb",
      script: "pnpm",
      args: "start -p 3002",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
