import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { forwardRequisition, getFeedbackList, getRequisitionPrint, getRequisitions, revokeRequisition } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { MdFeedback } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import RequisitionPrint from "../print/requisition";
import { FaArrowLeft, FaEye, FaForward } from "react-icons/fa6";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { usePermission } from "../../common/usePermission";
import RequisitionPreview from "./requisitionPreview";


const Requisition = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Requisition");

    const location = useLocation();
    const [requisitionList, setRequisitionList] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const navigate = useNavigate();
    const empId = localStorage.getItem("empId");
    const roleName = localStorage.getItem("roleName");
    const [showModal, setShowModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(location.state?.selectedTab || "free");


    useEffect(() => {
        fetchRequisitions();
        fetchFeedbacks();
    }, []);

    const fetchRequisitions = async () => {
        try {
            const response = await getRequisitions(empId, roleName);
            setRequisitionList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };

    const fetchFeedbacks = async () => {
        let apiEmpId = 0;
        let apiRole = roleName;

        if (roleName !== "ROLE_USER") {
            apiRole = "ROLE_ADMIN";
        }

        if (roleName === "ROLE_USER") {
            apiEmpId = empId;
            apiRole = roleName;
        }

        try {
            const response = await getFeedbackList(apiEmpId, apiRole);
            setFeedbackList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
        }
    };


    const getTextColor = (bg) => {
        if (!bg) return "#000";
        const color = bg.substring(1);
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "#000" : "#fff";
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Participant", selector: (row) => row.initiatingOfficer, sortable: true, align: 'text-left' },
        { name: "Designation", selector: (row) => row.designation, sortable: true, align: 'text-center' },
        { name: "Status", selector: (row) => row.status, sortable: true, align: 'text-left' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const freeList = requisitionList.filter(item => item.registrationFee === 0);
    const paidList = requisitionList.filter(item => item.registrationFee > 0);
    const filteredList = selectedTab === "free" ? freeList : paidList;


    const mappedData = () => {
        return filteredList.map((item, index) => {

            const feedbackExists = feedbackList?.some(
                feedback => Number(feedback?.requisitionId) === Number(item?.requisitionId)
            );

            return {
                sn: index + 1,
                requisitionNumber: (
                    <button
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => handlePreview(item)}
                    >
                        {item.requisitionNumber}
                    </button>
                ),
                courseName: item.courseName || "-",
                organizer: item.organizer || "-",
                duration: item.duration || "-",
                fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
                toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
                initiatingOfficer: item.initiatingOfficerName || "-",
                designation: item.empDesigName || "-",
                status:
                    <span
                        className="status-badge-modern"
                        onClick={() => handleView(item)}
                        style={{
                            backgroundColor: item.statusColor || "#cceaff",
                            color: getTextColor(item.statusColor),
                            borderColor: item.statusColor || "#dee2e6"
                        }}
                    >
                        {item.statusName || "Unknown"}
                    </span>,
                action: (
                    <>
                        <Tooltip id="Tooltip" className='text-white' />

                        {canEdit &&
                            <>
                                {["AA", "REV", "RS", "RR", "RV", "CR"].includes(item.status) && (
                                    <>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEdit(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Edit"
                                            data-tooltip-place="top"
                                        >
                                            <FaEdit className="fs-6" />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleForward(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Forward"
                                            data-tooltip-place="top"
                                        >
                                            <FaForward className="fs-6" />
                                        </button>
                                    </>
                                )}

                                {Number(item.initiatingOfficer) === Number(empId) && item.status === 'AF' && (
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleRevoke(item)}
                                        data-tooltip-id="Tooltip"
                                        data-tooltip-content="Revoke"
                                        data-tooltip-place="top"
                                    >
                                        <FaArrowLeft className="fs-6" />
                                    </button>
                                )}

                                {Number(item.initiatingOfficer) === Number(empId) &&
                                    !feedbackExists && (item.status === "CO" || item.status === "FA") && (
                                        <button
                                            className="btn btn-sm btn-secondary me-2"
                                            onClick={() => handleFeedbackClick(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Feedback"
                                            data-tooltip-place="top"
                                        >
                                            <MdFeedback className="fs-6" />
                                        </button>
                                    )}
                            </>
                        }

                        {canView && <button
                            className="print"
                            onClick={() => handlePrint(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Print"
                            data-tooltip-place="top"
                        >
                            <FaEye className="fs-6" />
                        </button>
                        }
                    </>
                )
            };
        });
    };

    const handlePreview = (item) => {
        setShowModal(true);
        setShowReqData(item);
    };

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            programName: item.programName,
            fromDate: item.fromDate,
            toDate: item.toDate,
            registrationFee: item.registrationFee,
        }
        localStorage.setItem('transactionData', JSON.stringify(dto));
        window.open('/transaction', '_blank');
    }

    const handleAdd = () => {
        const feedbackMissing = [];

        requisitionList
            .filter(item => ["CO", "FA"].includes(item.status))
            .forEach(item => {
                if (Number(item.initiatingOfficer) !== Number(empId)) return;

                const feedbackExists = feedbackList?.some(
                    feedback => Number(feedback?.requisitionId) === Number(item?.requisitionId)
                );

                if (!feedbackExists) {
                    feedbackMissing.push(item.requisitionNumber);
                }
            });

        if (feedbackMissing.length > 0) {
            Swal.fire({
                title: "Action Required",
                icon: "info",
                html: `
                <div style="text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
                    <p style="color: #555;">To proceed, please submit feedback for all your approved requisitions listed below.</p>
                    ${feedbackMissing.length > 0 ? `
                        <div style="margin-top: 15px; border-left: 4px solid #3498db; padding-left: 10px;">
                            <strong style="color: #2980b9;">Feedback Required</strong>
                            <p style="font-size: 0.85rem; margin: 0; color: #666;">Please submit feedback for these approved requisitions:</p>
                            <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                                ${feedbackMissing.map(req => `<span style="background: #ebf5fb; border: 1px solid #3498db; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${req}</span>`).join("")}
                            </div>
                        </div>
                    ` : ""}
                </div>
            `,
                showCloseButton: true,
                confirmButtonText: "OK",
                confirmButtonColor: "#3085d6",
                customClass: {
                    container: 'my-swal-container'
                }
            });

            return;
        }

        navigate("/req-add-edit");
    };

    const handleEdit = async (item) => {
        navigate("/req-add-edit", { state: { requisitionId: item.requisitionId } });
    };

    const handleFeedbackClick = (item) => {
        navigate("/feedback-add", { state: item });
    }

    const handlePrint = async (item) => {
        const response = await getRequisitionPrint(item.requisitionId);
        await RequisitionPrint(response?.data);
    };

    const handleForward = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to forward!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await forwardRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitions();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };


    const handleRevoke = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to revoke!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await revokeRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitions();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const handleChangeTab = (tab) => {
        setSelectedTab(tab);
    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Requisition List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="mt-5 d-flex justify-content-center">
                <div className="p-2 bg-light rounded-pill border d-inline-flex gap-2 shadow-sm">

                    {/* Free Requisition */}
                    <button
                        type="button"
                        onClick={() => handleChangeTab("free")}
                        className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 transition-all ${selectedTab === "free"
                                ? "btn-warning border-0 shadow"
                                : "btn-light border-0 text-secondary"
                            }`}
                    >
                        <span className="fw-bold">Free Requisition</span>
                        <span className={`badge rounded-pill ${selectedTab === "free" ? "bg-dark" : "bg-secondary text-white"}`}>
                            {freeList.length}
                        </span>
                    </button>

                    {/* Paid Requisition */}
                    <button
                        type="button"
                        onClick={() => handleChangeTab("paid")}
                        className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 transition-all ${selectedTab === "paid"
                                ? "btn-success border-0 shadow text-white"
                                : "btn-light border-0 text-secondary"
                            }`}
                    >
                        <span className="fw-bold">Paid Requisition</span>
                        <span className={`badge rounded-pill ${selectedTab === "paid" ? "bg-white text-success" : "bg-secondary text-white"}`}>
                            {paidList.length}
                        </span>
                    </button>

                </div>
            </div>
            
            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd && <button
                    className="add"
                    onClick={handleAdd}>
                    ADD NEW
                </button>
                }
            </div>

            {showModal &&
                <RequisitionPreview
                    reqData={reqData}
                    setShowModal={setShowModal}
                />
            }

        </div>
    )
}

export default Requisition;