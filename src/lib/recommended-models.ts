export interface AgentModelSortGroup {
  modelIds?: string[];
}

export interface AgentModelSort {
  displayName?: string;
  groups?: AgentModelSortGroup[];
}

export function extractRecommendedModelIds(agentModelSorts?: AgentModelSort[]): Set<string> {
  if (!agentModelSorts || agentModelSorts.length === 0) {
    return new Set<string>();
  }

  const recommended = agentModelSorts.find(
    (entry) => entry.displayName?.trim().toLowerCase() === 'recommended'
  );

  if (!recommended?.groups || recommended.groups.length === 0) {
    return new Set<string>();
  }

  const ids = new Set<string>();
  recommended.groups.forEach((group) => {
    group.modelIds?.forEach((modelId) => ids.add(modelId));
  });

  return ids;
}
