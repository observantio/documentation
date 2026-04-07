import fs from "fs/promises";
import path from "path";

const buildTime = new Date().toLocaleString("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});
const code = `export const BUILD_TIMESTAMP = "${buildTime}";\n`;
const targetPath = path.resolve("./src/buildInfo.ts");

await fs.writeFile(targetPath, code, "utf8");
console.log(`Generated build info at ${buildTime}`);
