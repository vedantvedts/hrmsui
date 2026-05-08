import { useEffect, useState } from "react";
import { usePermission } from "../../common/usePermission";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { getMandatoryTrainingList } from "../../service/training.service";


const MandatoryTraining = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Mandatory Training");

    const navigate = useNavigate();
    const [trainingList, setTrainingList] = useState([]);
    const empId = localStorage.getItem("empId");
    const roleName = localStorage.getItem("roleName");

    useEffect(() => {
        if (empId && roleName) {
            fetchMandatoryTrainings(empId, roleName);
        }
    }, [empId, roleName]);


    const fetchMandatoryTrainings = async (id, role) => {
        try {
            const response = await getMandatoryTrainingList(id, role);
            setTrainingList(response?.data || []);
        } catch (error) {
            console.error("Error fetching mandatory trainings:", error);
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Participant", selector: (row) => row.participantName, sortable: true, align: 'text-start' },
        { name: "Course Name", selector: (row) => row.courseName, sortable: true, align: 'text-start' },
        { name: "Course Type", selector: (row) => row.courseType, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Venue", selector: (row) => row.venue, sortable: true, align: 'text-start' },
        { name: "Registration Fee (₹)", selector: (row) => row.registrationFee, sortable: true, align: 'text-end' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return trainingList.map((item, index) => ({
            sn: index + 1,
            participantName: item.participantName || "-",
            courseName: item.courseName || "-",
            courseType: item.courseType || "-",
            organizer: item.organizer || "-",
            duration: item.duration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            venue: item.venue || "-",
            registrationFee: item.registrationFee || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                        onClick={() => handleEdit(item)}
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };


    const handleAdd = () => {
        navigate("/mandatory-training-add");
    };

    const handleEdit = async (item) => {
        navigate("/mandatory-training-add", { state: { mandatoryTrainingId: item.mandatoryTrainingId } });
    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Mandatory Training List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>


            {canAdd &&
                <div>
                    <button
                        className="add"
                        onClick={handleAdd}
                    >
                        ADD NEW
                    </button>
                </div>
            }
        </div>
    )
};

export default MandatoryTraining;