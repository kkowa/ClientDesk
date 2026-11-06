import { statusGroups, WorkRequest } from "@/src/types/work-request";

export function sortCurrentRequests<T extends WorkRequest>(requests: T[]): T[] {
  return [...requests].sort(
    (a, b) =>
      statusGroups.current.findIndex((status) => status === a.status) -
      statusGroups.current.findIndex((status) => status === b.status),
  );
}

export function sortPastRequests<T extends WorkRequest>(requests: T[]): T[] {
  return [...requests].sort(
    (a, b) =>
      statusGroups.past.findIndex((status) => status === a.status) -
      statusGroups.past.findIndex((status) => status === b.status),
  );
}
