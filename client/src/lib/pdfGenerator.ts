import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Teacher, ScheduleSlot } from "@shared/schema";
import type { ScheduleSlotData } from "@/types/schedule";
import type { ClassScheduleSlot } from "@/components/ClassScheduleTable";
import { DAYS, PERIODS } from "@shared/schema";
import { loadMultipleFonts } from "./arabicFont";
import type { PDFCustomizationOptions } from "@/types/pdfCustomization";
import { DEFAULT_PDF_OPTIONS } from "@/types/pdfCustomization";

export async function exportTeacherSchedulePDF(
  teacher: Teacher,
  slots: ScheduleSlotData[],
  customOptions?: PDFCustomizationOptions
) {
  const options = { ...DEFAULT_PDF_OPTIONS, ...customOptions };
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const fonts = await loadMultipleFonts(
    doc,
    options.headerFont,
    options.contentFont,
    options.dayFont,
    options.customHeaderFont,
    options.customContentFont,
    options.customDayFont
  );

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont(fonts.header);
  doc.setFontSize(22);
  doc.text(`جدول حصص المعلم: ${teacher.name}`, pageWidth / 2, 15, {
    align: "center",
  });

  doc.setFontSize(16);
  doc.text(`المادة: ${teacher.subject}`, pageWidth / 2, 25, {
    align: "center",
  });

  const headers = [...PERIODS.map((p) => `الحصة ${p}`).reverse(), "اليوم"];
  const body = DAYS.map((day) => {
    const row: string[] = [];
    [...PERIODS].reverse().forEach((period) => {
      const slot = slots.find((s) => s.day === day && s.period === period);
      row.push(slot ? `${slot.grade}/${slot.section}` : "-");
    });
    row.push(day);
    return row;
  });

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 35,
    styles: {
      font: "moo",
      fontSize: options.contentFontSize,
      halign: "center",
      valign: "middle",
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
      textColor: options.contentTextColor,
      minCellHeight: 10,
    },
    headStyles: {
      fillColor: options.themeColor,
      textColor: [255, 255, 255],
      fontStyle: "normal",
      fontSize: options.headerFontSize,
      font: fonts.header,
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
      minCellHeight: 12,
    },
    columnStyles: {
      7: { halign: "right", fontStyle: "normal", fontSize: options.dayFontSize, font: fonts.day, textColor: options.dayTextColor, cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
    tableWidth: 'auto',
  });

  doc.setFont(fonts.content);
  doc.setFontSize(9);
  doc.text(
    `عدد الحصص: ${slots.length}`,
    pageWidth - 15,
    doc.internal.pageSize.getHeight() - 10,
    { align: "right" }
  );

  doc.save(`جدول_${teacher.name}.pdf`);
}

export async function exportClassSchedulePDF(
  grade: number,
  section: number,
  slots: ClassScheduleSlot[],
  showTeacherNames: boolean,
  customOptions?: PDFCustomizationOptions
) {
  const options = { ...DEFAULT_PDF_OPTIONS, ...customOptions };
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const fonts = await loadMultipleFonts(
    doc,
    options.headerFont,
    options.contentFont,
    options.dayFont,
    options.customHeaderFont,
    options.customContentFont,
    options.customDayFont
  );

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("Uthmanic");
  doc.setFontSize(30);
  doc.text(`${grade}/${section}`, pageWidth / 2, 20, { align: "center" });


  const headers = [...PERIODS.map((p) => `الحصة ${p}`).reverse(), "اليوم"];
  const body = DAYS.map((day) => {
    const row: string[] = [];
    [...PERIODS].reverse().forEach((period) => {
      const slot = slots.find((s) => s.day === day && s.period === period);
      if (slot) {
        const cellContent = showTeacherNames
          ? `${slot.subject}\n(${slot.teacherName})`
          : slot.subject;
        row.push(cellContent);
      } else {
        row.push("-");
      }
    });
    row.push(day);
    return row;
  });

  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 22,
    styles: {
      font: fonts.content,
      fontSize: options.contentFontSize,
      halign: "center",
      valign: "middle",
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
      textColor: options.contentTextColor,
      minCellHeight: 9,
    },
    headStyles: {
      fillColor: options.themeColor,
      textColor: [255, 255, 255],
      fontStyle: "normal",
      fontSize: options.headerFontSize,
      font: fonts.header,
      cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      minCellHeight: 11,
    },
    columnStyles: {
      7: { font: fonts.day, fontSize: options.dayFontSize, textColor: options.dayTextColor, halign: "center", cellWidth: 30 },
    },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
  });

  doc.save(`جدول_صف_${grade}_${section}.pdf`);
}

