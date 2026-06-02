import { contentPlan500 } from "../content/content-plan-500";

const batchCounts = new Map<number, number>();
const slugCounts = new Map<string, number>();

for (const item of contentPlan500) {
  batchCounts.set(item.batch, (batchCounts.get(item.batch) || 0) + 1);
  slugCounts.set(item.slug, (slugCounts.get(item.slug) || 0) + 1);
}

const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1).map(([slug]) => slug);
const oversizedBatches = [...batchCounts.entries()].filter(([, count]) => count > 25);
const invalidSlugs = contentPlan500.filter((item) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug));

const result = {
  topics: contentPlan500.length,
  batches: batchCounts.size,
  maxBatchSize: Math.max(...batchCounts.values()),
  duplicateSlugs,
  oversizedBatches,
  invalidSlugs: invalidSlugs.map((item) => item.slug),
  ok:
    contentPlan500.length === 500 &&
    batchCounts.size === 20 &&
    duplicateSlugs.length === 0 &&
    oversizedBatches.length === 0 &&
    invalidSlugs.length === 0,
};

console.log(JSON.stringify(result, null, 2));

if (!result.ok) process.exitCode = 1;
