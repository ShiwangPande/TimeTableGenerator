"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface TimetableEntry {
  dayOfWeek: string;
  timeSlot: { label: string };
  class: { name: string; section: string };
  subject: { name: string; teacher?: { user?: { name?: string } } };
  room: { name: string };
}

function TimetablePrint({ entries }: { entries: TimetableEntry[] }) {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const timeSlots = Array.from(new Set(entries.map((e) => e.timeSlot.label))).sort();
  const timetableGrid: Record<string, TimetableEntry[]> = {};
  entries.forEach((entry) => {
    const key = `${entry.dayOfWeek}-${entry.timeSlot.label}`;
    if (!timetableGrid[key]) timetableGrid[key] = [];
    timetableGrid[key].push(entry);
  });
  return (
    <div className="w-full" id="timetable-print-area">
      <h1 className="text-2xl font-bold mb-4 text-center">School Timetable</h1>
      <table className="w-full border-collapse text-xs bg-white">
        <thead>
          <tr>
            <th className="border p-2 bg-blue-50">Time</th>
            {days.map((day) => (
              <th key={day} className="border p-2 bg-blue-50">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot}>
              <td className="border p-2 font-semibold whitespace-nowrap bg-blue-50">{slot}</td>
              {days.map((day) => {
                const key = `${day}-${slot}`;
                const dayEntries = timetableGrid[key] || [];
                return (
                  <td key={day} className="border p-2 min-w-[100px]">
                    {dayEntries.map((entry, i) => (
                      <div key={i} className="mb-1">
                        <div className="font-medium">{entry.subject.name}</div>
                        <div className="text-[10px] text-gray-600">{entry.class.name} {entry.class.section}</div>
                        <div className="text-[10px] text-gray-500">{entry.room.name}</div>
                        <div className="text-[10px] text-gray-500">{entry.subject.teacher?.user?.name || "-"}</div>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPrintPage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/timetable")
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const printContents = printAreaRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>School Timetable</title>
            <style>
              body { font-family: Arial, sans-serif; background: #fff; color: #000; margin: 0; padding: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #888; padding: 8px; text-align: left; }
              th { background: #e0e7ff; }
              h1 { text-align: center; margin-bottom: 24px; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">School Timetable</h1>
        <Button onClick={handlePrint} variant="outline" disabled={loading || entries.length === 0}>
          Print
        </Button>
      </div>
      <div className="mb-4 text-sm text-blue-700">This is a preview. Click <b>Print</b> to print this timetable.</div>
      <div ref={printAreaRef}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TimetablePrint entries={entries} />
        )}
      </div>
    </div>
  );
} 