export async function exportAllTeachersPDF(
  teachers: Teacher[],
  allSlots: ScheduleSlot[],
  customOptions?: PDFCustomizationOptions
) {
  const options = { ...DEFAULT_PDF_OPTIONS, ...customOptions };
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const fonts = await loadMultipleFonts(
    doc,
    options.headerFont,
    options.contentFont,
    options.dayFont,
    options.customHeaderFont,
    options.customContentFont,
    options.customDayFont
  );

  const pageWidth = doc.internal.pageSize.getWidth();
  let isFirstPage = true;

  teachers.forEach((teacher) => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    const teacherSlots: ScheduleSlotData[] = allSlots
      .filter((slot) => slot.teacherId === teacher.id)
      .map((slot) => ({
        day: slot.day,
        period: slot.period,
        grade: slot.grade,
        section: slot.section,
      }));

    doc.setFont(fonts.header);
    doc.setFontSize(16);
    doc.text(
      `جدول حصص: ${teacher.name}`,
      pageWidth - 15,
      15,
      { align: "right" }
    );

    doc.setFontSize(11);
    doc.text(
      `المادة: ${teacher.subject}`,
      pageWidth - 15,
      23,
      { align: "right" }
    );

    const headers = [...PERIODS.map((p) => `الحصة ${p}`).reverse(), "اليوم"];
    const body = DAYS.map((day) => {
      const row: string[] = [];
      [...PERIODS].reverse().forEach((period) => {
        const slot = teacherSlots.find(
          (s) => s.day === day && s.period === period
        );
        row.push(slot ? `${slot.grade}/${slot.section}` : "-");
      });
      row.push(day);
      return row;
    });

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 30,
      styles: {
        font: "moo",
        fontSize: options.contentFontSize,
        halign: "center",
        valign: "middle",
        cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
        textColor: options.contentTextColor,
        minCellHeight: 9,
      },
      headStyles: {
        fillColor: options.themeColor,
        textColor: [255, 255, 255],
        fontStyle: "normal",
        fontSize: options.headerFontSize,
        font: fonts.header,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
        minCellHeight: 11,
      },
      columnStyles: {
        7: { halign: "right", fontStyle: "normal", fontSize: options.dayFontSize, font: fonts.day, textColor: options.dayTextColor, cellWidth: 'auto' },
      },
      margin: { left: 12, right: 12 },
      tableWidth: 'auto',
    });

    doc.setFont(fonts.content);
    doc.setFontSize(8);
    doc.text(
      `عدد الحصص: ${teacherSlots.length}`,
      pageWidth - 15,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  });

  doc.save("جداول_جميع_المعلمين.pdf");
}

export async function exportAllClassesPDF(
  allSlots: ScheduleSlot[],
  allTeachers: Teacher[],
  showTeacherNames: boolean,
  customOptions?: PDFCustomizationOptions,
  gradeSections?: Record<string, number[]>
) {
  const options = { ...DEFAULT_PDF_OPTIONS, ...customOptions };
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const fonts = await loadMultipleFonts(
    doc,
    options.headerFont,
    options.contentFont,
    options.dayFont,
    options.customHeaderFont,
    options.customContentFont,
    options.customDayFont
  );

  const pageWidth = doc.internal.pageSize.getWidth();
  const teacherMap = new Map(allTeachers.map((t) => [t.id, t]));
  let isFirstPage = true;

  for (let grade = 10; grade <= 12; grade++) {
    const sections = gradeSections?.[grade.toString()] || [1, 2, 3, 4, 5, 6, 7];
    for (const section of sections) {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      const classSlots = allSlots.filter(
        (slot) => slot.grade === grade && slot.section === section
      );

      const schedule: ClassScheduleSlot[] = classSlots.map((slot) => {
        const teacher = teacherMap.get(slot.teacherId);
        return {
          day: slot.day,
          period: slot.period,
          subject: (teacher?.subject || "عربي") as any,
          teacherName: teacher?.name || "Unknown",
        };
      });

      doc.setFont("Uthmanic");
      doc.setFontSize(30);
      doc.text(`${grade}/${section}`, pageWidth / 2, 20, { align: "center" });


      const headers = [...PERIODS.map((p) => `الحصة ${p}`).reverse(), "اليوم"];
      const body = DAYS.map((day) => {
        const row: string[] = [];
        [...PERIODS].reverse().forEach((period) => {
          const slot = schedule.find(
            (s) => s.day === day && s.period === period
          );
          if (slot) {
            const cellContent = showTeacherNames
              ? `${slot.subject}\n(${slot.teacherName})`
              : slot.subject;
            row.push(cellContent);
          } else {
            row.push("-");
          }
        });
        row.push(day);
        return row;
      });

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 22,
        styles: {
          font: fonts.content,
          fontSize: options.contentFontSize,
          halign: "center",
          valign: "middle",
          cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
          textColor: options.contentTextColor,
          minCellHeight: 9,
        },
        headStyles: {
          fillColor: options.themeColor,
          textColor: [255, 255, 255],
          fontStyle: "normal",
          fontSize: options.headerFontSize,
          font: fonts.header,
          cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
          minCellHeight: 11,
        },
        columnStyles: {
          7: { font: fonts.day, fontSize: options.dayFontSize, textColor: options.dayTextColor, halign: "right", cellWidth: 'auto' },
        },
        margin: { left: 12, right: 12 },
        tableWidth: 'auto',
      });
    }
  }

  doc.save("جداول_جميع_الصفوف.pdf");
}
