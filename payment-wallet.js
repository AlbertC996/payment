const fs = require("fs");
const path = require("path");
const root = "G:\\B\\AA-Cloned-Projects\\payment-project\\payment";
const outputFile = path.join(root, "payment-wallet.md");
const trackedFiles = [
  path.join(root, ".env"),
  path.join(root, ".prettierrc"),
  path.join(root, "config.ts"),
  path.join(root, "package.json"),
  path.join(root, "tsconfig.build.json"),
  path.join(root, "tsconfig.json"),
  // src
  path.join(root, "src", "main.ts"),
  path.join(root, "src", "app.module.ts"),
  path.join(root, "src", "app.controller.ts"),
  path.join(root, "src", "app.controller.spec.ts"),
  path.join(root, "src", "app.service.ts"),
  // src > currencies
  path.join(root, "src", "currencies", "currencies.module.ts"),
  path.join(root, "src", "currencies", "currencies.controller.ts"),
  path.join(root, "src", "currencies", "currencies.service.ts"),
  // src > currencies > schemas
  path.join(root, "src", "currencies", "schemas", "transaction.schema.ts"),
  // src > changenow
  path.join(root, "src", "changenow", "changenow.module.ts"),
  path.join(root, "src", "changenow", "changenow.controller.ts"),
  path.join(root, "src", "changenow", "changenow.service.ts"),
];

function fileToMarkdownBlock(filePath, index) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const name = path.basename(filePath);
    return `${index}. ${name} => (\n${content}\n)\n`;
  } catch (err) {
    console.error(`⚠️ err in read file ${filePath}: ${err.message}`);
    return `${index}. ${path.basename(filePath)} => (ERROR: File not found)\n`;
  }
}

function generateMarkdown() {
  let output = "";

  let index = 1;
  let lastDir = "";

  for (const file of trackedFiles) {
    const dir = path.dirname(file);

    if (dir !== lastDir) {
      output += `### ${dir}\\👇\n`;
      lastDir = dir;
      index = 1;
    }

    output += fileToMarkdownBlock(file, index);
    index++;
  }

  fs.writeFileSync(outputFile, output, "utf-8");
  console.log("✅ file payment-wallet.md was updated");
}

generateMarkdown();