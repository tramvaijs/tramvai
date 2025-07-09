import fs from "node:fs";
import { cruise } from "dependency-cruiser";

cruise(["./default.js", "./modern.js"])
  .then((res) => {
    const imports = res.output.modules
      .map((item) => item.source)
      .filter((item) => !item.includes("/core-js/internals/"));
    fs.writeFileSync("./imports.json", JSON.stringify(imports));
  })
  .catch((err) => {
    throw new Error(`Failed to collect polyfill entries modules!`, err);
  });
