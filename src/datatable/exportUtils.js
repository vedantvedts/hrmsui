import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pdfFonts from "../../src/assets/fonts/vfs_fonts";
import { getCurrentRegularDate } from "../component/utils/formatterUtils";



const mapAlignment = (align) => {
  if (align === 'text-center') return 'center';
  if (align === 'text-end') return 'right';
  return 'left';
};

/**
 * Utility to handle all table exports with premium enterprise styling.
 */
export const ExportUtils = {

  exportToExcel: (data, columns, fileName = "Export") => {
    // 1. Initialize worksheet with title
    const worksheet = XLSX.utils.aoa_to_sheet([[fileName.replace(/_/g, ' ')]]);

    // 2. Add JSON data (Headers start at Row 3, Index 2)
    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A3", skipHeader: false });

    // 3. Merge title across columns
    const mergeRange = { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } };
    worksheet["!merges"] = [mergeRange];

    // 4. Style the Title (Cell A1)
    worksheet["A1"].s = {
      font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0163d6" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F2F2F2" } }
    };

    // 5. Get range to loop through cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    // Loop through every cell in the range
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[address]) continue;

        // --- STYLING LOGIC ---

        // A. Style Table Headers (Row index 2)
        if (R === 2) {
          worksheet[address].s = {
            fill: { fgColor: { rgb: "0163d6" } },
            font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" },
            border: { bottom: { style: "thin", color: { rgb: "000000" } } }
          };
        }

        // B. Style Data Cells (Row index 3 and onwards)
        else if (R > 2) {
          const colDef = columns[C]; // Get column definition for this column index

          worksheet[address].s = {
            font: { sz: 10, color: { rgb: "334155" } },
            alignment: {
              // Use your existing mapAlignment function!
              horizontal: mapAlignment(colDef?.align),
              vertical: "center",
              wrapText: true
            },
            border: {
              bottom: { style: "thin", color: { rgb: "EDF2F7" } }
            }
          };

          // Optional: Add zebra striping for premium look
          if (R % 2 === 0) {
            worksheet[address].s.fill = { fgColor: { rgb: "F8FAFC" } };
          }
        }
      }
    }

    // 6. Auto-calculate column widths
    worksheet['!cols'] = columns.map(col => ({ wch: Math.max(col.name.length, 15) }));

    // 7. Save file
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(finalData, `${fileName}.xlsx`);
  },


  exportToPDF: async (data, columns, fileName = "Export",) => {
    const colCount = columns.length;

    const getPageConfig = (n) => {
      if (n <= 5) return { orientation: "portrait", format: "a4" };
      if (n <= 8) return { orientation: "landscape", format: "a4" };
      if (n <= 12) return { orientation: "landscape", format: "a3" };
      if (n <= 18) return { orientation: "landscape", format: "a2" };
      if (n <= 24) return { orientation: "landscape", format: "a1" };
      return { orientation: "landscape", format: "a0" };
    };

    const { orientation, format } = getPageConfig(colCount);
    const doc = new jsPDF({ orientation, format, unit: "pt" });

    if (pdfFonts) {
      doc.addFileToVFS('arial.ttf', pdfFonts['arial.ttf']);
      doc.addFileToVFS('arialbd.ttf', pdfFonts['arialbd.ttf']);

      doc.addFont('arial.ttf', 'Arial', 'normal');
      doc.addFont('arialbd.ttf', 'Arial', 'bold');
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const usableWidth = pageWidth - margin * 2;

    // ── Font size scales down for dense tables ─────────────────────────────────
    const fontSize = colCount > 18 ? 6 : colCount > 12 ? 7 : colCount > 8 ? 8 : 9;
    const headFontSize = colCount > 18 ? 6 : colCount > 12 ? 7 : colCount > 8 ? 8 : 10;
    const cellPadding = colCount > 12 ? 4 : 6;

    // ── Title ──────────────────────────────────────────────────────────────────
    const titleText = fileName.replace(/_/g, ' ');
    doc.setFontSize(18);
    doc.setTextColor("#0163d6");
    doc.setFont("Arial", "bold");

    const titleLines = doc.splitTextToSize(titleText, usableWidth);
    doc.text(titleLines, margin, margin + 16);

    const titleLineHeight = 22;
    const titleBottom = margin + 16 + titleLines.length * titleLineHeight;
    const tableStartY = titleBottom + 2;

    // ── Table data ─────────────────────────────────────────────────────────────
    const head = [columns.map((col) => col.name)];
    const body = data.length > 0 ? data.map((row) =>
      Object.values(row).map((val) => val?.toString() ?? "")
    ) : [[{ content: "There are no records to display", colSpan: columns.length }]];

    // ── Column styles: alignment ONLY, no cellWidth ────────────────────────────
    // Let autoTable measure content naturally, then we scale to fit the page
    const columnStyles = {};
    columns.forEach((col, i) => {
      columnStyles[i] = { halign: mapAlignment(col.align) };
    });

    // ── First pass: measure natural content widths ─────────────────────────────
    // We use autoTable's columnWidth calculation via a dry run approach:
    // Provide minCellWidth so no column collapses, tableWidth "wrap" to get natural sizes
    const MIN_COL_WIDTH = 30; // pt — absolute minimum per column

    // After autoTable runs, it exposes the final column widths via the table object.
    // We hook into didParseCell to do nothing, then scale in willDrawCell if needed.
    // Simpler: use tableWidth as usableWidth + autoTable's "auto" content fitting.

    autoTable(doc, {
      head,
      body,
      startY: tableStartY,
      margin: { left: margin, right: margin, bottom: margin + 20 },
      tableWidth: usableWidth,   // hard-constrain to page
      columnStyles,

      // KEY: let autoTable distribute widths by content, then scale to fit
      // "auto" means: size each column to its content, then scale all proportionally to fit tableWidth
      // This is what actually fixes the squished columns issue
      styles: {
        fontSize,
        cellPadding,
        textColor: "#334155",
        lineColor: "#e2e8f0",
        lineWidth: 0.5,
        overflow: "linebreak",
        minCellWidth: MIN_COL_WIDTH,
      },

      headStyles: {
        fillColor: "#0163d6",
        textColor: "#ffffff",
        fontStyle: "bold",
        fontSize: headFontSize,
        halign: "center",
        minCellWidth: MIN_COL_WIDTH,
      },

      alternateRowStyles: {
        fillColor: "#f8fafc",
      },

      // autoTable by default distributes columns proportionally when tableWidth is set.
      // To make it content-aware, we override column widths after the first internal layout pass.
      didParseCell: (hookData) => {
        // Remove any forced cellWidth so autoTable uses content-based sizing
        delete hookData.column.width;
      },

      didDrawPage: ({ pageNumber }) => {
        const pageCount = doc.internal.getNumberOfPages();
        const footerY = pageHeight - margin + 10;
        const timestamp = `Generated on: ${getCurrentRegularDate()} ${new Date().toLocaleTimeString()}`;

        doc.setDrawColor("#e2e8f0");
        doc.setLineWidth(0.5);
        doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

        doc.setFontSize(8);
        doc.setTextColor("#808791");
        doc.setFont("Arial", "normal");
        doc.text(timestamp, margin, footerY + 4);
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          pageWidth - margin,
          footerY + 4,
          { align: "right" }
        );
      },
    });

    doc.setProperties({
      title: `${fileName.replace(/_/g, ' ')}`,
      author: "HRMS",
    });

    // doc.save(`${fileName}.pdf`);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  },
  // exportToCSV: (data, columns, fileName = "Export") => {
  //   const csvContent = [
  //     columns.map(col => col.name).join(","), 
  //     ...data.map(row => Object.values(row).map(val => `"${val}"`).join(",")) 
  //   ].join("\n");

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   saveAs(blob, `${fileName}.csv`);
  // }
};