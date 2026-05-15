import React from "react";
import styles from '../../datatable/SmartDatatable.module.css';
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import tabstyles from '../../datatable/SmartDatatable.module.css';
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pdfFonts from "../../assets/fonts/vfs_fonts";


const GenderBudgetingViewer = ({ reportData = [] }) => {

    const exportToExcel = (reportData, fileName = "Gender_Budgeting_Report") => {
        const headers = [
            ["LAB NAME", "CEP", null, null, null, null, null, "Special / Targeted", null, null, null, null, null, "Higher Degree (ME/M.Tech/Ph.D)", null, null, null, null, null, "Sponsored for Seminar/Conference", null, null, null, null, null, "Foreign Training", null, null, null, null, null, "Others", null, null, null, null, null],
            [null, "Male", null, "Female", null, "Total", null, "Male", null, "Female", null, "Total", null, "Male", null, "Female", null, "Total", null, "Male", null, "Female", null, "Total", null, "Male", null, "Female", null, "Total", null, "Male", null, "Female", null, "Total", null],
            [null, "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget", "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget", "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget", "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget", "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget", "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget"]
        ];

        const dataRows = reportData.map(data => [
            data.labName, data.cepMaleNo, data.cepMaleExp, data.cepFemaleNo, data.cepFemaleExp, data.cepTotalNo, data.cepTotalExp,
            data.specialMaleNo, data.specialMaleExp, data.specialFemaleNo, data.specialFemaleExp, data.specialTotalNo, data.specialTotalExp,
            data.higherDegreeMaleNo, data.higherDegreeMaleExp, data.higherDegreeFemaleNo, data.higherDegreeFemaleExp, data.higherDegreeTotalNo, data.higherDegreeTotalExp,
            data.seminarMaleNo, data.seminarMaleExp, data.seminarFemaleNo, data.seminarFemaleExp, data.seminarTotalNo, data.seminarTotalExp,
            data.foreignMaleNo, data.foreignMaleExp, data.foreignFemaleNo, data.foreignFemaleExp, data.foreignTotalNo, data.foreignTotalExp,
            data.othersMaleNo, data.othersMaleExp, data.othersFemaleNo, data.othersFemaleExp, data.othersTotalNo, data.othersTotalExp
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([[fileName.replace(/_/g, ' ')]].concat(headers).concat(dataRows));

        const merges = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 36 } }, // title
            { s: { r: 1, c: 0 }, e: { r: 3, c: 0 } }, // LAB NAME
            { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } }, // CEP
            { s: { r: 1, c: 7 }, e: { r: 1, c: 12 } }, // Special
            { s: { r: 1, c: 13 }, e: { r: 1, c: 18 } }, // Higher
            { s: { r: 1, c: 19 }, e: { r: 1, c: 24 } }, // Seminar
            { s: { r: 1, c: 25 }, e: { r: 1, c: 30 } }, // Foreign
            { s: { r: 1, c: 31 }, e: { r: 1, c: 36 } }, // Others
            { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, // CEP Male
            { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } }, // CEP Female
            { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } }, // CEP Total
            { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } }, // Special Male
            { s: { r: 2, c: 9 }, e: { r: 2, c: 10 } }, // Special Female
            { s: { r: 2, c: 11 }, e: { r: 2, c: 12 } }, // Special Total
            { s: { r: 2, c: 13 }, e: { r: 2, c: 14 } }, // Higher Male
            { s: { r: 2, c: 15 }, e: { r: 2, c: 16 } }, // Higher Female
            { s: { r: 2, c: 17 }, e: { r: 2, c: 18 } }, // Higher Total
            { s: { r: 2, c: 19 }, e: { r: 2, c: 20 } }, // Seminar Male
            { s: { r: 2, c: 21 }, e: { r: 2, c: 22 } }, // Seminar Female
            { s: { r: 2, c: 23 }, e: { r: 2, c: 24 } }, // Seminar Total
            { s: { r: 2, c: 25 }, e: { r: 2, c: 26 } }, // Foreign Male
            { s: { r: 2, c: 27 }, e: { r: 2, c: 28 } }, // Foreign Female
            { s: { r: 2, c: 29 }, e: { r: 2, c: 30 } }, // Foreign Total
            { s: { r: 2, c: 31 }, e: { r: 2, c: 32 } }, // Others Male
            { s: { r: 2, c: 33 }, e: { r: 2, c: 34 } }, // Others Female
            { s: { r: 2, c: 35 }, e: { r: 2, c: 36 } }, // Others Total
        ];

        worksheet["!merges"] = merges;

        worksheet["A1"].s = {
            font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0163d6" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "F2F2F2" } }
        };

        const range = XLSX.utils.decode_range(worksheet['!ref']);

        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[address]) continue;

                if (R >= 1 && R <= 3) { // headers
                    worksheet[address].s = {
                        fill: { fgColor: { rgb: "0163d6" } },
                        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: { bottom: { style: "thin", color: { rgb: "000000" } } }
                    };
                } else { // data
                    worksheet[address].s = {
                        font: { sz: 10, color: { rgb: "334155" } },
                        alignment: {
                            horizontal: C === 0 ? 'left' : 'center',
                            vertical: "center",
                            wrapText: true
                        },
                        border: {
                            bottom: { style: "thin", color: { rgb: "EDF2F7" } }
                        }
                    };
                    if (R % 2 === 0) {
                        worksheet[address].s.fill = { fgColor: { rgb: "F8FAFC" } };
                    }
                }
            }
        }

        worksheet['!cols'] = Array(37).fill({ wch: 15 });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(finalData, `${fileName}.xlsx`);
    };

    const exportToPDF = async (reportData, fileName = "Gender_Budgeting_Report") => {
        const headers = [
            [
                { content: "LAB NAME", rowSpan: 3 },
                { content: "CEP", colSpan: 6 },
                { content: "Special / Targeted", colSpan: 6 },
                { content: "Higher Degree (ME/M.Tech/Ph.D)", colSpan: 6 },
                { content: "Sponsored for Seminar/Conference", colSpan: 6 },
                { content: "Foreign Training", colSpan: 6 },
                { content: "Others", colSpan: 6 }
            ],
            [
                { content: "Male", colSpan: 2 },
                { content: "Female", colSpan: 2 },
                { content: "Total", colSpan: 2 },
                { content: "Male", colSpan: 2 },
                { content: "Female", colSpan: 2 },
                { content: "Total", colSpan: 2 },
                { content: "Male", colSpan: 2 },
                { content: "Female", colSpan: 2 },
                { content: "Total", colSpan: 2 },
                { content: "Male", colSpan: 2 },
                { content: "Female", colSpan: 2 },
                { content: "Total", colSpan: 2 },
                { content: "Male", colSpan: 2 },
                { content: "Female", colSpan: 2 },
                { content: "Total", colSpan: 2 },
                { content: "Male", colSpan: 2 },
                { content: "Female", colSpan: 2 },
                { content: "Total", colSpan: 2 }
            ],
            [
                "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget",
                "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget",
                "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget",
                "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget",
                "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget",
                "No.", "Exp (Rs)", "No.", "Exp (Rs)", "% of Total employees", "% of Total annual trg Budget"
            ]
        ];

        const dataRows = reportData.map(data => [
            data.labName, data.cepMaleNo, data.cepMaleExp, data.cepFemaleNo, data.cepFemaleExp, data.cepTotalNo, data.cepTotalExp,
            data.specialMaleNo, data.specialMaleExp, data.specialFemaleNo, data.specialFemaleExp, data.specialTotalNo, data.specialTotalExp,
            data.higherDegreeMaleNo, data.higherDegreeMaleExp, data.higherDegreeFemaleNo, data.higherDegreeFemaleExp, data.higherDegreeTotalNo, data.higherDegreeTotalExp,
            data.seminarMaleNo, data.seminarMaleExp, data.seminarFemaleNo, data.seminarFemaleExp, data.seminarTotalNo, data.seminarTotalExp,
            data.foreignMaleNo, data.foreignMaleExp, data.foreignFemaleNo, data.foreignFemaleExp, data.foreignTotalNo, data.foreignTotalExp,
            data.othersMaleNo, data.othersMaleExp, data.othersFemaleNo, data.othersFemaleExp, data.othersTotalNo, data.othersTotalExp
        ]);

        const colCount = 37;

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

        const fontSize = colCount > 18 ? 6 : colCount > 12 ? 7 : colCount > 8 ? 8 : 9;
        const headFontSize = colCount > 18 ? 6 : colCount > 12 ? 7 : colCount > 8 ? 8 : 10;
        const cellPadding = colCount > 12 ? 4 : 6;

        const titleText = fileName.replace(/_/g, ' ');
        doc.setFontSize(18);
        doc.setTextColor("#0163d6");
        doc.setFont("Arial", "bold");

        const titleLines = doc.splitTextToSize(titleText, usableWidth);
        doc.text(titleLines, margin, margin + 16);

        const titleLineHeight = 22;
        const titleBottom = margin + 16 + titleLines.length * titleLineHeight;
        const tableStartY = titleBottom + 2;

        const head = headers;
        const body = dataRows;

        const columnStyles = {};
        for (let i = 0; i < colCount; i++) {
            columnStyles[i] = { halign: i === 0 ? 'left' : 'center' };
        }

        autoTable(doc, {
            head,
            body,
            startY: tableStartY,
            margin: { left: margin, right: margin, bottom: margin + 20 },
            tableWidth: usableWidth,
            columnStyles,
            styles: {
                fontSize,
                cellPadding,
                textColor: "#334155",
                lineColor: "#e2e8f0",
                lineWidth: 0.5,
                overflow: "linebreak",
                minCellWidth: 30,
            },
            headStyles: {
                fillColor: "#0163d6",
                textColor: "#ffffff",
                fontStyle: "bold",
                fontSize: headFontSize,
                halign: "center",
                minCellWidth: 30,
            },
            alternateRowStyles: {
                fillColor: "#f8fafc",
            },
            didParseCell: (hookData) => {
                delete hookData.column.width;
            },
            didDrawPage: ({ pageNumber }) => {
                const pageCount = doc.internal.getNumberOfPages();
                const footerY = pageHeight - margin + 10;
                const timestamp = `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

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
            title: titleText,
            author: "HRMS",
        });

        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    const handleExport = (format) => {
        if (format === 'pdf') {
            exportToPDF(reportData, 'Gender_Budgeting_Report');
        } else if (format === 'excel') {
            exportToExcel(reportData, 'Gender_Budgeting_Report');
        }
    }

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

                            {/* ================= MAIN CATEGORY HEADER ================= */}
                            <tr className="table-light">
                                <th rowSpan="3">LAB NAME</th>

                                <th colSpan="6">CEP</th>
                                <th colSpan="6">Special / Targeted</th>
                                <th colSpan="6">Higher Degree (ME/M.Tech/Ph.D)</th>
                                <th colSpan="6">Sponsored for Seminar/Conference</th>
                                <th colSpan="6">Foreign Training</th>
                                <th colSpan="6">Others</th>
                            </tr>

                            {/* ================= MALE / FEMALE ================= */}
                            <tr className="table-secondary">
                                {[...Array(6)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th colSpan="2">Male</th>
                                        <th colSpan="2">Female</th>
                                        <th colSpan="2">Total</th>
                                    </React.Fragment>
                                ))}
                            </tr>

                            {/* ================= SUB HEADERS ================= */}
                            <tr>
                                {[...Array(6)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th>No.</th>
                                        <th>Exp (Rs)</th>
                                        <th>No.</th>
                                        <th>Exp (Rs)</th>
                                        <th>% of Total employees</th>
                                        <th>% of Total annual trg Budget</th>
                                    </React.Fragment>
                                ))}
                            </tr>

                        </thead>

                        {/* ================= BODY ================= */}
                        <tbody>
                            {reportData.map((data, index) => (
                                <tr key={index}>
                                    <td className="text-start fw-bold text-uppercase">{data.labName}</td>
                                   <td>{data.cepMaleNo}</td>
                                    <td>{data.cepMaleExp}</td>
                                    <td>{data.cepFemaleNo}</td>
                                    <td>{data.cepFemaleExp}</td>
                                    <td>{data.cepTotalNo}</td>
                                    <td>{data.cepTotalExp}</td>
                                    <td>{data.specialMaleNo}</td>
                                    <td>{data.specialMaleExp}</td>
                                    <td>{data.specialFemaleNo}</td>
                                    <td>{data.specialFemaleExp}</td>
                                    <td>{data.specialTotalNo}</td>
                                    <td>{data.specialTotalExp}</td>
                                    <td>{data.higherDegreeMaleNo}</td>
                                    <td>{data.higherDegreeMaleExp}</td>
                                    <td>{data.higherDegreeFemaleNo}</td>
                                    <td>{data.higherDegreeFemaleExp}</td>
                                    <td>{data.higherDegreeTotalNo}</td>
                                    <td>{data.higherDegreeTotalExp}</td>
                                    <td>{data.seminarMaleNo}</td>
                                    <td>{data.seminarMaleExp}</td>
                                    <td>{data.seminarFemaleNo}</td>
                                    <td>{data.seminarFemaleExp}</td>
                                    <td>{data.seminarTotalNo}</td>
                                    <td>{data.seminarTotalExp}</td>
                                    <td>{data.foreignMaleNo}</td>
                                    <td>{data.foreignMaleExp}</td>
                                    <td>{data.foreignFemaleNo}</td>
                                    <td>{data.foreignFemaleExp}</td>
                                    <td>{data.foreignTotalNo}</td>
                                    <td>{data.foreignTotalExp}</td>
                                    <td>{data.othersMaleNo}</td>
                                    <td>{data.othersMaleExp}</td>
                                    <td>{data.othersFemaleNo}</td>
                                    <td>{data.othersFemaleExp}</td>
                                    <td>{data.othersTotalNo}</td>
                                    <td>{data.othersTotalExp}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default GenderBudgetingViewer;