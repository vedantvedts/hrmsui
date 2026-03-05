import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import { forwardRequisition, getRequisitionApprovals, recommendRequisition } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FaCheckCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";

const RequisitionApproval = () => {

    const [requisitionFwdList, setRequisitionFwdList] = useState([]);
    const employeeId = localStorage.getItem("empId");


    useEffect(() => {
        if (employeeId) {
            fetchRequisitionApprovals(employeeId);
        }
    }, []);

    const fetchRequisitionApprovals = async (id) => {
        try {
            const response = await getRequisitionApprovals(id);
            setRequisitionFwdList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Program", selector: (row) => row.programName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "Duration", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Forwarded By", selector: (row) => row.forwardBy, sortable: true, align: 'text-left' },
        { name: "Forward Date", selector: (row) => row.forwardDate, sortable: true, align: 'text-center' },
        { name: "Status", selector: (row) => row.status, sortable: true, align: 'text-left' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return requisitionFwdList.map((item, index) => ({
            sn: index + 1,
            requisitionNumber: item.requisitionNumber || "",
            programName: item.programName || "-",
            organizer: item.organizer || "-",
            duration: item.duration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            forwardBy: item.forwardByName || "-",
            forwardDate: item.forwardDate ? format(new Date(item.forwardDate), "dd-MM-yyyy hh:mm a") : "-",
            status: <span className="status-badge-modern" onClick={() => handleView(item)}>
                {item.statusName || "Unknown"}
            </span>,
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    {(item.status === 'AF' || item.status === 'AR') && (
                        <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleForward(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Approve"
                            data-tooltip-place="top"
                        >
                            <FaCheckCircle className="fs-6" />
                        </button>
                    )}

                </>
            ),
        }));
    }

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            programName: item.programName,
            fromDate: item.fromDate,
            toDate: item.toDate
        }
        localStorage.setItem('transactionData', JSON.stringify(dto));
        window.open('/transaction', '_blank');
    }


    const handleForward = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: employeeId,
            }
            console.log(dto)
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await recommendRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitionApprovals(employeeId);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Requisition Approval List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

        </div>
    )
}

export default RequisitionApproval;