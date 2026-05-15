import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import styles from "./AllReportsTemplate.module.css";
import { Tooltip } from "react-tooltip";
import { FiMenu, FiSearch, FiFileText, FiChevronLeft } from "react-icons/fi";
import DynamicReportViewer from "./DynamicReportViewer";
import DatePicker from "react-datepicker";


const REPORTS_LIST = [
    { id: "1", name: "Nominal Roll" },
    { id: "2", name: "Training Report (Course)" },
    { id: "3", name: "Training Report(s) (Seminar/Symposium/Conference/Workshop)" },
    { id: "4", name: "In-House CEP" },
    { id: "5", name: "Details of Sponsorship to Higher Degree M.Tech" },
    { id: "6", name: "Details of Sponsorship to Higher Degree Ph.D" },
    { id: "7", name: "HR Distribution Project Wise Tech/Non Tech Deployment of DRDS & DRTC" },
    { id: "8", name: "Annual Training Report" },
    { id: "9", name: "Detailed of Research Paper in International Journals" },
    { id: "10", name: "Detailed of Research Paper in Seminar/Symposium/Conference/Workshop" },
    { id: "11", name: "Budget Expenditure" },
    { id: "12", name: "Gender Budgeting" },
    { id: "13", name: "Training of SC/ST Employees" },
    { id: "14", name: "Mandatory Training Report" },
];

const today = new Date();

const getFinancialYearDates = () => {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = Jan

    // If month is Jan/Feb/Mar → FY started previous year
    const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;

    return {
        from: new Date(fyStartYear, 3, 1), // 1 Apr
        to: new Date(fyStartYear + 1, 2, 31), // 31 Mar
    };
};

const fyDates = getFinancialYearDates();

const AllReportsTemplate = () => {

    const [activeReport, setActiveReport] = useState(REPORTS_LIST[0].id);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState(fyDates.from);
    const [toDate, setToDate] = useState(fyDates.to);

    // Filter logic for the search bar
    const filteredReports = REPORTS_LIST.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const defaultDates = getFinancialYearDates();

        setFromDate(defaultDates.from);
        setToDate(defaultDates.to);
    }, [activeReport]);

    return (
        <>
            <Navbar />

            <div className={styles.pageWrapper}>
                <div className={styles.mainLayout}>
                    {/* Sidebar */}
                    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
                        <div className={styles.sidebarHeader}>
                            {!isCollapsed && (
                                <div className={styles.searchWrapper}>
                                    <FiSearch className={styles.searchIcon} />
                                    <input type="text" placeholder="Search reports..." className={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            )}
                            <button className={styles.toggleBtn}
                                onClick={() => setIsCollapsed(!isCollapsed)} data-tooltip-id="Tooltip" data-tooltip-place="right" data-tooltip-content={isCollapsed ? "Expand" : "Collapse"}
                            >
                                {isCollapsed ? <FiMenu /> : <FiChevronLeft />}
                            </button>
                        </div>

                        <ul className={styles.reportList}>
                            {filteredReports.map((report) => (
                                <li
                                    key={report.id}
                                    className={`${styles.reportItem} ${activeReport === report.id ? styles.active : ""}`}
                                    onClick={() => setActiveReport(report.id)}
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content={report.name}
                                >
                                    <span className={styles.icon}><FiFileText /></span>
                                    {!isCollapsed && <span className={styles.label}>{report.name}</span>}
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Content Area */}
                    <main className={styles.content}>
                        <div className="container-fluid">
                            <header className={styles.contentHeader}>
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                                    {/* Left Side Title */}
                                    <h3 className="mb-0">
                                        {REPORTS_LIST.find((r) => r.id === activeReport)?.name}
                                    </h3>

                                    {/* Right Side Date Pickers */}
                                    {["2","3","4","5","6","7","8","10","11","14"].includes(activeReport) && (
                                        <div className="d-flex align-items-center gap-2">

                                            <DatePicker
                                                id="fromDate"
                                                name="fromDate"
                                                selected={fromDate}
                                                onChange={(date) => setFromDate(date)}
                                                className="form-control"
                                                placeholderText="From Date"
                                                dateFormat="dd-MM-yyyy"
                                                showYearDropdown
                                                showMonthDropdown
                                                dropdownMode="select"
                                                onKeyDown={(event) => event.preventDefault()}
                                            />

                                            <DatePicker
                                                id="toDate"
                                                name="toDate"
                                                selected={toDate}
                                                onChange={(date) => setToDate(date)}
                                                className="form-control"
                                                placeholderText="To Date"
                                                dateFormat="dd-MM-yyyy"
                                                showYearDropdown
                                                showMonthDropdown
                                                dropdownMode="select"
                                                minDate={fromDate}
                                                onKeyDown={(event) => event.preventDefault()}
                                            />
                                        </div>
                                    )}
                                </div>
                            </header>

                            {/* Only one component call, completely dynamic! */}
                            <div className={styles.tableWrapper}>
                                <DynamicReportViewer reportId={activeReport} fromDate={fromDate} toDate={toDate} />
                            </div>

                        </div>
                    </main>
                </div>
            </div>
            <Tooltip id="Tooltip" className="text-white tooltipName" />
        </>
    );
}

export default AllReportsTemplate;