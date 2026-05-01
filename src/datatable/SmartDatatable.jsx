import React, { useState, useMemo, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './SmartDatatable.module.css';
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";

import { ExportUtils } from './exportUtils';


const SmartDatatable = ({ reportId, columns, data, innerColumns, highlightedRowId = null, footer = null, fileName = "Exported_Data" }) => {


  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef(null);

  // NEW STATE: Manage visibility of columns
  const [visibleColumnNames, setVisibleColumnNames] = useState(
    columns.map(col => col.name)
  );

  // Toggle function for columns
  const toggleColumn = (columnName) => {
    setVisibleColumnNames(prev =>
      prev.includes(columnName)
        ? prev.filter(name => name !== columnName)
        : [...prev, columnName]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) {
        setIsColumnDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter columns based on visibility state
  const visibleColumns = useMemo(() => {
    return columns.filter(col => visibleColumnNames.includes(col.name));
  }, [columns, visibleColumnNames]);

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aVal = sortConfig.key(a);
        const bVal = sortConfig.key(b);
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item =>
      visibleColumns.some(column => {
        const value = column.selector(item);
        return value ? value.toString().toLowerCase().includes(filterText.toLowerCase()) : false;
      })
    );
  }, [filterText, sortedData, visibleColumns]);

  // --- EXPORT FUNCTIONS ---

  const getExportData = () => {

    return filteredData.map(row => {
      const rowData = {};

      visibleColumns.forEach(col => {
        if (col.name === "Project") {
          rowData[col.name] =
            row.roleDtoList?.map(r => r.projectCode).join("\n");
        }
        else if (col.name === "Appointment") {
          rowData[col.name] =
            row.roleDtoList?.map(r => r.roleName).join("\n");
        }
        else {
          rowData[col.name] = col.selector(row);
        }
      });

      return rowData;
    });
  };

  const handleExport = (type) => {
    const exportData = getExportData();

    switch (type) {
      case 'excel':
        ExportUtils.exportToExcel(exportData, visibleColumns, fileName);
        break;
      case 'pdf':
        // Pass the activeFilters array here
        ExportUtils.exportToPDF(exportData, visibleColumns, fileName);
        break;
      // case 'csv':
      //   ExportUtils.exportToCSV(exportData, visibleColumns, fileName);
      //   break;
      default:
        break;
    }
  };


  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const renderPagination = () => {
    const pages = [];
    const pageRangeDisplayed = 2;
    const visiblePagesCount = 5;

    const addPageButton = (pageNumber) => {
      pages.push(
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          className={`btn btn-sm ${currentPage === pageNumber ? `${styles.btnActivePageNo}` : 'btn-outline-secondary'} mx-1`}
        >
          {pageNumber}
        </button>
      );
    };

    if (totalPages > 0) addPageButton(1);
    if (currentPage > visiblePagesCount) pages.push(<span key="start-ellipsis" className="mx-1">...</span>);

    for (let i = Math.max(currentPage - pageRangeDisplayed, 2); i <= Math.min(currentPage + pageRangeDisplayed, totalPages - 1); i++) {
      addPageButton(i);
    }

    if (currentPage < totalPages - visiblePagesCount + 1) pages.push(<span key="end-ellipsis" className="mx-1">...</span>);
    if (totalPages > 1) addPageButton(totalPages);

    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, filteredData.length);
    const entriesInfo = `Showing ${startEntry} to ${endEntry} of ${filteredData.length} entries`;

    return (
      <div className="d-flex justify-content-between align-items-center my-3">
        <div>&nbsp;{entriesInfo}</div>
        <div className="pagination-buttons">
          <button onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} className="btn btn-sm btn-outline-secondary mx-1">Prev</button>
          {pages}
          <button onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} className="btn btn-sm btn-outline-secondary mx-1">Next</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.datatableOuterWrapper}>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <div className={`d-flex align-items-center ${styles.gap2}`}>
          <label htmlFor="entries-per-page" className="me-1 mb-0">Show:</label>
          <select id="entries-per-page" className="form-select form-select-sm" value={itemsPerPage} onChange={handleItemsPerPageChange} style={{ width: 'auto' }}>
            {[8, 10, 20, 30, 40, 50, 100, 500].map(val => <option key={val} value={val}>{val}</option>)}
          </select>

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

        <div className={`d-flex ${styles.gap2}`}>
          {/* COLUMN VISIBILITY DROPDOWN */}
          <div className="dropdown" ref={columnDropdownRef}>
            <button
              className="btn btn-sm btn-outline-primary dropdown-toggle"
              type="button"
              id="columnToggle"
              aria-haspopup="true"
              aria-expanded={isColumnDropdownOpen}
              onClick={() => setIsColumnDropdownOpen(prev => !prev)}
            >
              Columns
            </button>
            <ul
              className={`dropdown-menu dropdown-menu-end p-2 ${styles.dropdownMenu} ${isColumnDropdownOpen ? 'show' : ''}`}
              aria-labelledby="columnToggle"
            >
              {columns.map(column => (
                <li key={column.name} className="dropdown-item-text">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`col-${column.name}`}
                      checked={visibleColumnNames.includes(column.name)}
                      onChange={() => toggleColumn(column.name)}
                    />
                    <label className="form-check-label w-100" htmlFor={`col-${column.name}`}>
                      {column.name}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <input type="text" placeholder="Search" className={`form-control form-control-sm ${styles.searchBar}`} value={filterText} onChange={e => setFilterText(e.target.value)} />
        </div>
      </div>

      <div className={styles.datatableContainer}>
        <table className={`${styles.table} table table-bordered table-hover`}>
          <thead>
            <tr>
              {visibleColumns.map(column => (
                <th
                  key={column.name}
                  onClick={() => handleSort(column.selector)}
                  className={`${styles.sortableColumn} ${sortConfig.key === column.selector ? styles[sortConfig.direction] : ''}`}
                  style={{ width: column.width }}
                >
                  {column.name}
                  {sortConfig.key === column.selector && <span className={`${styles.sortIcon} ${styles[sortConfig.direction]}`}></span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr
                    className={row.rowId === highlightedRowId ? styles.highlightRow : ""}
                    style={{ backgroundColor: row.rowId === highlightedRowId ? "" : row.bgColor || (rowIndex % 2 === 0 ? "#ffffff" : "#f2f2f2") }}
                  >
                    {visibleColumns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={column.align || ''}
                        style={{
                          width: column.width,
                          backgroundColor: typeof column.bgColor === 'function' ? column.bgColor(row) : column.bgColor || 'inherit',
                        }}
                      >
                        {column.selector(row)}
                      </td>
                    ))}
                  </tr>
                  {row.nestedData && (
                    <tr>
                      <td colSpan={visibleColumns.length}>
                        <div className={styles.innerTableWidth}>
                          <table className={`${styles.table} table table-bordered table-hover`}>
                            <thead>
                              <tr>
                                {innerColumns.map((innerColumn, idx) => (
                                  <th key={idx} className={styles.innerSubTableTh} style={{ width: innerColumn.width }}>{innerColumn.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {row.nestedData.map((nestedRow, nIdx) => (
                                <tr key={nIdx} className={styles.dataTableBorderedRow}>
                                  {innerColumns.map((innerColumn, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={innerColumn.align || ''}
                                      rowSpan={innerColumn.rowSpan && nestedRow.rowSpan > 0 ? nestedRow.rowSpan : undefined}
                                      style={{
                                        backgroundColor: innerColumn.bgColor || 'inherit',
                                        display: (innerColumn.rowSpan && (!nestedRow.rowSpan || nestedRow.rowSpan <= 0)) ? 'none' : 'table-cell'
                                      }}
                                    >
                                      {innerColumn.selector(nestedRow)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length} className="text-center">There are no records to display</td>
              </tr>
            )}
          </tbody>
          {/* Updated Footer Logic */}
          {footer && filteredData.length > 0 && (
            <tfoot className={styles.tableFooter}>
              {typeof footer === 'function' ? footer(filteredData, visibleColumns) : footer}
            </tfoot>
          )}
        </table>
      </div>
      {filteredData.length > 0 && renderPagination()}
    </div>
  );
};

export default SmartDatatable;