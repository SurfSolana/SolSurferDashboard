// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "solsurfer-dashboard",
    script: "npm",
    args: "run dev",
    watch: false,
    env: {
      "NODE_ENV": "development",
    }
  }]
}

