import { format } from "date-fns";
import { usePermission } from "../../common/usePermission";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import Swal from "sweetalert2";
import { addEligible, getEligibilities, updateEligible } from "../../service/training.service";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";


const Eligibility = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Eligibility");

    const [eligibilityList, setEligibilityList] = useState([]);
    const [showEligibleModal, setShowEligibleModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchEligibility();
    }, []);


    const fetchEligibility = async () => {
        try {
            const response = await getEligibilities();
            setEligibilityList(response?.data || []);
        } catch (error) {
            console.error("Error fetching eligibility:", error);
            Swal.fire("Error", "Failed to fetch eligibility data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Eligibility", selector: (row) => row.eligibility, sortable: true, align: 'text-left' },
        { name: "Created Date", selector: (row) => row.createdDate, sortable: true, align: 'text-center' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return eligibilityList.map((item, index) => ({
            sn: index + 1,
            eligibility: item.eligibilityName || "-",
            createdDate: item.createdDate ? format(new Date(item.createdDate), "dd-MM-yyyy hh:mm a") : "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="right"
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };

    const [initialValues, setInitialValues] = useState({
        eligibilityId: null,
        eligibilityName: "",
    });

    const handleAdd = () => {
        setShowEligibleModal(true);
        setInitialValues({
            eligibilityId: null,
            eligibilityName: "",
        });
        setEditMode(false);
    };

    const handleEdit = (item) => {
        setEditMode(true);
        setInitialValues({
            eligibilityId: item?.eligibilityId || "",
            eligibilityName: item?.eligibilityName || "",
        });
        setShowEligibleModal(true);
    }

    const eligibleSchema = Yup.object().shape({
        eligibilityName: Yup.string().trim().required("Eligibility Name is required"),
    });

    const handleEligibleSubmit = async (values, { resetForm }) => {
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editMode ? await updateEligible(values) : await addEligible(values);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                setShowEligibleModal(false);
                resetForm();
                fetchEligibility();
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
                Eligibility List
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
                {canAdd &&
                    <button
                        className="add"
                        onClick={handleAdd}
                    >
                        ADD NEW
                    </button>
                }
            </div>

            {showEligibleModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={() => setShowEligibleModal(false)}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-md">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editMode ? 'Edit Eligibility' : 'Add New Eligibility'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowEligibleModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={eligibleSchema}
                                        onSubmit={handleEligibleSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">
                                                <div className="row text-start">
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">Eligibility Name</label>
                                                        <Field
                                                            name="eligibilityName"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="eligibilityName" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-2 mb-4">
                                                    <button type="submit"
                                                        className={editMode ? `update` : `submit`}
                                                    >
                                                        {editMode ? `update` : `submit`}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={() => setShowEligibleModal(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>

                                            </Form>
                                        )}
                                    </Formik>

                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}


        </div>
    );

};

export default Eligibility;