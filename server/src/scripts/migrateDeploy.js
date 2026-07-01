const { spawnSync } = require("child_process");

const command = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(command, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
  },
});

process.exit(result.status ?? 1);
