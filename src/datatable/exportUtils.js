import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const mapAlignment = (align) => {
  if (align === 'text-center') return 'center';
  if (align === 'text-right') return 'right';
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
              vertical: "center" 
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

  exportToPDF: (data, columns, fileName = "Export") => {

    const tableHeader = columns.map((col) => ({
        text: col.name,
        style: "tableHeader",
        alignment: 'center'
    }));

    const tableBody = [];
    data.forEach((row) => {
        const rowCells = Object.values(row).map((val, i) => ({
        text: val?.toString() || '',
        style: 'tableCell',
        alignment: mapAlignment(columns[i]?.align)
        }));
        
        tableBody.push(rowCells);
    });

    const docDefinition = {
      pageOrientation: "landscape",
      pageSize:  columns.length <=10 ? "A4" : "A3",
      pageMargins: [40, 60, 40, 60],

      // PREMIUM FOOTER (From your project design)
      footer: function (currentPage, pageCount) {
        return {
          margin: [40, 10, 40, 0],
          stack: [
            {
              canvas: [
                {
                  type: "line",
                  x1: 0, y1: 0,
                  x2: 760, y2: 0, // Adjusted for landscape A4
                  lineWidth: 1,
                  lineColor: "#e2e8f0",
                },
              ],
            },
            {
              columns: [
                { 
                  text: `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 
                  alignment: "left", 
                  fontSize: 8, 
                  color: "#808791", 
                  margin: [0, 5, 0, 0] 
                },
                { 
                  text: `Page ${currentPage} of ${pageCount}`, 
                  alignment: "right", 
                  fontSize: 8, 
                  color: "#808791", 
                  margin: [0, 5, 0, 0] 
                }
              ]
            }
          ]
        };
      },

      content: [
        { text: `${fileName.replace(/_/g, ' ')}`, style: "title" },
        {
          style: "tableStyle",
          table: {
            headerRows: 1,
            widths: columns.map((col) => col.width || "auto"),
            body: [tableHeader, ...tableBody],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? "#0163d6" : (rowIndex % 2 === 0 ? "#f8fafc" : null)),
            hLineColor: () => "#e2e8f0",
            vLineColor: () => "#e2e8f0",
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
        },
      ],

      styles: {
        title: { fontSize: 18, bold: true, color: "#0163d6", margin: [0, 0, 0, 5] },
        filterContent: { fontSize: 9, color: "#64748b", italics: true },
        tableHeader: { bold: true, fontSize: 10, color: "#ffffff" },
        tableCell: { fontSize: 9, color: "#334155" },
        tableStyle: { margin: [0, 5, 0, 5] },
      },
    };

    pdfMake.createPdf(docDefinition).open();
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