// runFiles.js
import { execSync } from "child_process";
import readline from "readline";

const files = [
  "./packages/simple-state-shifter/demos/00-firepit-basic.js",
  "./packages/simple-state-shifter/demos/01-firepit-functions.js",
  "./packages/simple-state-shifter/demos/02-firepit-timers.js",
]
const waitForKeyPress = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`⌨️  Press any key to continue...`, () => {
      rl.close();
      resolve();
    });
  });
};

const runFilesSequentially = async () => {
  for (const file of files) {
    console.log(`⚙️  Running ${file}
`);
    execSync(`bun run ${file}`, { stdio: "inherit" });
    await waitForKeyPress();
  }
  console.log("All demos finished.");
};

runFilesSequentially()
