import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Datatable.css'; // Import custom CSS

const Datatable = ({ columns, data, innerColumns }) => {
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemsPerPage, setItemsPerPage] = useState(8);


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
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);


  const filteredData = useMemo(() => {
    return sortedData.filter(item =>
      columns.some(column => {
        const value = column.selector(item);
        return value ? value.toString().toLowerCase().includes(filterText.toLowerCase()) : false;
      })
    );
  }, [filterText, sortedData, columns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when changing the number of items per page
  };

  useEffect(() => {
    // Reset to first page when filterText changes
    setCurrentPage(1);
  }, [filterText]);


  const renderPagination = () => {
    const pages = [];
    const pageRangeDisplayed = 2; // Number of pages to show before and after the current page
    const visiblePages = 5; // Number of pages to always show at start and end

    const addPageButton = (pageNumber) => {
      pages.push(
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          className={`btn btn-sm ${currentPage === pageNumber ? 'btn-active-page-no' : 'btn-outline-secondary'} mx-1`}
        >
          {pageNumber}
        </button>
      );
    };

    // Add the first page
    if (totalPages > 0) {
      addPageButton(1);
    }

    // Add ellipsis after first page if necessary
    if (currentPage > visiblePages) {
      pages.push(<span key="start-ellipsis" className="mx-1">...</span>);
    }

    // Add pages around the current page
    for (let i = Math.max(currentPage - pageRangeDisplayed, 2); i <= Math.min(currentPage + pageRangeDisplayed, totalPages - 1); i++) {
      addPageButton(i);
    }

    // Add ellipsis before last page if necessary
    if (currentPage < totalPages - visiblePages + 1) {
      pages.push(<span key="end-ellipsis" className="mx-1">...</span>);
    }

    // Add the last page
    if (totalPages > 1) {
      addPageButton(totalPages);
    }

    // Start and end entries information
    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, filteredData.length);
    const entriesInfo = `Showing ${startEntry} to ${endEntry} of ${filteredData.length} entries`;

    // Return the pagination UI


    return (
      <div className="d-flex justify-content-between align-items-center my-3">
        <div className='cs-entries'>&nbsp;{entriesInfo}</div>
        <div className="pagination-buttons">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            className="btn btn-sm btn-outline-secondary mx-1"
          >
            Prev
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            className="btn btn-sm btn-outline-secondary mx-1"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="datatable-container">
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <label htmlFor="entries-per-page" className="me-2">Show:</label>
          <select
            id="entries-per-page"
            className="form-select"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>

        <div className="d-flex">
          <input
            type="text"
            placeholder="Search"
            className="form-control search-bar"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
      </div>



      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.name}
                onClick={() => handleSort(column.selector)}
                className={`sortable-column ${sortConfig.key === column.selector ? sortConfig.direction : ''}`}
              >
                {column.name}
                {sortConfig.key === column.selector && (
                  <span className={`sort-icon ${sortConfig.direction}`}></span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr
                  key={rowIndex}
                  className={`main-row ${row.bgColor ? 'custom-bg' : rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}`}
                  data-bgcolor={row.bgColor || ''}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`table-cell ${column.align || ''} ${column.bgColor ? 'custom-column-bg' : ''}`}
                      // data-width={column.width || ''}
                      data-bgcolor={typeof column.bgColor === 'function' ? column.bgColor(row) : column.bgColor || ''}
                      style={{ width: column.width}}
                    >
                      {column.selector(row)}
                    </td>
                  ))}
                </tr>

                {/* Inner Table Section */}
                {row.nestedData && (
                  <tr className="nested-row">
                    <td colSpan={columns.length}>
                      <div className="inner-table-container">
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr className="inner-sub-table-header">
                              {innerColumns.map((innerColumn, colIndex) => (
                                <th
                                  key={colIndex}
                                  className={`inner-sub-table-th ${innerColumn.align || ''}`}
                                  data-width={innerColumn.width || ''}
                                >
                                  {innerColumn.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {row.nestedData.map((nestedRow, nestedIndex) => (
                              <tr key={nestedIndex} className="inner-data-row">
                                {innerColumns.map((innerColumn, colIndex) => {
                                  const bgColor =
                                    typeof innerColumn.bgColor === 'function'
                                      ? innerColumn.bgColor(nestedRow)
                                      : innerColumn.bgColor || '';

                                  if (innerColumn.rowSpan && nestedRow.rowSpan > 0) {
                                    return (
                                      <td
                                        key={colIndex}
                                        rowSpan={nestedRow.rowSpan}
                                        className={`inner-td ${innerColumn.align || ''}`}
                                        data-bgcolor={bgColor}
                                      >
                                        {innerColumn.selector(nestedRow)}
                                      </td>
                                    );
                                  }

                                  return (
                                    <td
                                      key={colIndex}
                                      className={`inner-td ${innerColumn.align || ''}`}
                                      data-bgcolor={bgColor}
                                    >
                                      {innerColumn.selector(nestedRow)}
                                    </td>
                                  );
                                })}
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
              <td colSpan={columns.length} className="text-center">
                There are no records to display
              </td>
            </tr>
          )}
        </tbody>

      </table>
      {renderPagination()}
    </div>
  );
};

export default Datatable;
