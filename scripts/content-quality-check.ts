import { articleFiles, parseArgs, readArticle } from "./content-utils";
import { checkFile } from "./quality-core";

async function main() {
  const args = parseArgs();
  const summaryOnly = Boolean(args.summary);
  let files = args.file ? [String(args.file)] : await articleFiles();
  if (args.batch) {
    files = files.filter((file) => readArticle(file).data.publishBatch === Number(args.batch));
  }
  const results = files.map(checkFile);
  const failing = results.filter((result) => result.qualityScore < 80 || result.failedItems.length);
  const warning = results.filter((result) => result.warnings.length);

  if (!summaryOnly) {
    for (const result of results) console.log(JSON.stringify(result, null, 2));
  }

  console.log(
    JSON.stringify(
      {
        ok: failing.length === 0,
        files: results.length,
        failing: failing.length,
        warning: warning.length,
        firstFailing: failing.slice(0, 20),
        firstWarnings: warning.slice(0, 20),
      },
      null,
      2,
    ),
  );

  if (failing.length) {
    process.exitCode = 1;
  }
}

void main();
