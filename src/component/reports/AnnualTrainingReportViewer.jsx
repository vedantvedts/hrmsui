import React, { useState } from "react";
import styles from '../../datatable/SmartDatatable.module.css';
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import tabstyles from '../../datatable/SmartDatatable.module.css';
import { ExportUtils } from "../../datatable/exportUtils";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pdfFonts from "../../assets/fonts/vfs_fonts";
import { getCurrentRegularDate } from "../utils/formatterUtils";

const AnnualTrainingReportViewer = ({ reportData = [] }) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const totals = reportData.reduce((acc, row) => {
    acc.withinLab += row.withinLab || 0;
    acc.otherLabs += row.otherLabs || 0;
    acc.outsideWithinIndia += row.outsideWithinIndia || 0;
    acc.outsideForeignAgency += row.outsideForeignAgency || 0;
    acc.subTotal += row.subTotal || 0;
    acc.drdsTni += row.drdsTni || 0;
    acc.drdsRacBoard += row.drdsRacBoard || 0;
    acc.drdsOpen += row.drdsOpen || 0;
    acc.drdsTotal += row.drdsTotal || 0;
    acc.drtcTni += row.drtcTni || 0;
    acc.drtcCeptamBoard += row.drtcCeptamBoard || 0;
    acc.drtcOpen += row.drtcOpen || 0;
    acc.drtcTotal += row.drtcTotal || 0;
    acc.adminAlliedTni += row.adminAlliedTni || 0;
    acc.adminAlliedOpen += row.adminAlliedOpen || 0;
    acc.adminAlliedTotal += row.adminAlliedTotal || 0;
    acc.othersTotal += row.othersTotal || 0;
    return acc;
  }, {
    withinLab: 0,
    otherLabs: 0,
    outsideWithinIndia: 0,
    outsideForeignAgency: 0,
    subTotal: 0,
    drdsTni: 0,
    drdsRacBoard: 0,
    drdsOpen: 0,
    drdsTotal: 0,
    drtcTni: 0,
    drtcCeptamBoard: 0,
    drtcOpen: 0,
    drtcTotal: 0,
    adminAlliedTni: 0,
    adminAlliedOpen: 0,
    adminAlliedTotal: 0,
    othersTotal: 0
  });

  const handleExport = (type) => {

    const exportRows = reportData.map((row, index) => ([
      index + 1,
      row.course,
      row.withinLab || 0,
      row.otherLabs || 0,
      row.outsideWithinIndia || 0,
      row.outsideForeignAgency || 0,
      row.subTotal || 0,

      row.drdsTni || 0,
      row.drdsRacBoard || 0,
      row.drdsOpen || 0,
      row.drdsTotal || 0,
      row.drdsMaleFemale || "",

      row.drtcTni || 0,
      row.drtcCeptamBoard || 0,
      row.drtcOpen || 0,
      row.drtcTotal || 0,
      row.drtcMaleFemale || "",

      row.adminAlliedTni || 0,
      row.adminAlliedOpen || 0,
      row.adminAlliedTotal || 0,
      row.adminAlliedMaleFemale || "",

      row.othersTotal || 0,
      row.othersMaleFemale || ""
    ]));

    // ✅ GRAND TOTAL ROW
    exportRows.push([
      "",
      "GRAND TOTAL",
      totals.withinLab,
      totals.otherLabs,
      totals.outsideWithinIndia,
      totals.outsideForeignAgency,
      totals.subTotal,

      totals.drdsTni,
      totals.drdsRacBoard,
      totals.drdsOpen,
      totals.drdsTotal,
      "",

      totals.drtcTni,
      totals.drtcCeptamBoard,
      totals.drtcOpen,
      totals.drtcTotal,
      "",

      totals.adminAlliedTni,
      totals.adminAlliedOpen,
      totals.adminAlliedTotal,
      "",

      totals.othersTotal,
      ""
    ]);

    const headers = [
      "SN", "Course Name", "Within Lab", "Other Labs",
      "Outside (India)", "Outside (Foreign)", "Sub Total",

      "DRDS TNI", "DRDS RAC", "DRDS Open", "DRDS Total", "DRDS M/F",

      "DRTC TNI", "DRTC CEPTAM", "DRTC Open", "DRTC Total", "DRTC M/F",

      "Admin TNI", "Admin Open", "Admin Total", "Admin M/F",

      "Others Total", "Others M/F"
    ];

    if (type === "excel") exportToExcel(headers, exportRows);
    if (type === "pdf") exportToPDF(headers, exportRows);
  };

  const exportToExcel = (headers, rows) => {

    const headerRow1 = [
      "SN", "Course name", "Within Lab (No.)", "Other Labs (No.)",
      "Outside (Within India)", "Outside (Foreign Agency)", "Sub Total",
      "No. of Participants (DRDS)", "", "", "", "",
      "No. of Participants (DRTC)", "", "", "", "",
      "No. of Participants (Admin & Allied)", "", "", "",
      "No. of Participants (Others)", ""
    ];

    const headerRow2 = [
      "", "", "", "", "", "", "",
      "TNI (No. & %)", "RAC Board Recomm.", "Open (No. & %)", "Total", "Male/Female",
      "TNI (No. & %)", "CEPTAM Board Recomm.", "Open (No. & %)", "Total", "Male/Female",
      "TNI (No. & %)", "Open (No. & %)", "Total", "Male/Female",
      "Total", "Male/Female"
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Annual Training Report"],
      [],
      headerRow1,
      headerRow2,
      ...rows
    ]);

    worksheet["!merges"] = [

      // Title Merge
      { s: { r: 0, c: 0 }, e: { r: 0, c: 22 } },

      // Vertical merges
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } },
      { s: { r: 2, c: 3 }, e: { r: 3, c: 3 } },
      { s: { r: 2, c: 4 }, e: { r: 3, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 3, c: 5 } },
      { s: { r: 2, c: 6 }, e: { r: 3, c: 6 } },

      // DRDS
      { s: { r: 2, c: 7 }, e: { r: 2, c: 11 } },

      // DRTC
      { s: { r: 2, c: 12 }, e: { r: 2, c: 16 } },

      // Admin
      { s: { r: 2, c: 17 }, e: { r: 2, c: 20 } },

      // Others
      { s: { r: 2, c: 21 }, e: { r: 2, c: 22 } }
    ];

    // Style the Title (Cell A1)
    worksheet["A1"].s = {
      font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0163d6" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F2F2F2" } }
    };

    // Get range to loop through cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    // Loop through every cell in the range
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[address]) continue;

        // Style Table Headers (Row index 2 and 3)
        if (R === 2 || R === 3) {
          worksheet[address].s = {
            fill: { fgColor: { rgb: "0163d6" } },
            font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" },
            border: { bottom: { style: "thin", color: { rgb: "000000" } } }
          };
        }

        // Style Data Cells (Row index 4 and onwards)
        else if (R >= 4) {
          worksheet[address].s = {
            font: { sz: 10, color: { rgb: "334155" } },
            alignment: { horizontal: "center", vertical: "center" },
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

    // Auto-calculate column widths
    worksheet['!cols'] = Array(23).fill({ wch: 15 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(finalData, `${"Annual_Training_Report"}.xlsx`);
  };


  const exportToPDF = (headers, rows) => {

    const colCount = 23;

    const getPageConfig = (n) => {
      return { orientation: "landscape", format: "a3" };
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
    const titleText = "Annual Training Report";
    doc.setFontSize(18);
    doc.setTextColor("#0163d6");
    doc.setFont("Arial", "bold");

    const titleLines = doc.splitTextToSize(titleText, usableWidth);
    doc.text(titleLines, margin, margin + 16);

    const titleLineHeight = 22;
    const titleBottom = margin + 16 + titleLines.length * titleLineHeight;
    const tableStartY = titleBottom + 2;

    // ── Table data ─────────────────────────────────────────────────────────────
    const head = [
      [
        { content: "SN", rowSpan: 2 },
        { content: "Course name", rowSpan: 2 },
        { content: "Within Lab (No.)", rowSpan: 2 },
        { content: "Other Labs (No.)", rowSpan: 2 },
        { content: "Outside (Within India)", rowSpan: 2 },
        { content: "Outside (Foreign Agency)", rowSpan: 2 },
        { content: "Sub Total", rowSpan: 2 },

        { content: "No. of Participants (DRDS)", colSpan: 5 },
        { content: "No. of Participants (DRTC)", colSpan: 5 },
        { content: "No. of Participants (Admin & Allied)", colSpan: 4 },
        { content: "No. of Participants (Others)", colSpan: 2 }
      ],
      [
        "TNI (No. & %)", "RAC Board Recomm.", "Open (No. & %)", "Total", "Male/Female",
        "TNI (No. & %)", "CEPTAM Board Recomm.", "Open (No. & %)", "Total", "Male/Female",
        "TNI (No. & %)", "Open (No. & %)", "Total", "Male/Female",
        "Total", "Male/Female"
      ]
    ];
    const body = rows;

    // ── Column styles: alignment ONLY, no cellWidth ────────────────────────────
    // Let autoTable measure content naturally, then we scale to fit the page
    const columnStyles = {};
    for (let i = 0; i < colCount; i++) {
      columnStyles[i] = { halign: i === 1 ? 'left' : 'center' };
    }

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
        if (hookData.row.index === rows.length - 1) {
          hookData.cell.styles.fillColor = "#FFF2CC";
          hookData.cell.styles.fontStyle = "bold";
        }
        if (hookData.column.index === 1) {
          hookData.cell.styles.halign = "left";
        }
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
      title: "Annual Training Report",
      author: "HRMS",
    });

    // doc.save(`${fileName}.pdf`);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="mt-4">
      <div className="card shadow">

        <div className={`d-flex align-items-center ${styles.gap2}`}>

          {/* EXPORT BUTTONS */}
          <div className={styles.exportWrapper}>
            <span className={styles.exportLabel}>EXPORT AS:</span>
            <div className={`btn-group ${styles.premiumBtnGroup}`}>
              <button className={`btn ${styles.exportBtn} ${styles.pdfBtn}`} onClick={() => handleExport('pdf')}>
                <FaRegFilePdf className={`${styles.exportIcon}`} />
                PDF
              </button>
              <button className={`btn ${styles.exportBtn} ${styles.excelBtn}`} onClick={() => handleExport('excel')}>
                <FaRegFileExcel className={`${styles.exportIcon}`} />
                Excel
              </button>
            </div>
          </div>
        </div>

        <div className={tabstyles.datatableContainer}>
          <table className={`${tabstyles.table} table table-bordered table-hover`}>
            <thead>
              {/* ================= FIRST HEADER ROW ================= */}
              <tr className="table-light">
                <th rowSpan="4">SN</th>
                <th rowSpan="4">Course name</th>
                <th rowSpan="4">Within Lab (No.)</th>
                <th rowSpan="4">Other Labs (No.)</th>
                <th rowSpan="4">Outside (Within India)</th>
                <th rowSpan="4">Outside (Foreign Agency)</th>
                <th rowSpan="4">Sub Total</th>

                <th colSpan="5">No. of Participants (DRDS)</th>
                <th colSpan="5">No. of Participants (DRTC)</th>
                <th colSpan="4">No. of Participants (Admin & Allied)</th>
                <th colSpan="2">No. of Participants (Others)</th>
              </tr>

              {/* ================= SECOND HEADER ROW ================= */}
              <tr className="table-secondary">

                <th rowSpan="3">TNI (No. & %)</th>
                <th rowSpan="3">RAC Board Recomm. (no & %) </th>
                <th rowSpan="3">Open (No. & %)</th>
                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male/Female</th>

                <th rowSpan="3">TNI (No. & %)</th>
                <th rowSpan="3">CEPTAM Board Recomm. (no & %) </th>
                <th rowSpan="3">Open (No. & %)</th>
                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male/Female</th>

                <th rowSpan="3">TNI (No. & %)</th>
                <th rowSpan="3">Open (No. & %)</th>
                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male/Female</th>

                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male/Female</th>
              </tr>

              <tr></tr>
              <tr></tr>
            </thead>

            <tbody>

              {reportData.length > 0 ? (
                <>
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      <td className="text-center">{row.sn}</td>
                      <td>{row.course}</td>
                      <td className="text-center">{row.withinLab}</td>
                      <td className="text-center">{row.otherLabs}</td>
                      <td className="text-center">{row.outsideWithinIndia}</td>
                      <td className="text-center">{row.outsideForeignAgency}</td>
                      <td className="text-center">{row.subTotal}</td>

                      <td className="text-center">{row.drdsTni || 0}</td>
                      <td className="text-center">{row.drdsRacBoard || 0}</td>
                      <td className="text-center">{row.drdsOpen || 0}</td>
                      <td className="text-center">{row.drdsTotal || 0}</td>
                      <td className="text-center">{row.drdsMaleFemale || ''}</td>

                      <td className="text-center">{row.drtcTni || 0}</td>
                      <td className="text-center">{row.drtcCeptamBoard || 0}</td>
                      <td className="text-center">{row.drtcOpen || 0}</td>
                      <td className="text-center">{row.drtcTotal || 0}</td>
                      <td className="text-center">{row.drtcMaleFemale || ''}</td>

                      <td className="text-center">{row.adminAlliedTni || 0}</td>
                      <td className="text-center">{row.adminAlliedOpen || 0}</td>
                      <td className="text-center">{row.adminAlliedTotal || 0}</td>
                      <td className="text-center">{row.adminAlliedMaleFemale || ''}</td>

                      <td className="text-center">{row.othersTotal || 0}</td>
                      <td className="text-center">{row.othersMaleFemale || ''}</td>
                    </tr>
                  ))}

                  {/* ===== GRAND TOTAL ROW ===== */}
                  <tr className="table-warning fw-bold">
                    <td colSpan="2" className="text-center">GRAND TOTAL</td>
                    <td className="text-center">{totals.withinLab}</td>
                    <td className="text-center">{totals.otherLabs}</td>
                    <td className="text-center">{totals.outsideWithinIndia}</td>
                    <td className="text-center">{totals.outsideForeignAgency}</td>
                    <td className="text-center">{totals.subTotal}</td>

                    <td className="text-center">{totals.drdsTni}</td>
                    <td className="text-center">{totals.drdsRacBoard}</td>
                    <td className="text-center">{totals.drdsOpen}</td>
                    <td className="text-center">{totals.drdsTotal}</td>
                    <td></td>

                    <td className="text-center">{totals.drtcTni}</td>
                    <td className="text-center">{totals.drtcCeptamBoard}</td>
                    <td className="text-center">{totals.drtcOpen}</td>
                    <td className="text-center">{totals.drtcTotal}</td>
                    <td></td>

                    <td className="text-center">{totals.adminAlliedTni}</td>
                    <td className="text-center">{totals.adminAlliedOpen}</td>
                    <td className="text-center">{totals.adminAlliedTotal}</td>
                    <td></td>

                    <td className="text-center">{totals.othersTotal}</td>
                    <td></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="24" className="text-center">No data available</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default AnnualTrainingReportViewer;