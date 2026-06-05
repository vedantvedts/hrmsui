import { useState, useEffect } from "react";
import { BiSolidExit } from "react-icons/bi";
import { FaEnvelopeOpenText, FaEye, FaHome, FaHSquare, FaProjectDiagram, FaRupeeSign, FaTimes, FaUserClock, FaUsersCog, FaUserTie } from "react-icons/fa";
import { FaAddressCard, FaBell, FaCaretDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import { getHeaderModuleDetailList, getHeaderModuleList, getNotifiCount, getNotifiList, updateNotification } from "../../service/admin.service";
import * as FaIcons from "react-icons/fa6";
import { checkUserProjectAccess, getReactAppUrls } from "../../service/master.service";
import Swal from "sweetalert2";
import { BsFileEarmarkText, BsFillBoxSeamFill } from "react-icons/bs";
import { MdOutlineFactCheck } from "react-icons/md";
import { IoAppsSharp } from "react-icons/io5";
import { Tooltip } from "bootstrap";
import { LuLayoutGrid } from "react-icons/lu";
import config from "../../environment/config"
import { logout } from "../../service/auth.service";

const Navbar = () => {

    const navigate = useNavigate();
    const [headerModuleList, setHeaderModuleList] = useState([]);
    const [headerModuleDetailList, setHeaderModuleDetailList] = useState([]);
    const [notifiCount, setNotifiCount] = useState(0);
    const [notifiList, setNotifiList] = useState([]);
    const title = localStorage.getItem("title");
    const salutation = localStorage.getItem("salutation");
    const empName = localStorage.getItem("empName");
    const designationCode = localStorage.getItem("designationCode");
    const roleId = localStorage.getItem("roleId");
    const [appUrls, setAppUrls] = useState({});
    const [isLauncherOpen, setIsLauncherOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const handleShowAll = () => {
        setShowAll(true);
    };

    const handleClose = () => {
        setShowAll(false);
    };


    const LABCODE = config.LABCODE;

    useEffect(() => {
        if (roleId) {
            fetchHeaderModuleList(roleId);
            fetchHeaderModuleDetailList(roleId);
        }
    }, [roleId]);


    const handleLogout = async (e) => {
        e.preventDefault();
        await logout("L");
        localStorage.clear();
        navigate("/login");
    };


    const fetchHeaderModuleList = async (roleId) => {
        try {
            const moduleListResponse = await getHeaderModuleList(roleId);

            setHeaderModuleList(moduleListResponse);
        } catch (error) {
            console.error('Error fetching Header Module list:', error);
        }
    };

    const fetchHeaderModuleDetailList = async (roleId) => {
        try {
            const moduleDetailListResponse = await getHeaderModuleDetailList(roleId);
            setHeaderModuleDetailList(moduleDetailListResponse);
            const notifiCount = await getNotifiCount();
            const notifiList = await getNotifiList();
            setNotifiCount(notifiCount);
            setNotifiList(notifiList);

        } catch (error) {
            console.error('Error fetching Header Module Detail list:', error);
        }
    };

    const gotoNoti = async (event, item) => {
        event.preventDefault();
        try {
            const response = await updateNotification(item.notificationId);
            if (response === 200) {
                const notifiList = await getNotifiList();
                const notifiCount = await getNotifiCount();
                setNotifiCount(notifiCount);
                setNotifiList(notifiList);
                const url = item.notificationUrl;
                navigate(`/${url}`);
            }
        } catch (error) {
            console.error("Error updating notification:", error);
        }
    };

    const formatName = () => {
        const cleanTitle = (salutation && salutation !== "null") ? salutation : (title && title !== "null") ? title : "";
        const cleanName = (empName && empName !== "null") ? empName : "";
        const cleanDesignation = (designationCode && designationCode !== "null") ? `, ${designationCode}` : "";

        return `${cleanTitle} ${cleanName}`.trim() + cleanDesignation;
    };


    useEffect(() => {
        fetchAppUrls();
    }, []);

    const fetchAppUrls = async () => {
        try {
            const urls = await getReactAppUrls();
            const urlMap = {};
            urls.forEach(app => {
                if (app.isActive === 1) {
                    urlMap[app.appCode] = app.appUrl;
                }
            });
            setAppUrls(urlMap);
        } catch (error) {
            console.error("Failed to fetch app URLs:", error);
        }
    };

    const roleName = localStorage.getItem("roleName");

    const user = JSON.parse(localStorage.getItem("user"));
    const encryptedUser = btoa(user.username);

    const apps = [
        { code: 'PMS', name: "Project Management System", type: 'jsp', icon: <FaProjectDiagram />, color: '#2196f3' },
        { code: 'DMS', name: "Dak Management System", launchpath: 'dashboard', icon: <FaEnvelopeOpenText />, action: 'open', color: '#0d6efd' },
        { code: 'IBAS', name: "Integrated Budget Accounting System", launchpath: 'dashboard', icon: <FaRupeeSign />, action: 'open', color: '#4caf50' },
        { code: 'SIS', name: "Stores Inventory System", type: 'jsp', icon: <BsFillBoxSeamFill />, color: '#17a2b8' },
        { code: 'AMS', name: "Audit Management System", launchpath: 'dashboard', icon: <MdOutlineFactCheck />, action: 'open', color: '#dc3545' },
        // { code: 'HRMS', name: "Human Resource Management System", launchpath: 'dashboard', icon: <FaUsersCog />, action: 'open', color: '#20c997' },
        { code: 'EMS', name: "Employee Management System", launchpath: 'dashboard', icon: <FaUserTie />, action: 'open', color: '#495057' },
        { code: 'TMDS', name: "Top Management Dashboard System", launchpath: roleName === "ROLE_ADMIN" ? 'maindashboard' : 'userdashboard', icon: <IoAppsSharp />, action: 'open', color: '#0d47a1' },
        { code: 'PFTS', name: "Procurement File Tracking System", launchpath: 'dashboard', icon: <BsFileEarmarkText />, action: 'open', color: '#fd7e14' },
    ].map(app => ({
        ...app,
        url: (app.type === 'jsp' ? (appUrls[app.code] + `/TMDS?api_key=VTS_${encryptedUser}`) : appUrls[app.code])
    }));

    const handleAppLaunch = async (app) => {
        setIsLauncherOpen(false);

        const hasAccess = await checkUserProjectAccess(app.code);
        if (!hasAccess) {
            Swal.fire({
                title: 'Access Denied',
                text: `You do not have access to ${app.code} application.`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Okay',
                footer: '<span>Contact System Admin if you need access.</span>',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
            return;
        }

        const targetUrl = app.url;

        if (app.action === 'open') {
            const userData = localStorage.getItem("user");
            if (!userData) return;

            const appWindow = window.open(`${targetUrl}/${app.launchpath}?${app.code.toLowerCase()}=true`, '_blank');

            let count = 0;
            const checkInterval = setInterval(() => {
                if (appWindow && count < 1) {
                    appWindow.postMessage(
                        { type: "LOGIN_SUCCESS", user: JSON.parse(userData) }, targetUrl);
                    count++;
                } else {
                    clearInterval(checkInterval);
                }
            }, 1000);
        } else if (targetUrl === '/under-development') {
            window.location.href = targetUrl;
        } else {
            window.open(app.url, '_blank', 'noopener,noreferrer');
        }
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close if the click is not on the launcher button or the dropdown
            if (isLauncherOpen && !event.target.closest(`.launcher-btn`) && !event.target.closest(`.app-launcher-dropdown`)) {
                setIsLauncherOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isLauncherOpen]);

    return (
        <nav className="navbar sticky-top navbar-expand-lg navbar-dark bg-dark-new nav-ams">
            <div className="row w-100">
                <div className="container d-flex">
                    <div className="col-md-4">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a href="/dashboard" className="nav-link p-0">
                                    <div
                                        className="d-flex align-items-center gap-3 px-2 py-1"
                                    >
                                        <h3 className="mb-0 d-flex align-items-center ms-1" style={{ fontWeight: 600 }}>
                                            <span className="neon-text">HRMS</span>
                                        </h3>

                                        <h6 className="mb-0 d-flex align-items-end login-name" style={{ fontSize: "1rem" }}>
                                            {formatName()}
                                        </h6>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-8 d-flex justify-content-end">
                        <ul className="navbar-nav ms-auto">


                            {LABCODE?.toLowerCase() === 'cair' && (
                                <li
                                    className="nav-item position-relative"
                                    style={{ listStyle: "none" }}
                                    // onMouseEnter={() => setIsLauncherOpen(true)}
                                    // onMouseLeave={() => setIsLauncherOpen(false)}
                                    onClick={() => setIsLauncherOpen(prev => !prev)}
                                >
                                    <button className="nav-link border-0 " style={{ color: "white" }}>
                                        <LuLayoutGrid size={22} />
                                    </button>

                                    {isLauncherOpen && (
                                        <div className="app-launcher-dropdown">
                                            <div className="app-grid">
                                                {apps.map(app => (
                                                    <div
                                                        key={app.code}
                                                        className="app-item"
                                                        onClick={() => handleAppLaunch(app)}
                                                        data-tooltip-id="Tooltip"
                                                        data-tooltip-content={app.name}
                                                    >
                                                        <div className="app-icon" style={{ color: app.color }}>
                                                            {app.icon}
                                                        </div>
                                                        <span className="app-name">{app.code}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* <Tooltip id="Tooltip" className="text-white tooltipName" /> */}
                                        </div>
                                    )}
                                </li>
                            )}

                            <li className="nav-item dropdown">
                                <a href="/dashboard" className="nav-link nav-animate">
                                    <FaHome className="icon-name" />Home
                                </a>
                            </li>


                            {headerModuleList.map((module, index) => {
                                const filteredDetails = headerModuleDetailList.filter(
                                    (detail) => detail.formModuleId === module.formModuleId
                                );

                                return filteredDetails.length >= 1 ? (
                                    <li key={index} className="nav-item dropdown">
                                        <a className="nav-link nav-animate">
                                            {(() => {
                                                const IconComponent = FaIcons[module.moduleIcon];
                                                return IconComponent ? <IconComponent className="icon-name" /> : null;
                                            })()}

                                            {module.formModuleName}
                                            <FaCaretDown className="arrow-down" />
                                        </a>
                                        <ul className="dropdown-menu mt-2">
                                            {filteredDetails.map((detail, idx) => (
                                                <li key={idx}>
                                                    <a className="dropdown-item" href={`/${detail?.formUrl}`} onClick={() => localStorage.setItem("formDetailId", detail.formDetailId)}>
                                                        {detail.formDispName}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ) : (
                                    <li key={index} className="nav-item dropdown">
                                        <a
                                            href={`/${filteredDetails[0]?.formUrl ? filteredDetails[0]?.formUrl : "dashboard"}`}
                                            className="nav-link nav-animate"
                                            onClick={() => localStorage.setItem("formDetailId", module.FormDetailId)}
                                        >
                                            {module.formModuleName}
                                        </a>
                                    </li>
                                );
                            })}

                            {/* <li className="nav-item dropdown">
                                <a href="/dashboard" className="nav-link nav-animate" onClick={(e) => e.preventDefault()}>
                                    <FaHSquare className="icon-name" /> Help
                                    <FaCaretDown className="arrow-down" />
                                </a>
                                <ul className="dropdown-menu mt-2">
                                    <li>
                                        <a className="dropdown-item" href='#' onClick={changePassword}>
                                            Change Password
                                        </a>
                                    </li>
                                </ul>
                            </li> */}


                            <li className="nav-item dropdown" >
                                <a href="#" className="nav-link nav-animate">
                                    <FaBell className="icon-name" />
                                    <span className='notification-count'>{Number(notifiCount)}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-notification mt-2 dms-notification shadow-lg rounded p-0">
                                    <li className="dropdown-header border-bottom text-dark employee-text py-2 bg-white sticky-top z-10 notificationStyles" >
                                        <strong className="fw-bold ">Notifications</strong>
                                    </li>

                                    <div className="notifyStyles1" >
                                        {notifiList.length > 0 ? (
                                            notifiList.map((item, index) => {
                                                const formatMessage = (message) => {
                                                    if (message.length > 35) {
                                                        let splitPoint = message.substring(0, 35).lastIndexOf(' ');
                                                        if (splitPoint === -1 || splitPoint < 15) {
                                                            splitPoint = 35;
                                                        }
                                                        const firstPart = message.substring(0, splitPoint);
                                                        const secondPart = message.substring(splitPoint).trim();
                                                        return (
                                                            <>
                                                                {firstPart}
                                                                <br />
                                                                {secondPart}
                                                            </>
                                                        );
                                                    }
                                                    return message;
                                                };

                                                return (
                                                    <li key={index}>
                                                        <a
                                                            className="dropdown-item d-flex align-items-start gap-2 py-2 border-bottom"
                                                            href={item.notificationUrl}
                                                            onClick={(event) => gotoNoti(event, item)}
                                                        >
                                                            <span className="fs-14" >
                                                                {formatMessage(item.notificationMessage)}
                                                            </span>
                                                        </a>
                                                    </li>
                                                );
                                            })
                                        ) : (
                                            <li className="px-3 py-2 text-muted">No Notifications</li>
                                        )}
                                    </div>

                                    {notifiList.length > 0 && (
                                        <li className="dropdown-footer text-center py-2 bg-white sticky-bottom z-10 border-top">
                                            <button className="btn btn-link fs-14" onClick={handleShowAll}>
                                                Show All Alerts
                                            </button>
                                        </li>
                                    )}

                                </ul>
                            </li>

                            <li className="nav-item dropdown" >
                                <a href="#" onClick={handleLogout} className="nav-link nav-animate">
                                    <BiSolidExit className="icon-name" /> Logout
                                </a>
                            </li>
                        </ul>

                        {showAll && (
                            <>
                                <div className="notification-backdrop" onClick={handleClose}></div>

                                <div className="notification-panel">
                                    {/* Header Section */}
                                    <div className="panel-header">
                                        <div className="header-title">
                                            <FaBell className="header-icon" />
                                            <h5>Notifications</h5>
                                            <span className="count-pill">{notifiList.length}</span>
                                        </div>
                                        <button className="close-panel-btn" onClick={handleClose} aria-label="Close">
                                            <FaTimes />
                                        </button>
                                    </div>

                                    {/* Body Section */}
                                    <div className="panel-body">
                                        {notifiList.length === 0 ? (
                                            <div className="empty-state">
                                                <p>No notifications available</p>
                                            </div>
                                        ) : (
                                            notifiList.map((notif) => (
                                                <div key={notif.notificationId} className="notification-card">
                                                    {/* Left Side: Avatar */}
                                                    <div className="notification-left">
                                                        <div className="avatar-circle">
                                                            {notif.empName
                                                                ?.split(' ')
                                                                .filter(word => word.length > 0)[1]
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>
                                                    </div>

                                                    {/* Right Side: Content */}
                                                    <div className="notification-content">
                                                        <div className="content-top">
                                                            <span className="emp-name">{notif.empName}</span>
                                                        </div>

                                                        <p className="notification-message">
                                                            {notif.notificationMessage}
                                                        </p>

                                                        {/* Footer Row: Button (Left) and Date (Right) */}
                                                        <div className="notification-footer-row">
                                                            {notif.notificationUrl ? (
                                                                <button
                                                                    onClick={(event) => gotoNoti(event, notif)}
                                                                    className="view-link-btn"
                                                                >
                                                                    <FaEye /> View Details
                                                                </button>
                                                            ) : (
                                                                <div className="spacer"></div>
                                                            )}
                                                            <span className="timestamp">{notif.notificationDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Bottom Footer */}
                                    <div className="panel-footer-main">
                                        <button onClick={handleClose} className="footer-close-btn">
                                            Close Panel
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;