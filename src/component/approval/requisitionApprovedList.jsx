import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import DirectorApprovalList from "./directorApprovalList";
import SAHRTApprovalList from "./saHrtApprovalLIst";
import { getApprovalType } from "../../service/training.service";



const RequisitionApprovedList = () => {

    const [approvalType, setApprovalType] = useState("");
    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");

    useEffect(() => {
        if (empId) {
            fetchApprovalType(empId);
        }
    }, [empId]);

    const fetchApprovalType = async (id) => {
        try {
            const response = await getApprovalType(id);
            setApprovalType(response || "");
        } catch (error) {
            console.error('Error fetching approval type:', error);
        }
    };


    return (
        <div>
            <Navbar />

            {
                approvalType === "SA_HRT" ? (
                    <SAHRTApprovalList />
                ) : approvalType === "DIRECTOR" ? (
                    <DirectorApprovalList />
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "30vh" }}>
                        <h1 className="text-danger">Access Denied</h1>
                        <p>You do not have permission to view this page.</p>
                    </div>
                )
            }

        </div>
    );
}

export default RequisitionApprovedList;