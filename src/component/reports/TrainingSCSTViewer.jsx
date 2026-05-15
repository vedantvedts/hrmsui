import React from "react";
import styles from '../../datatable/SmartDatatable.module.css';
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import tabstyles from '../../datatable/SmartDatatable.module.css';
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pdfFonts from "../../assets/fonts/vfs_fonts";


const TrainingSCSTViewer = ({ reportData = [] }) => {

    const exportToExcel = (reportData, fileName = "Training_SCST_Report") => {
        const headers = [
            [
                "LAB NAME",
                "CEP", null, null,
                "Special / Targeted", null, null,
                "Higher Degree (ME/M.Tech/Ph.D)", null, null,
                "Sponsored for Seminar/Conference", null, null,
                "Foreign Training", null, null,
                "Others (Specify)", null, null
            ],
            [
                null,
                "No. of SC/ST employees trained", "Exp. on trg. of SC/ST employees", "% vis-à-vis General category",
                "No. of SC/ST employees trained", "Exp. on trg. of SC/ST employees", "% vis-à-vis General category",
                "No. of SC/ST employees trained", "Exp. on trg. of SC/ST employees", "% vis-à-vis General category",
                "No. of SC/ST employees trained", "Exp. on trg. of SC/ST employees", "% vis-à-vis General category",
                "No. of SC/ST employees trained", "Exp. on trg. of SC/ST employees", "% vis-à-vis General category",
                "No. of SC/ST employees trained", "Exp. on trg. of SC/ST employees", "% vis-à-vis General category"
            ]
        ];

        const dataRows = reportData.map(data => [
            data.labName,
            data.labName,
            data.cepScstTrained,
            data.cepExpenditure,
            data.cepPercentage,
            data.specialTargetedScstTrained,
            data.specialTargetedExpenditure,
            data.specialTargetedPercentage,
            data.higherDegreeScstTrained,
            data.higherDegreeExpenditure,
            data.higherDegreePercentage,
            data.sponsoredSeminarScstTrained,
            data.sponsoredSeminarExpenditure,
            data.sponsoredSeminarPercentage,
            data.foreignTrainingScstTrained,
            data.foreignTrainingExpenditure,
            data.foreignTrainingPercentage,
            data.othersScstTrained,
            data.othersExpenditure,
            data.othersPercentage
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([[fileName.replace(/_/g, ' ')]].concat(headers).concat(dataRows));
        worksheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 18 } },
            { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
            { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } },
            { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } },
            { s: { r: 1, c: 7 }, e: { r: 1, c: 9 } },
            { s: { r: 1, c: 10 }, e: { r: 1, c: 12 } },
            { s: { r: 1, c: 13 }, e: { r: 1, c: 15 } },
            { s: { r: 1, c: 16 }, e: { r: 1, c: 18 } }
        ];

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

                if (R === 1 || R === 2) {
                    worksheet[address].s = {
                        fill: { fgColor: { rgb: "0163d6" } },
                        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 11 },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: "000000" }
                        }
                    };
                } else if (R > 2) {
                    worksheet[address].s = {
                        font: { sz: 10, color: { rgb: "334155" } },
                        alignment: {
                            horizontal: C === 0 ? 'left' : 'center',
                            vertical: "center",
                            wrapText: true
                        },
                        border: {
                            top: { style: "thin", color: { rgb: "E2E8F0" } },
                            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                            left: { style: "thin", color: { rgb: "E2E8F0" } },
                            right: { style: "thin", color: { rgb: "E2E8F0" } }
                        }
                    };
                    if (R % 2 === 0) {
                        worksheet[address].s.fill = { fgColor: { rgb: "F8FAFC" } };
                    }
                }
            }
        }

        worksheet['!cols'] = [
            { wch: 25 },
            { wch: 22 }, { wch: 20 }, { wch: 24 },
            { wch: 22 }, { wch: 20 }, { wch: 24 },
            { wch: 22 }, { wch: 20 }, { wch: 24 },
            { wch: 22 }, { wch: 20 }, { wch: 24 },
            { wch: 22 }, { wch: 20 }, { wch: 24 },
            { wch: 22 }, { wch: 20 }, { wch: 24 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(finalData, `${fileName}.xlsx`);
    };

    const exportToPDF = async (reportData, fileName = "Training_SCST_Report") => {
        const head = [
            [
                { content: "LAB NAME", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: "CEP", colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                { content: "Special / Targeted", colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                { content: "Higher Degree (ME/M.Tech/Ph.D)", colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                { content: "Sponsored for Seminar/Conference", colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                { content: "Foreign Training", colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                { content: "Others (Specify)", colSpan: 3, styles: { halign: 'center', valign: 'middle' } }
            ],
            [
                "No. of SC/ST employees trained",
                "Exp. on trg. of SC/ST employees",
                "% vis-à-vis General category",
                "No. of SC/ST employees trained",
                "Exp. on trg. of SC/ST employees",
                "% vis-à-vis General category",
                "No. of SC/ST employees trained",
                "Exp. on trg. of SC/ST employees",
                "% vis-à-vis General category",
                "No. of SC/ST employees trained",
                "Exp. on trg. of SC/ST employees",
                "% vis-à-vis General category",
                "No. of SC/ST employees trained",
                "Exp. on trg. of SC/ST employees",
                "% vis-à-vis General category",
                "No. of SC/ST employees trained",
                "Exp. on trg. of SC/ST employees",
                "% vis-à-vis General category"
            ]
        ];

        const body = reportData.map(data => [
            data.labName,
            data.cepScstTrained,
            data.cepExpenditure,
            data.cepPercentage,
            data.specialTargetedScstTrained,
            data.specialTargetedExpenditure,
            data.specialTargetedPercentage,
            data.higherDegreeScstTrained,
            data.higherDegreeExpenditure,
            data.higherDegreePercentage,
            data.sponsoredSeminarScstTrained,
            data.sponsoredSeminarExpenditure,
            data.sponsoredSeminarPercentage,
            data.foreignTrainingScstTrained,
            data.foreignTrainingExpenditure,
            data.foreignTrainingPercentage,
            data.othersScstTrained,
            data.othersExpenditure,
            data.othersPercentage
        ]);

        const doc = new jsPDF({ orientation: "landscape", format: "a3", unit: "pt" });
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
        const fontSize = 8;
        const headFontSize = 10;
        const titleText = fileName.replace(/_/g, ' ');

        doc.setFontSize(18);
        doc.setTextColor("#0163d6");
        doc.setFont("Arial", "bold");
        const titleLines = doc.splitTextToSize(titleText, usableWidth);
        doc.text(titleLines, margin, margin + 16);

        autoTable(doc, {
            head,
            body,
            startY: margin + 40,
            margin: { left: margin, right: margin, bottom: margin + 20 },
            tableWidth: usableWidth,
            styles: {
                fontSize,
                cellPadding: 6,
                textColor: "#334155",
                lineColor: "#e2e8f0",
                lineWidth: 0.5,
                overflow: "linebreak",
                halign: 'center',
                valign: 'middle'
            },
            headStyles: {
                fillColor: "#0163d6",
                textColor: "#ffffff",
                fontStyle: "bold",
                fontSize: headFontSize,
                halign: "center",
                valign: "middle"
            },
            alternateRowStyles: {
                fillColor: "#f8fafc"
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
                doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - margin, footerY + 4, { align: "right" });
            }
        });

        doc.setProperties({ title: titleText, author: "HRMS" });
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    const handleExport = (format) => {
        if (format === 'pdf') {
            exportToPDF(reportData);
        } else if (format === 'excel') {
            exportToExcel(reportData);
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

                                <th colSpan="3">CEP</th>
                                <th colSpan="3">Special / Targeted</th>
                                <th colSpan="3">Higher Degree (ME/M.Tech/Ph.D)</th>
                                <th colSpan="3">Sponsored for Seminar/Conference</th>
                                <th colSpan="3">Foreign Training</th>
                                <th colSpan="3">Others (Specify)</th>
                            </tr>

                            {/* ================= SUB HEADER ROW ================= */}
                            <tr className="table-secondary">
                                {[...Array(6)].map((_, index) => (
                                    <React.Fragment key={index}>
                                        <th>No. of SC/ST employees trained</th>
                                        <th>Exp. on trg. of SC/ST employees</th>
                                        <th>% vis-à-vis General category</th>
                                    </React.Fragment>
                                ))}
                            </tr>


                        </thead>

                        {/* ================= TABLE BODY ================= */}
                        <tbody>
                            {reportData.map((data, index) => (
                                <tr key={index}>
                                    <td className="text-start fw-bold text-uppercase">{data.labName}</td>
                                    <td>{data.cepScstTrained}</td>
                                    <td>{data.cepExpenditure}</td>
                                    <td>{data.cepPercentage}</td>
                                    <td>{data.specialTargetedScstTrained}</td>
                                    <td>{data.specialTargetedExpenditure}</td>
                                    <td>{data.specialTargetedPercentage}</td>
                                    <td>{data.higherDegreeScstTrained}</td>
                                    <td>{data.higherDegreeExpenditure}</td>
                                    <td>{data.higherDegreePercentage}</td>
                                    <td>{data.sponsoredSeminarScstTrained}</td>
                                    <td>{data.sponsoredSeminarExpenditure}</td>
                                    <td>{data.sponsoredSeminarPercentage}</td>
                                    <td>{data.foreignTrainingScstTrained}</td>
                                    <td>{data.foreignTrainingExpenditure}</td>
                                    <td>{data.foreignTrainingPercentage}</td>
                                    <td>{data.othersScstTrained}</td>
                                    <td>{data.othersExpenditure}</td>
                                    <td>{data.othersPercentage}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default TrainingSCSTViewer;