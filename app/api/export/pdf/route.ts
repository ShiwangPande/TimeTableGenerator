import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getTimetable } from "@/lib/timetable";
import PDFDocument from "pdfkit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth();
    const entries = await getTimetable({});

    // Create a PDF document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(20).text('School Timetable', { align: 'center' });
    doc.moveDown();

    // Table header
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Day', 40, doc.y, { continued: true, width: 60 });
    doc.text('Time', 100, doc.y, { continued: true, width: 80 });
    doc.text('Class', 180, doc.y, { continued: true, width: 80 });
    doc.text('Subject', 260, doc.y, { continued: true, width: 100 });
    doc.text('Teacher', 360, doc.y, { continued: true, width: 100 });
    doc.text('Room', 460, doc.y, { width: 60 });
    doc.moveDown(0.5);
    // doc.font('Helvetica'); // Removed to avoid ENOENT error

    // Table rows
    entries.forEach((entry) => {
      doc.text(entry.dayOfWeek, 40, doc.y, { continued: true, width: 60 });
      doc.text(entry.timeSlot.label, 100, doc.y, { continued: true, width: 80 });
      doc.text(`${entry.class.name} ${entry.class.section}`, 180, doc.y, { continued: true, width: 80 });
      doc.text(entry.subject.name, 260, doc.y, { continued: true, width: 100 });
      doc.text(entry.subject.teacher.user.name, 360, doc.y, { continued: true, width: 100 });
      doc.text(entry.room.name, 460, doc.y, { width: 60 });
    });

    doc.end();
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const bufs: Buffer[] = [];
      doc.on('data', (d) => bufs.push(d));
      doc.on('end', () => resolve(Buffer.concat(bufs)));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="timetable.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Failed to export timetable as PDF" }, { status: 500 });
  }
} 