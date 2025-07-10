"use client";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function Printable() {
  return <div style={{ padding: 40, background: "#fff" }}>Hello, print me!</div>;
}

export default function TestPrintPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div>
      <button onClick={handlePrint}>Print</button>
      <div ref={printRef}>
        <Printable />
      </div>
    </div>
  );
} 