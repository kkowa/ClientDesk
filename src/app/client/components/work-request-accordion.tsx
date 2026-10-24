"use client";

import { useState } from "react";
import type { WorkRequest } from "@/src/types/work-request";

type WorkRequestAccordionProps = {
  request: {
    id: string;
    title: string;
    description: string;
    status: WorkRequest["status"];
    submittedAt: string;
  };
};

export default function WorkRequestAccordion({
  request,
}: WorkRequestAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background border-foreground border-2 p-4 rounded-lg mb-4 text-foreground flex justify-between items-start text-left">
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{request.title}</h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex justify-between items-center"
          >
            <span className="group flex items-center gap-5 overflow-hidden cursor-pointer">
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                {isOpen ? "-" : "+"}
              </span>
              <span className="max-w-0 -translate-x-2 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-20 group-hover:fade-in">
                {isOpen ? "Collapse" : "Expand"}
              </span>
            </span>
          </button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-25 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="mt-2 text-primary">{request.description}</p>

          <p className="mt-2">
            Status: <span className="text-success">{request.status}</span>
          </p>

          <div>
            <p>
              Submitted at:{" "}
              {new Date(request.submittedAt).toLocaleDateString("en-us", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
