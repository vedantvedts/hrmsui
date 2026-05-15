import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { addMandatoryTrainingData, editMandatoryTrainingData, getMandatoryTrainingByEmpId, getMandatoryTrainingDataById } from "../../service/training.service";
import { getEmployees, handleApiError } from "../../service/master.service";
import Swal from "sweetalert2";
import Select from "react-select";
import { format } from "date-fns";


const MandatoryTrainingAddEdit = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const mandatoryTrainingId = location.state?.mandatoryTrainingId;
    const [editData, setEditData] = useState(null);
    const [employeeList, setEmployeeList] = useState([]);

    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");

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
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
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
        participantId: Yup.number().required("Participant is required"),
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

    const employeeOptions = employeeList.map((emp) => ({
        value: emp.empId,
        label: `${emp.empName || ""}${emp.empDesigName ? ", " + emp.empDesigName : ""}`.trim(),
    }));


    const checkTrainingConflict = async (startDate, endDate, values, setFieldValue) => {
        if (!startDate || !endDate || !values.participantId) return false;

        const newFrom = new Date(startDate);
        const newTo = new Date(endDate);

        try {
            const response = await getMandatoryTrainingByEmpId(values.participantId);
            const trainings = response?.data || [];

            const conflictRecord = trainings.find(item => {
                if (Number(item.participantId) !== Number(values.participantId)) return false;

                const existingFrom = new Date(item.fromDate);
                const existingTo = new Date(item.toDate);

                // Standard overlap formula: (StartA <= EndB) and (EndA >= StartB)
                return newFrom <= existingTo && newTo >= existingFrom;
            });

            if (conflictRecord) {
                Swal.fire({
                    icon: "warning",
                    title: "⚠ Training Conflict",
                    html: `
                    <div style="text-align:left; font-size:14px">
                        <p>This employee is already scheduled for <b>${conflictRecord.courseName}</b> during this period:</p>
                        <div style="background:#fff3cd; padding:8px; border-radius:6px; border-left:4px solid #ffc107;">
                            ${format(new Date(conflictRecord.fromDate), "dd-MM-yyyy")} to ${format(new Date(conflictRecord.toDate), "dd-MM-yyyy")}
                        </div>
                    </div>
                `,
                    confirmButtonColor: "#f57c00",
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking training conflict:", error);
            // Optional: Show an alert if the API fails
            return false;
        }
    };

    const handleFromDateChange = async (date, values, setFieldValue) => {
        setFieldValue("fromDate", date);

        // If toDate already exists, check for a conflict with the new range
        if (values.toDate) {
            const isConflict = await checkTrainingConflict(date, values.toDate, values, setFieldValue);
            if (isConflict) {
                setFieldValue("fromDate", null);
                setFieldValue("duration", "");
            } else {
                calculateDuration(date, values.toDate, setFieldValue);
            }
        }
    };

    const handleToDateChange = async (date, values, setFieldValue) => {
        if (!values.fromDate) {
            Swal.fire({ icon: "warning", title: "Select From Date First" });
            return;
        }

        if (new Date(date) < new Date(values.fromDate)) {
            Swal.fire({ icon: "error", title: "To Date cannot be earlier than From Date" });
            return;
        }

        const isConflict = await checkTrainingConflict(values.fromDate, date, values, setFieldValue);

        if (isConflict) {
            setFieldValue("toDate", null);
            setFieldValue("duration", "");
        } else {
            setFieldValue("toDate", date);
            calculateDuration(values.fromDate, date, setFieldValue);
        }
    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-4">
                {mandatoryTrainingId ? "Edit Mandatory Training" : "Add  Mandatory Training"}
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="p-5">
                <div className="card p-3 shadow-sm border-rounded">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, isSubmitting, setFieldTouched }) => (
                            <Form autoComplete="off">
                                <div className="row g-3 custom-modal-body p-3">


                                    <div className="col-md-3">
                                        <label className="form-label">Participant
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={employeeOptions}
                                            value={employeeOptions.find(
                                                (option) => option.value === Number(values.participantId)
                                            ) || null}
                                            onChange={(selectedOption) => {
                                                setFieldValue("participantId", selectedOption?.value || null);
                                            }}
                                            placeholder="Select Participant"
                                            isSearchable
                                            isClearable
                                        />
                                        <ErrorMessage name="participantId" component="div" className="text-danger small" />
                                    </div>


                                    <div className="col-md-5">
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
                                        <label className="form-label">Organized By
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="organizer" type="text" className="form-control" />
                                        <ErrorMessage name="organizer" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">From Date
                                            <span className="text-danger">*</span>
                                        </label>
                                        <DatePicker
                                            id="fromDate"
                                            name="fromDate"
                                            selected={values.fromDate}
                                            onChange={(date) => handleFromDateChange(date, values, setFieldValue)}
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
                                            onChange={(date) => handleToDateChange(date, values, setFieldValue)}
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


                                    <div className="col-md-7">
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