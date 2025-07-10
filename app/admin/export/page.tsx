"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, FileText } from 'lucide-react';

interface TimetableEntry {
  dayOfWeek: string;
  timeSlot: { label: string };
  class: { name: string; section: string };
  subject: { name: string; teacher?: { user?: { name?: string } } };
  room: { name: string };
}

export default function AdminExportPage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timetable")
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  // Group by day and time slot
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const safeEntries = Array.isArray(entries) ? entries : [];
  const validEntries = safeEntries.filter((e) => e && e.timeSlot && e.timeSlot.label);
  const timeSlots = Array.from(new Set(validEntries.map((e) => e.timeSlot.label))).sort();
  const timetableGrid: Record<string, TimetableEntry[]> = {};
  validEntries.forEach((entry) => {
    const key = `${entry.dayOfWeek}-${entry.timeSlot.label}`;
    if (!timetableGrid[key]) timetableGrid[key] = [];
    timetableGrid[key].push(entry);
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-2 drop-shadow">Export Timetable</h1>
          <p className="text-lg text-blue-700 mb-4">Download your school timetable in multiple formats. Preview below shows what will be exported.</p>
        </div>
        <Card className="shadow-xl border-0 bg-white/90">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <File className="h-6 w-6 text-green-600" />
              Export Options
            </CardTitle>
            <CardDescription>
              Choose your preferred format. For best results, use Excel for editing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 mt-4">
            <Button asChild variant="outline" className="gap-2 transition-all hover:bg-green-50 focus:ring-2 focus:ring-green-300">
              <a href="/api/export" download>
                <File className="h-5 w-5 text-green-600" />
                Export as Excel (.xlsx)
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2 transition-all hover:bg-blue-50 focus:ring-2 focus:ring-blue-300">
              <a href="/api/export/csv" download>
                <FileText className="h-5 w-5 text-blue-600" />
                Export as CSV (.csv)
              </a>
            </Button>
          </CardContent>
        </Card>
        {/* Timetable Preview Section */}
        <Card className="shadow border-0 bg-white/95">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Timetable Preview</CardTitle>
            <CardDescription>This is a preview of the current timetable. Exported files will contain this data.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading preview...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-xs">
                  <thead>
                    <tr>
                      <th className="border p-1">Time</th>
                      <th className="border p-1">Class</th>
                      <th className="border p-1">Subject</th>
                      <th className="border p-1">Teacher</th>
                      <th className="border p-1">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validEntries.map((entry, i) => (
                      <tr key={i}>
                        <td className="border p-1 whitespace-nowrap">{entry.timeSlot.label}</td>
                        <td className="border p-1 whitespace-nowrap">{entry.class.name} {entry.class.section}</td>
                        <td className="border p-1 whitespace-nowrap">{entry.subject.name}</td>
                        <td className="border p-1 whitespace-nowrap">{entry.subject.teacher?.user?.name || "-"}</td>
                        <td className="border p-1 whitespace-nowrap">{entry.room.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Removed Print Timetable section */}
      </div>
    </div>
  );
} 