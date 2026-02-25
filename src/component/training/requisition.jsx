import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { getRequisitions } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { FaEdit, FaRegEdit } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";


const Requisition = () => {

    const [requisitionList, setRequisitionList] = useState([]);
    const navigate = useNavigate();
    const empId = localStorage.getItem("empId");


    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const response = await getRequisitions();
            setRequisitionList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Program", selector: (row) => row.programName, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "Duration", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Initiating Officer", selector: (row) => row.initiatingOfficer, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return requisitionList.map((item, index) => ({
            sn: index + 1,
            programName: item.programName || "-",
            organizer: item.organizer || "-",
            duration: item.duration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            initiatingOfficer: item.initiatingOfficerName || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    {item.status === 'AA' &&
                        <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Edit"
                            data-tooltip-place="top"
                        >
                            <FaEdit className="fs-6" />
                        </button>
                    }
                    {Number(item.initiatingOfficer) === Number(empId) &&
                        <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleFeedbackClick(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Feedback"
                            data-tooltip-place="top"
                        >
                            <MdFeedback className="fs-6 text-white" />
                        </button>
                    }
                </>
            )
        }));
    }


    const handleAdd = () => {
        navigate("/req-add-edit");
    };

    const handleEdit = async (item) => {
        navigate("/req-add-edit", { state: { requisitionId: item.requisitionId } });
    };

    const handleFeedbackClick = (item) => {
        navigate("/feedback-add", { state: item });

    }

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

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                <button
                    className="add"
                    onClick={handleAdd}>
                    ADD NEW
                </button>
            </div>

        </div>
    )
}

export default Requisition;