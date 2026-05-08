import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { addMandatoryTrainingData, editMandatoryTrainingData, getMandatoryTrainingDataById } from "../../service/training.service";
import { handleApiError } from "../../service/master.service";
import Swal from "sweetalert2";



const MandatoryTrainingAddEdit = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const mandatoryTrainingId = location.state?.mandatoryTrainingId;
    const [editData, setEditData] = useState(null);

    const empId = localStorage.getItem("empId");
    const title = localStorage.getItem("title");
    const salutation = localStorage.getItem("salutation");
    const empName = localStorage.getItem("empName");
    const designationCode = localStorage.getItem("designationCode");

    const formatName = () => {
        const cleanTitle = (salutation && salutation !== "null") ? salutation : (title && title !== "null") ? title : "";
        const cleanName = (empName && empName !== "null") ? empName : "";
        const cleanDesignation = (designationCode && designationCode !== "null") ? `, ${designationCode}` : "";

        return `${cleanTitle} ${cleanName}`.trim() + cleanDesignation;
    };

    const [initialValues, setInitialValues] = useState({
        mandatoryTrainingId: null,
        participantId: empId,
        courseName: "",
        courseType: "",
        organizer: "",
        duration: "",
        fromDate: null,
        toDate: null,
        reference: "",
        venue: "",
        registrationFee: "",
        remarks: ""
    });

    useEffect(() => {
        if (mandatoryTrainingId) {
            fetchMandatoryTrainingData(mandatoryTrainingId);
        }
    }, [mandatoryTrainingId]);

    const fetchMandatoryTrainingData = async (trainId) => {
        try {
            const response = await getMandatoryTrainingDataById(trainId);
            setEditData(response?.data);
        } catch (error) {
            console.error("Error fetching mandatory training data:", error);
        }
    };


    useEffect(() => {
        if (editData && Object.keys(editData).length > 0) {
            setInitialValues({
                mandatoryTrainingId: editData.mandatoryTrainingId,
                participantId: editData.participantId,
                courseName: editData.courseName,
                courseType: editData.courseType,
                organizer: editData.organizer,
                duration: editData.duration,
                fromDate: editData.fromDate,
                toDate: editData.toDate,
                reference: editData.reference,
                venue: editData.venue,
                registrationFee: editData.registrationFee,
                remarks: editData.remarks
            });
        }
    }, [editData]);

    const validationSchema = Yup.object().shape({
        mandatoryTrainingId: Yup.number().notRequired(),
        participantId: Yup.number().notRequired(),
        courseName: Yup.string()
            .trim()
            .required("Course name is required")
            .min(3, "Course name must be at least 3 characters")
            .max(100, "Course name cannot exceed 100 characters"),

        courseType: Yup.string()
            .trim()
            .required("Course type is required")
            .max(50, "Course type cannot exceed 50 characters"),

        fromDate: Yup.date()
            .nullable()
            .required("From date is required"),
            // .max(new Date(), "From date cannot be in the future"),

        toDate: Yup.date()
            .nullable()
            .required("To date is required")
            .min(
                Yup.ref("fromDate"),
                "To date must be greater than or equal to From date"
            ),
            // .max(new Date(), "To date cannot be in the future"),

        duration: Yup.string()
            .trim()
            .required("Duration is required"),

        organizer: Yup.string()
            .trim()
            .required("Organizer name is required")
            .max(100, "Organizer name cannot exceed 100 characters"),

        venue: Yup.string()
            .trim()
            .required("Venue is required")
            .max(150, "Venue cannot exceed 150 characters"),

        registrationFee: Yup.number()
            .typeError("Registration fee must be a number")
            .required("Registration fee is required")
            .min(0, "Registration fee cannot be negative")
            .max(1000000, "Registration fee is too large"),

        reference: Yup.string()
            .trim()
            .max(100, "Reference cannot exceed 100 characters")
            .nullable(),

        remarks: Yup.string()
            .trim()
            .max(500, "Remarks cannot exceed 500 characters")
            .nullable(),
    });


    const handleSubmit = async (values, { resetForm }) => {
        try {
            const confirm = await AlertConfirmation({
                title: "Are you sure to submit!",
                message: "",
            });

            if (!confirm) return;

            const response = mandatoryTrainingId ? await editMandatoryTrainingData(values) : await addMandatoryTrainingData(values);

            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                navigate("/mandatory-training");
            } else {
                Swal.fire("Warning", response?.message || "Something went wrong", "warning");
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire("Warning", handleApiError ? handleApiError(error) : "Something went wrong", "warning");
        }
    };


    const handleBack = () => {
        navigate("/mandatory-training");
    };

    const calculateDuration = (fromDate, toDate, setFieldValue) => {
        if (fromDate && toDate) {
            const diffTime = new Date(toDate) - new Date(fromDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (diffDays >= 0) {
                setFieldValue("duration", diffDays);
            } else {
                setFieldValue("duration", "");
            }
        }
    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                {mandatoryTrainingId ? "Edit Mandatory Training" : "Add  Mandatory Training"}
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="p-5">
                <div className="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded-3 shadow-sm">
                    <div className="d-flex align-items-center">
                        <span className="badge rounded-pill bg-primary-subtle text-primary me-2 px-3 py-2">
                            <i className="bi bi-person-fill me-1"></i> Participant
                        </span>
                        <span className="fw-bold text-dark">{formatName()}</span>
                    </div>
                </div>

                <div className="card p-3 shadow-sm border-rounded">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, isSubmitting, setFieldTouched }) => (
                            <Form autoComplete="off">
                                <div className="row g-4 custom-modal-body p-3">

                                    <div className="col-md-3">
                                        <label className="form-label">Name of the Course
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="courseName" type="text" className="form-control" />
                                        <ErrorMessage name="courseName" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Course Type
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="courseType" type="text" className="form-control" />
                                        <ErrorMessage name="courseType" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">From Date
                                            <span className="text-danger">*</span>
                                        </label>
                                        <DatePicker
                                            id="fromDate"
                                            name="fromDate"
                                            selected={values.fromDate}
                                            onChange={(date) => {
                                                setFieldValue("fromDate", date);
                                                calculateDuration(date, values.toDate, setFieldValue);
                                            }}
                                            className="form-control"
                                            placeholderText="Choose Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            onKeyDown={(event) => event.preventDefault()}
                                        />
                                        <ErrorMessage name="fromDate" component="div" className="text-danger small" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">To Date
                                            <span className="text-danger">*</span>
                                        </label>
                                        <DatePicker
                                            id="toDate"
                                            name="toDate"
                                            selected={values.toDate}
                                            onChange={(date) => {
                                                setFieldValue("toDate", date);
                                                calculateDuration(values.fromDate, date, setFieldValue);
                                            }}
                                            className="form-control"
                                            placeholderText="Choose Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            onKeyDown={(event) => event.preventDefault()}
                                        />
                                        <ErrorMessage name="toDate" component="div" className="text-danger small" />
                                    </div>

                                    <div className="col-md-1">
                                        <label className="form-label">Duration
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="duration" type="text" className="form-control" disabled />
                                        <ErrorMessage name="duration" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Organized By
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="organizer" type="text" className="form-control" />
                                        <ErrorMessage name="organizer" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Registration Fee (₹)
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field
                                            name="registrationFee"
                                            type="number"
                                            className="form-control"
                                        />
                                        <ErrorMessage name="registrationFee" component="div" className="invalid-msg" />
                                    </div>


                                    <div className="col-md-3">
                                        <label className="form-label">Venue
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="venue" type="text" className="form-control" />
                                        <ErrorMessage name="venue" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Reference</label>
                                        <Field name="reference" type="text" className="form-control" />
                                        <ErrorMessage name="reference" component="div" className="invalid-msg" />
                                    </div>


                                    <div className="col-md-5">
                                        <label className="form-label">Remarks</label>
                                        <Field name="remarks" type="text" className="form-control" />
                                        <ErrorMessage name="remarks" component="div" className="invalid-msg" />
                                    </div>

                                </div>

                                <div className="text-center mt-4">
                                    <button type="submit"
                                        className={mandatoryTrainingId ? `update` : `submit`}
                                    >
                                        {mandatoryTrainingId ? `update` : `submit`}
                                    </button>
                                    <button
                                        type="button"
                                        className="back"
                                        onClick={handleBack}
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
    )
};

export default MandatoryTrainingAddEdit;