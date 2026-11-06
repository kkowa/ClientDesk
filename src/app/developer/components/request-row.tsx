"use client";

import { useState } from "react";
import { EmptyState } from "@/src/components/ui/empty-state";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { RequestCard } from "@/src/components/features/request-card";
import { requestStatusLabel } from "@/src/lib/data/request-status-label";
import { statusGroups, type RequestGroup, type WorkRequest } from "@/src/types/work-request";

type RequestWithId = WorkRequest & { id: string };

interface RequestRowProps {
  title: string;
  group: RequestGroup;
  requests: RequestWithId[] | null;
  clientNames: Record<string, string>;
  emptyTitle: string;
  emptyMessage: string;
}

export function RequestRow({
  title,
  group,
  requests,
  clientNames,
  emptyTitle,
  emptyMessage,
}: RequestRowProps) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const filterId = `${group}-request-status-filter`;
  const filteredRequests =
    requests?.filter(
      (request) =>
        selectedStatus === "all" || request.status === selectedStatus,
    ) ?? [];

  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <label htmlFor={filterId} className="text-sm font-medium">
            Filter by status
          </label>
          <select
            id={filterId}
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-auto"
          >
            <option value="all">All statuses</option>
            {statusGroups[group].map((status) => (
              <option key={status} value={status}>
                {requestStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {requests === null ? (
        <ErrorMessage message="We couldn't load these requests. Please refresh the page." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={requests.length === 0 ? emptyTitle : "No matching requests"}
          message={
            requests.length === 0
              ? emptyMessage
              : "No requests match the selected status."
          }
        />
      ) : (
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto p-1 pb-3">
          {filteredRequests.map((request) => (
            <li key={request.id} className="w-64 shrink-0 snap-start">
              <RequestCard
                request={request}
                clientName={clientNames[request.clientId]}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
