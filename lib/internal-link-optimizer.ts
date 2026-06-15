import { getClusterPath, getSeoGraph, type SeoGraph, type SeoNode } from "@/lib/seo-graph";

export type InternalLinkRuleResult = {
  checkedPages: number;
  failedPages: number;
  health: number;
  failures: Array<{ path: string; title: string; type: SeoNode["type"]; reasons: string[] }>;
  rules: {
    qPages: { total: number; passed: number; failed: number };
    clusterPages: { total: number; passed: number; failed: number };
    blogPages: { total: number; passed: number; failed: number };
  };
};

export function getInternalLinkOptimizationReport(graph: SeoGraph = getSeoGraph()): InternalLinkRuleResult {
  const nodes = graph.nodes;
  const nodeMap = new Map(nodes.map((node) => [node.path, node]));
  const failures: InternalLinkRuleResult["failures"] = [];
  const rules = {
    qPages: { total: 0, passed: 0, failed: 0 },
    clusterPages: { total: 0, passed: 0, failed: 0 },
    blogPages: { total: 0, passed: 0, failed: 0 },
  };

  for (const node of nodes) {
    const reasons = getRuleFailures(node, nodeMap);
    if (node.type === "q") updateRuleBucket(rules.qPages, reasons.length === 0);
    if (node.type === "cluster") updateRuleBucket(rules.clusterPages, reasons.length === 0);
    if (node.type === "blog") updateRuleBucket(rules.blogPages, reasons.length === 0);
    if (reasons.length) failures.push({ path: node.path, title: node.title, type: node.type, reasons });
  }

  const checkedPages = nodes.length;
  const failedPages = failures.length;
  const health = checkedPages ? Math.round(((checkedPages - failedPages) / checkedPages) * 100) : 0;

  return { checkedPages, failedPages, health, failures, rules };
}

function getRuleFailures(node: SeoNode, nodeMap: Map<string, SeoNode>) {
  const clusterPath = getClusterPath(node.clusterSlug);
  const linkedNodes = node.outgoing.map((path) => nodeMap.get(path)).filter((item): item is SeoNode => Boolean(item));
  const qLinks = linkedNodes.filter((target) => target.type === "q").length;
  const blogLinks = linkedNodes.filter((target) => target.type === "blog").length;
  const clusterLinks = linkedNodes.filter((target) => target.type === "cluster").length;

  if (node.type === "q") {
    return [
      clusterLinks < 1 || !node.outgoing.includes(clusterPath) ? "q page missing 1 cluster page" : "",
      qLinks < 3 ? "q page has fewer than 3 related q pages" : "",
      blogLinks < 1 ? "q page missing 1 blog deep page" : "",
    ].filter(Boolean);
  }

  if (node.type === "cluster") {
    return [qLinks < 20 ? "cluster page has fewer than 20 q pages" : "", blogLinks < 5 ? "cluster page has fewer than 5 blog pages" : ""].filter(Boolean);
  }

  return [
    qLinks < 3 ? "blog page has fewer than 3 q pages" : "",
    clusterLinks < 1 || !node.outgoing.includes(clusterPath) ? "blog page missing 1 cluster page" : "",
  ].filter(Boolean);
}

function updateRuleBucket(bucket: { total: number; passed: number; failed: number }, passed: boolean) {
  bucket.total += 1;
  if (passed) bucket.passed += 1;
  else bucket.failed += 1;
}
