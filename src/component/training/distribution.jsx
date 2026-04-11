import { useEffect, useState } from 'react'
import Navbar from '../navbar/Navbar';
import { getDistribution } from '../../service/training.service';
import { useNavigate } from 'react-router-dom';
import Datatable from "../../datatable/Datatable";
import { format } from "date-fns";
import { FaEdit } from 'react-icons/fa';
import { Tooltip } from "react-tooltip";

const DistributionComponent = () => {
     const navigate = useNavigate();
     const [distribution, Setdistribution] = useState([]);

     const columns = [
      { name: "SN", selector: (row) => row.sn, sortable: true, center: true },
      { name: "Project Code", selector: (row) => row.projectCode, sortable: true, center: true },
      { name: "Employee Name", selector: (row) => row.employeeName, sortable: true ,align: 'text-start'},
      { name: "AO Officer", selector: (row) => row.aoOfficerName, sortable: true ,align: 'text-start'},
      { name: "RO Officer", selector: (row) => row.roOfficerName, sortable: true,align: 'text-start' },
      { name: "Tech Activity", selector: (row) => row.techActivity },
      { name: "Non-Tech Activity", selector: (row) => row.nonTechActivity }, 
      { name: "Action", selector: (row) => row.action, align: 'text-center' },
];

 const mappedData = () => {
        return distribution.map((item, index) => ({
            sn: index + 1,
            projectCode: item.projectCode || "NA",
            employeeName: item.employeeName || "NA",
            aoOfficerName: item.aoOfficerName || "NA",
            roOfficerName: item.roOfficerName || "NA",
            appointment: item.appointment || "NA",

            distributionDate: item.distributionDate
                ? format(new Date(item.distributionDate), "dd-MM-yyyy")
                : "NA",

            techActivity: item.techActivity || "NA",
            nonTechActivity: item.nonTechActivity || "NA",

            action: (
                <>
                  <Tooltip id="Tooltip" className='text-white' /> 
                    <button
                        className="btn btn-sm btn-warning me-2"
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                         onClick={() => navigate("/hr-distribution-add", { state: { item } })}
                    >
                        <FaEdit className="fs-6" /> 
                    </button>
                </>
            )
        }));
    };

     const fetchDistributionList = async () => {
        try {
            const response = await getDistribution();
            Setdistribution(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

  useEffect(() => {
        fetchDistributionList();
    }, []);



    return (
        <div>
            <Navbar />
            <div>
                <h3 className="fancy-heading mt-3">
                         Distribution List
                    <span className="underline-glow">
                        <span className="pulse-dot"></span>
                        <span className="pulse-dot"></span>
                        <span className="pulse-dot"></span>
                    </span>
                </h3>

                   <div id="card-body" className="p-2 mt-2">
                    <Datatable columns={columns} data={mappedData()} />
                </div>


                <div>
                    <button className="add"
                           onClick={()=>navigate("/hr-distribution-add")}> ADD NEW
                     </button>
                </div>

            </div>

        </div>

    )

}
export default DistributionComponent;