import { useState } from "react";
import { usePermission } from "../../common/usePermission";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";


const Journal = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Journal");

    const [journalList, setJournalList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);


    const [initialValues, setInitialValues] = useState({
        empId: "",
        titleOfPaper: "",
        journalType: "",
        journalName: "",
        volume: "",
        impactFactor: "",
        publicationFee: "",
    });

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Employee Name", selector: (row) => row.empName, sortable: true, align: 'text-center' },
        { name: "Title of Paper", selector: (row) => row.titleOfPaper, sortable: true, align: 'text-start' },
        { name: "Journal Type", selector: (row) => row.journalType, sortable: true, align: 'text-center' },
        { name: "Journal", selector: (row) => row.journalName, sortable: true, align: 'text-center' },
        { name: "Volume", selector: (row) => row.volume, sortable: true, align: 'text-center' },
        { name: "Impact Factor of Journal", selector: (row) => row.impactFactor, sortable: true, align: 'text-center' },
        { name: "Publication Fee (Rs.)", selector: (row) => row.publicationFee, sortable: true, align: 'text-center' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return journalList.map((item, index) => ({
            sn: index + 1,

        }));
    };

    const validationSchema = Yup.object().shape({
        empId: Yup.string().required("Employee is required"),
        titleOfPaper: Yup.string().required("Title of Paper is required"),
        journalType: Yup.string().required("Journal Type is required"),
        journalName: Yup.string().required("Journal Name is required"),
        volume: Yup.string().required("Volume is required"),
        impactFactor: Yup.string().required("Impact Factor is required"),
        publicationFee: Yup.string().required("Publication Fee is required"),
    });

    const handleClose = () => {
        // setShowProgramModal(false);
        setEditMode(false);
    };

    const handleSubmit = (values) => {

    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Journal List
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
                        onClick={() => setShowModal(true)}>
                        ADD NEW
                    </button>
                </div>
            }

            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editMode ? 'Edit Organizer' : 'Add New Organizer'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleClose}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">

                                                <div className="row text-start">

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Organizer Name</label>
                                                        <Field
                                                            name="organizer"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="organizer" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Contact Name</label>
                                                        <Field
                                                            name="contactName"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="contactName" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Phone</label>
                                                        <Field
                                                            name="phoneNo"
                                                            type="tel"
                                                            maxLength={10}
                                                            className="form-control"
                                                            onInput={(e) => {
                                                                e.target.value = e.target.value.replace(/\D/g, "");
                                                            }}
                                                        />
                                                        <ErrorMessage name="phoneNo" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Fax No</label>
                                                        <Field
                                                            name="faxNo"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="faxNo" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Email</label>
                                                        <Field
                                                            name="email"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="email" component="div" className="invalid-msg" />
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
                                                        onClick={handleClose}
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
    )

}

export default Journal;