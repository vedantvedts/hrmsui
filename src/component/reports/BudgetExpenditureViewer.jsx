import React from "react";
import styles from '../../datatable/SmartDatatable.module.css';
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import tabstyles from '../../datatable/SmartDatatable.module.css';
import { formatIndianRupee, getCurrentRegularDate } from "../utils/formatterUtils";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pdfFonts from "../../assets/fonts/vfs_fonts";


const BudgetExpenditureViewer = ({ reportData = [] }) => {

    const headerStructure = [
        { label: "Employee Name", colspan: 1, rowspan: 3 },
        { label: "CEP", colspan: 1, rowspan: 2 },
        { label: "Special", colspan: 2, rowspan: 1 },
        { label: "Targeted", colspan: 2, rowspan: 1 },
        { label: "ME/M.Tech (R&T)", colspan: 1, rowspan: 2 },
        { label: "ME/M.Tech (Director powers)", colspan: 1, rowspan: 2 },
        { label: "Techno-Managerial", colspan: 1, rowspan: 2 },
        { label: "Foreign Training", colspan: 2, rowspan: 1 },
        { label: "Ph.D. reimbursement", colspan: 1, rowspan: 2 },
        { label: "Registration Fee for Sem./Symp./Conf.", colspan: 2, rowspan: 1 },
        { label: "Course Fee", colspan: 1, rowspan: 2 },
        { label: "Others", colspan: 2, rowspan: 1 },
        { label: "Total", colspan: 1, rowspan: 3 }
    ];

    const subHeaders = [
        "Rs.", "RE", "FE", "RE", "FE", "Rs.", "Rs.", "Rs.", "RE", "FE", "Rs.", "RE", "FE", "Rs.", "RE", "FE"
    ];

    const columnMapping = [
        { key: "empName", label: "Employee Name", align: "left" },
        { key: "cep", label: "CEP - Rs.", align: "right" },
        { key: "specialRE", label: "Special - RE", align: "right" },
        { key: "specialFE", label: "Special - FE", align: "right" },
        { key: "targetedRE", label: "Targeted - RE", align: "right" },
        { key: "targetedFE", label: "Targeted - FE", align: "right" },
        { key: "meRt", label: "ME/M.Tech (R&T)", align: "right" },
        { key: "meDirector", label: "ME/M.Tech (Director)", align: "right" },
        { key: "techManagerial", label: "Techno-Managerial", align: "right" },
        { key: "foreignRE", label: "Foreign Training - RE", align: "right" },
        { key: "foreignFE", label: "Foreign Training - FE", align: "right" },
        { key: "phd", label: "Ph.D. reimbursement", align: "right" },
        { key: "registrationRE", label: "Registration - RE", align: "right" },
        { key: "registrationFE", label: "Registration - FE", align: "right" },
        { key: "courseFee", label: "Course Fee", align: "right" },
        { key: "othersRE", label: "Others - RE", align: "right" },
        { key: "othersFE", label: "Others - FE", align: "right" },
        { key: "total", label: "Total", align: "right" }
    ];

    const exportToExcel = () => {
        const fileName = "Budget_Expenditure_Report";
        const worksheet = XLSX.utils.aoa_to_sheet([[fileName.replace(/_/g, ' ')]]);

        // First header row (Main Categories)
        const firstHeaderRow = [
            "Employee Name", "CEP", "Special", "Special", "Targeted", "Targeted", 
            "ME/M.Tech (R&T)", "ME/M.Tech (Director powers)", "Techno-Managerial", 
            "Foreign Training", "Foreign Training", "Ph.D. reimbursement", 
            "Registration Fee", "Registration Fee", "Course Fee", "Others", "Others", "Total"
        ];

        // Second header row (Sub-categories)
        const secondHeaderRow = [
            "", "Rs.", "RE", "FE", "RE", "FE", "Rs.", "Rs.", "Rs.", 
            "RE", "FE", "Rs.", "RE", "FE", "Rs.", "RE", "FE", ""
        ];

        // Add both header rows at row 2
        XLSX.utils.sheet_add_aoa(worksheet, [firstHeaderRow], { origin: "A2" });
        XLSX.utils.sheet_add_aoa(worksheet, [secondHeaderRow], { origin: "A3" });

        // Add data starting at row 4
        const dataRows = reportData.map(row =>
            columnMapping.map(col => {
                const value = row[col.key];
                return value !== undefined && value !== null ? (typeof value === 'number' ? value : value.toString()) : "";
            })
        );
        XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: "A4" });

        // Merge title
        const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }];

        // Merge cells for first header row (multi-column headers)
        // Employee Name (rowspan 2)
        merges.push({ s: { r: 1, c: 0 }, e: { r: 2, c: 0 } });
        // Special (columns C and D)
        merges.push({ s: { r: 1, c: 2 }, e: { r: 1, c: 3 } });
        // Targeted (columns E and F)
        merges.push({ s: { r: 1, c: 4 }, e: { r: 1, c: 5 } });
        // Foreign Training (columns J and K)
        merges.push({ s: { r: 1, c: 9 }, e: { r: 1, c: 10 } });
        // Registration Fee (columns M and N)
        merges.push({ s: { r: 1, c: 12 }, e: { r: 1, c: 13 } });
        // Others (columns Q and R)
        merges.push({ s: { r: 1, c: 15 }, e: { r: 1, c: 16 } });
        // Total (rowspan 2)
        merges.push({ s: { r: 1, c: 17 }, e: { r: 2, c: 17 } });

        worksheet["!merges"] = merges;

        // Style title
        worksheet["A1"].s = {
            font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0163d6" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "F2F2F2" } }
        };

        // Style headers and data
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[address]) continue;

                if (R === 1 || R === 2) {
                    // Header rows styling
                    worksheet[address].s = {
                        fill: { fgColor: { rgb: "0163d6" } },
                        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 10 },
                        alignment: { horizontal: "center", vertical: "center", wrapText: true },
                        border: { 
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            top: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                } else if (R > 2) {
                    // Data rows
                    const colDef = columnMapping[C];
                    const alignment = colDef?.align === "right" ? "right" : colDef?.align === "center" ? "center" : "left";

                    worksheet[address].s = {
                        font: { sz: 10, color: { rgb: "334155" } },
                        alignment: { horizontal: alignment, vertical: "center", wrapText: true },
                        border: { bottom: { style: "thin", color: { rgb: "EDF2F7" } } }
                    };

                    // Zebra striping
                    if (R % 2 === 0) {
                        worksheet[address].s.fill = { fgColor: { rgb: "F8FAFC" } };
                    }

                    // Format numbers with comma separation
                    if (colDef?.align === "right" && !isNaN(worksheet[address].v)) {
                        worksheet[address].z = "#,##0.00";
                    }
                }
            }
        }

        // Set column widths
        worksheet['!cols'] = columnMapping.map(col => ({ wch: Math.max(col.label.length, 12) }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Budget Report");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(finalData, `${fileName}.xlsx`);
    };

    const exportToPDF = async () => {
        const fileName = "Budget_Expenditure_Report";
        const doc = new jsPDF({ orientation: "landscape", format: "a3", unit: "pt" });

        // Add fonts
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

        // Title
        const titleText = fileName.replace(/_/g, ' ');
        doc.setFontSize(18);
        doc.setTextColor("#0163d6");
        doc.setFont("Arial", "bold");
        const titleLines = doc.splitTextToSize(titleText, usableWidth);
        doc.text(titleLines, margin, margin + 16);

        const titleBottom = margin + 16 + titleLines.length * 22;
        const tableStartY = titleBottom + 2;

        // Multi-row header structure
        const firstHeaderRow = [
            { content: "Employee Name", rowSpan: 2 },
            { content: "CEP", rowSpan: 2 },
            { content: "Special", colSpan: 2 },
            { content: "Targeted", colSpan: 2 },
            { content: "ME/M.Tech (R&T)", rowSpan: 2 },
            { content: "ME/M.Tech (Director powers)", rowSpan: 2 },
            { content: "Techno-Managerial", rowSpan: 2 },
            { content: "Foreign Training", colSpan: 2 },
            { content: "Ph.D. reimbursement", rowSpan: 2 },
            { content: "Registration Fee", colSpan: 2 },
            { content: "Course Fee", rowSpan: 2 },
            { content: "Others", colSpan: 2 },
            { content: "Total", rowSpan: 2 }
        ];

        const secondHeaderRow = [
            { content: "Rs." },
            { content: "RE" },
            { content: "FE" },
            { content: "RE" },
            { content: "FE" },
            { content: "Rs." },
            { content: "Rs." },
            { content: "Rs." },
            { content: "RE" },
            { content: "FE" },
            { content: "Rs." },
            { content: "RE" },
            { content: "FE" },
            { content: "Rs." },
            { content: "RE" },
            { content: "FE" }
        ];

        // Multi-row header
        const head = [firstHeaderRow, secondHeaderRow];
        
        // Prepare table data
        const body = reportData.length > 0 ? reportData.map(row =>
            columnMapping.map(col => {
                const value = row[col.key];
                return value !== undefined && value !== null ? value.toString() : "";
            })
        ) : [[{ content: "No records to display", colSpan: columnMapping.length }]];

        // Column styles
        const columnStyles = {};
        columnMapping.forEach((col, i) => {
            columnStyles[i] = {
                halign: col.align === "right" ? "right" : col.align === "center" ? "center" : "left"
            };
        });

        const MIN_COL_WIDTH = 30;

        autoTable(doc, {
            head,
            body,
            startY: tableStartY,
            margin: { left: margin, right: margin, bottom: margin + 20 },
            tableWidth: usableWidth,
            columnStyles,

            styles: {
                fontSize: 8,
                cellPadding: 6,
                textColor: "#334155",
                lineColor: "#e2e8f0",
                lineWidth: 0.5,
                overflow: "linebreak",
                minCellWidth: MIN_COL_WIDTH,
                font: "Arial"
            },

            headStyles: {
                fillColor: "#0163d6",
                textColor: "#ffffff",
                fontStyle: "bold",
                fontSize: 8,
                halign: "center",
                valign: "middle",
                minCellWidth: MIN_COL_WIDTH,
                font: "Arial"
            },

            alternateRowStyles: {
                fillColor: "#f8fafc"
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
            }
        });

        doc.setProperties({
            title: fileName.replace(/_/g, ' '),
            author: "HRMS"
        });

        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    const handleExport = (format) => {
        if (format === 'excel') {
            exportToExcel();
        } else if (format === 'pdf') {
            exportToPDF();
        }
    }

    return (
        <div className="container-fluid mt-4">
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
                            {/* =================== FIRST HEADER ROW =================== */}
                            <tr className="table-light">
                                {/* <th rowSpan="3">Expenditure under</th> */}
                                <th rowSpan="3">Employee Name</th>

                                <th colSpan="1">CEP</th>
                                <th colSpan="2">Special</th>
                                <th colSpan="2">Targeted</th>
                                <th colSpan="1">ME/M.Tech (R&amp;T)</th>
                                <th colSpan="1">ME/M.Tech (Director powers)</th>
                                <th colSpan="1">Techno-Managerial</th>
                                <th colSpan="2">Foreign Training</th>
                                <th colSpan="1">Ph.D. reimbursement</th>
                                <th colSpan="2">Registration Fee for Sem./Symp./Conf.</th>
                                <th colSpan="1">Course Fee</th>
                                <th colSpan="2">Others</th>
                                <th rowSpan="3">Total</th>
                            </tr>

                            {/* =================== SECOND HEADER ROW =================== */}
                            <tr className="table-secondary">
                                <th>Rs.</th>

                                <th>RE</th>
                                <th>FE</th>

                                <th>RE</th>
                                <th>FE</th>

                                <th>Rs.</th>
                                <th>Rs.</th>
                                <th>Rs.</th>

                                <th>RE</th>
                                <th>FE</th>

                                <th>Rs.</th>

                                <th>RE</th>
                                <th>FE</th>

                                <th>Rs.</th>

                                <th>RE</th>
                                <th>FE</th>
                            </tr>

                        </thead>

                        {/* =================== BODY =================== */}
                        <tbody>
                            {reportData.map((row, index) => (
                                <tr key={index}>
                                    <td className="text-start">{row.empName || "-"}</td>

                                    <td className="text-end">{formatIndianRupee(row.cep)}</td>

                                    <td className="text-end">{formatIndianRupee(row.specialRE)}</td>
                                    <td className="text-end">{formatIndianRupee(row.specialFE)}</td>

                                    <td className="text-end">{formatIndianRupee(row.targetedRE)}</td>
                                    <td className="text-end">{formatIndianRupee(row.targetedFE)}</td>

                                    <td className="text-end">{formatIndianRupee(row.meRt)}</td>
                                    <td className="text-end">{formatIndianRupee(row.meDirector)}</td>
                                    <td className="text-end">{formatIndianRupee(row.techManagerial)}</td>

                                    <td className="text-end">{formatIndianRupee(row.foreignRE)}</td>
                                    <td className="text-end">{formatIndianRupee(row.foreignFE)}</td>

                                    <td className="text-end">{formatIndianRupee(row.phd)}</td>

                                    <td className="text-end">{formatIndianRupee(row.registrationRE)}</td>
                                    <td className="text-end">{formatIndianRupee(row.registrationFE)}</td>

                                    <td className="text-end">{formatIndianRupee(row.courseFee)}</td>

                                    <td className="text-end">{formatIndianRupee(row.othersRE)}</td>
                                    <td className="text-end">{formatIndianRupee(row.othersFE)}</td>

                                    <td className="text-end">{formatIndianRupee(row.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BudgetExpenditureViewer;