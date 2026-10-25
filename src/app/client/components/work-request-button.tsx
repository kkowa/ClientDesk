"use client";
import WorkRequest from "./work-request";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";

export default function WorkRequestButton() {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      {!showForm && (
        <Button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
          }}
        >
          Submit a Work Request
        </Button>
      )}
      {showForm && <WorkRequest onClose={() => setShowForm(false)} />}
    </>
  );
}
