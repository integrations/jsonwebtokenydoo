// Copied from: https://github.com/probot/probot/blob/1bace4c32c681efa119992b4f44e5f8d642a6fa2/lib/private-key.js
const fs = require("fs");

const hint = `please use:
  * \`PRIVATE_KEY\` environment variable, or
  * \`PRIVATE_KEY_PATH\` environment variable
`;

function findPrivateKey(filepath) {
  if (filepath) {
    return fs.readFileSync(filepath);
  }
  if (process.env.PRIVATE_KEY) {
    return process.env.PRIVATE_KEY.replace(/\\n/g, "\n");
  }
  if (process.env.PRIVATE_KEY_PATH) {
    return fs.readFileSync(process.env.PRIVATE_KEY_PATH);
  }
  const pemFiles = fs
    .readdirSync(process.cwd())
    .filter(path => path.endsWith(".pem"));
  if (pemFiles.length > 1) {
    throw new Error(
      `Found several private keys: ${pemFiles.join(", ")}. ` +
        `To avoid ambiguity ${hint}`
    );
  } else if (pemFiles[0]) {
    return findPrivateKey(pemFiles[0]);
  }
  throw new Error(`Missing private key for GitHub App, ${hint}`);
}

module.exports = {
  findPrivateKey
};
