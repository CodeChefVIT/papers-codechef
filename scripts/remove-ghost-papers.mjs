import { writeFile } from "node:fs/promises";
import mongoose from "mongoose";

const collections = ["papers", "admins"];
const parallelChecks = 8;
const checkTimeoutMs = 15_000;

const shouldDelete = process.argv.includes("--delete");
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error(
    "set MONGODB_URI, e.g. node --env-file=.env scripts/remove-ghost-papers.mjs",
  );
  process.exit(1);
}

async function fileStatus(url) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    return "unknown";
  }
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(checkTimeoutMs),
    });
    if (response.ok) return "found";
    if (response.status === 404) return "missing";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function auditCollection(db, name) {
  const papers = await db
    .collection(name)
    .find(
      {},
      { projection: { file_url: 1, subject: 1, exam: 1, slot: 1, year: 1 } },
    )
    .toArray();

  const missing = [];
  const unknown = [];
  let next = 0;

  async function worker() {
    while (next < papers.length) {
      const paper = papers[next++];
      const status = await fileStatus(paper.file_url);
      if (status === "missing") missing.push(paper);
      if (status === "unknown") unknown.push(paper);
    }
  }

  await Promise.all(Array.from({ length: parallelChecks }, worker));
  return { total: papers.length, missing, unknown };
}

function describe(paper) {
  const details = [paper.subject, paper.exam, paper.slot, paper.year]
    .filter(Boolean)
    .join(" | ");
  return `  ${String(paper._id)}  ${details}\n    ${String(paper.file_url)}`;
}

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const report = {};
  let ghostCount = 0;
  let checkedCount = 0;

  for (const name of collections) {
    const result = await auditCollection(db, name);
    report[name] = result;
    ghostCount += result.missing.length;
    checkedCount += result.total;

    console.log(
      `\n${name}: ${result.total} checked, ${result.missing.length} missing, ${result.unknown.length} could not be checked`,
    );
    if (result.missing.length) {
      console.log("missing file (404):");
      result.missing.forEach((paper) => console.log(describe(paper)));
    }
    if (result.unknown.length) {
      console.log("could not be checked, left alone:");
      result.unknown.forEach((paper) => console.log(describe(paper)));
    }
  }

  if (!shouldDelete) {
    console.log(
      `\n${ghostCount} ghost records found. nothing was deleted, run again with --delete to remove them`,
    );
    return;
  }

  if (ghostCount === 0) {
    console.log("\nno ghost records to delete");
    return;
  }

  if (ghostCount > checkedCount / 2) {
    console.error(
      `\n${ghostCount} of ${checkedCount} files are missing, which looks like a moved or renamed bucket rather than ghost records. nothing was deleted`,
    );
    process.exitCode = 1;
    return;
  }

  const backup = {};
  for (const name of collections) {
    const ids = report[name].missing.map((paper) => paper._id);
    backup[name] = ids.length
      ? await db
          .collection(name)
          .find({ _id: { $in: ids } })
          .toArray()
      : [];
  }
  const backupFile = `ghost-papers-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await writeFile(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\nsaved the full records to ${backupFile}`);

  for (const name of collections) {
    const missing = report[name].missing;
    if (!missing.length) continue;
    const { deletedCount } = await db.collection(name).deleteMany({
      $or: missing.map((paper) => ({
        _id: paper._id,
        file_url: paper.file_url,
      })),
    });
    console.log(`deleted ${deletedCount} from ${name}`);
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
