import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useEffect, useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { addRequisitionData, getAgencies, getCourseList, getMandatoryTrainingByEmpId, getRequisitionById, updateRequisitionData } from "../../service/training.service";
import { getEmployees, handleApiError } from "../../service/master.service";
import Swal from "sweetalert2";
import Select from "react-select";
import CourseModal from "../master/courseModal";
import { format } from "date-fns";


const MandatoryTrainingAddEdit = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const requisitionId = location.state?.requisitionId;
    const [editData, setEditData] = useState(null);
    const [employeeList, setEmployeeList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [organizerList, setOrganizerList] = useState([]);
    const formikRef = useRef(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [feeOptions, setFeeOptions] = useState([]);
    const [courseData, setCourseData] = useState(null);

    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");

    const [initialValues, setInitialValues] = useState({
        initiatingOfficer: empId,
        courseId: "",
        courseType: "",
        organizer: "",
        duration: "",
        fromDate: null,
        toDate: null,
        reference: "",
        venue: "",
        registrationFee: "",
        remarks: "",
    });

    useEffect(() => {
        if (requisitionId) {
            fetchMandatoryTrainingData(requisitionId);
        }
    }, [requisitionId]);

    const fetchMandatoryTrainingData = async (trainId) => {
        try {
            const response = await getRequisitionById(trainId);
            setEditData(response?.data);
        } catch (error) {
            console.error("Error fetching mandatory training data:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchPrograms();
        fetchAgencies();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await getAgencies();
            setOrganizerList(response?.data || []);
        } catch (error) {
            console.error("Error fetching agencies:", error);
            Swal.fire("Error", "Failed to fetch organizer data. Please try again later.", "error");
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await getCourseList(0);
            setCourseList(response?.data || []);
        } catch (error) {
            console.error("Error fetching programs:", error);
            Swal.fire("Error", "Failed to fetch program data. Please try again later.", "error");
        }
    };

    useEffect(() => {
        if (editData && Object.keys(editData).length > 0) {
            setInitialValues({
                requisitionId: editData.requisitionId,
                requisitionNumber: editData.requisitionNumber,
                initiatingOfficer: editData.initiatingOfficer,
                courseId: editData.courseId,
                courseType: editData.courseType,
                organizer: editData.organizer,
                duration: editData.duration,
                fromDate: editData.fromDate,
                toDate: editData.toDate,
                reference: editData.reference,
                venue: editData.venue,
                registrationFee: editData.registrationFee,
                remarks: editData.necessity,
            });
        }
    }, [editData]);

    const validationSchema = Yup.object().shape({
        initiatingOfficer: Yup.number().required("Participant is required"),
        courseId: Yup.string().required("Course is required"),

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

            const hasConflict = await checkTrainingConflict(values.fromDate, values.toDate, values, editData);
            if (hasConflict) return;

            const dto = {
                ...values,
                requisitionId: requisitionId || null,
                requisitionNumber: values.requisitionNumber || null,
                fromDate: format(new Date(values.fromDate), "yyyy-MM-dd"),
                toDate: format(new Date(values.toDate), "yyyy-MM-dd"),
                isMandatory: "Y",
                journalId: 0,
                modeOfPayment: "OTHERS",
                necessity: values.remarks || "",
                isSubmitted: "N",
                isPaperPresent: "N",
            };

            const confirm = await AlertConfirmation({
                title: "Are you sure to submit!",
                message: "",
            });

            if (!confirm) return;

            const response = requisitionId ? await updateRequisitionData(dto) : await addRequisitionData(dto);

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


    const checkTrainingConflict = async (startDate, endDate, values, editData) => {
        if (!startDate || !endDate || !values.initiatingOfficer) return false;

        const newFrom = new Date(startDate);
        const newTo = new Date(endDate);

        try {
            const response = await getMandatoryTrainingByEmpId(values.initiatingOfficer);
            const trainings = response?.data || [];

            const conflictRecords = trainings.filter(item => {

                // Skip same record in edit mode (VERY IMPORTANT FIX)
                if (editData && item.requisitionId === editData.requisitionId) {
                    return false;
                }

                const existingFrom = new Date(item.fromDate);
                const existingTo = new Date(item.toDate);

                // console.log("Checking:", {
                //     existingFrom: format(existingFrom, "yyyy-MM-dd"),
                //     existingTo: format(existingTo, "yyyy-MM-dd"),
                //     newFrom: format(newFrom, "yyyy-MM-dd"),
                //     newTo: format(newTo, "yyyy-MM-dd"),
                // });

                // Overlap condition
                return newFrom <= existingTo && newTo >= existingFrom;
            });

            // If multiple conflicts found
            if (conflictRecords.length > 0) {
                const conflictHtml = conflictRecords.map(record => `
                            <div style="margin-bottom:8px; background:#fff3cd; padding:8px; border-radius:6px; border-left:4px solid #ffc107;">
                                <b>${record.courseName}</b><br/>
                                ${format(new Date(record.fromDate), "dd-MM-yyyy")} 
                                to 
                                ${format(new Date(record.toDate), "dd-MM-yyyy")}
                            </div>
                        `).join("");

                Swal.fire({
                    icon: "warning",
                    title: "⚠ Training Conflict Found",
                    html: `
                                <div style="text-align:left; font-size:14px">
                                    <p>This employee is already scheduled for the following training(s):</p>
                                    ${conflictHtml}
                                </div>
                            `,
                    confirmButtonColor: "#f57c00",
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking training conflict:", error);
            return false;
        }
    };


    const courseOptions = [
        { value: 0, label: "Add New", data: null },
        ...courseList.map((item) => ({
            value: item.courseId,
            label: item.courseName,
            data: item
        }))
    ];

    useEffect(() => {
        if (courseData && courseList.length > 0 && formikRef.current) {
            const selectedProgram = courseList.find(
                item => item.courseId === courseData.courseId
            );
            if (selectedProgram) {
                handleChaneProgram({
                    value: selectedProgram.courseId,
                    label: selectedProgram.courseName,
                    data: selectedProgram
                });
                setCourseData(null);
            }
        }
    }, [courseList, courseData]);


    const handleChaneProgram = (selected) => {

        const { setFieldValue } = formikRef.current;

        if (!selected) return;

        // If Add New clicked
        if (selected.value === 0) {
            setShowCourseModal(true);
            return;
        }

        const courseData = selected.data;
        if (!courseData) return;

        const newOrgData = organizerList.find(
            item => item.organizerId === courseData.organizerId
        );

        const fromDate = new Date(courseData.fromDate);
        const toDate = new Date(courseData.toDate);

        setFieldValue("courseId", selected.value);
        setFieldValue("fromDate", fromDate);
        setFieldValue("toDate", toDate);
        setFieldValue("organizer", newOrgData ? newOrgData.organizer : "");
        setFieldValue("courseType", courseData ? courseData.courseType : "");
        setFieldValue("venue", courseData ? courseData.venue : "");
        setFieldValue("registrationFee", courseData ? courseData.offlineRegistrationFee : 0);
        setFieldValue("onlineRegistrationFee", courseData ? courseData.onlineRegistrationFee : 0);
        setFieldValue("reference", newOrgData ? `${newOrgData.organizer} - Calendar` : "");

        calculateDuration(fromDate, toDate, setFieldValue);

        const fees = [];
        if (courseData.offlineRegistrationFee > 0) {
            fees.push({
                value: courseData.offlineRegistrationFee,
                label: `Offline - ₹${courseData.offlineRegistrationFee}`,
            });
        }
        if (courseData.onlineRegistrationFee > 0) {
            fees.push({
                value: courseData.onlineRegistrationFee,
                label: `Online - ₹${courseData.onlineRegistrationFee}`,
            });
        }
        setFeeOptions(fees);
    };

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-4">
                {requisitionId ? "Edit Mandatory Training" : "Add  Mandatory Training"}
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="p-5">
                <div className="card p-3 shadow-sm border-rounded">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, isSubmitting, setFieldTouched }) => (
                            <Form autoComplete="off">
                                <div className="row g-3 custom-modal-body p-3">


                                    <div className="col-md-4">
                                        <label className="form-label">Participant
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            options={employeeOptions}
                                            value={employeeOptions.find(
                                                (option) => option.value === Number(values.initiatingOfficer)
                                            ) || null}
                                            onChange={(selectedOption) => {
                                                setFieldValue("initiatingOfficer", selectedOption?.value || null);
                                            }}
                                            placeholder="Select Participant"
                                            isSearchable
                                            isClearable
                                        />
                                        <ErrorMessage name="initiatingOfficer" component="div" className="text-danger small" />
                                    </div>


                                    <div className="col-md-4">
                                        <label className="form-label">Name of the Course
                                            <span className="text-danger">*</span>
                                        </label>
                                        <div className="text-start">
                                            <Select
                                                options={courseOptions}
                                                value={courseOptions.find((item) => item.value === values.courseId) || null}
                                                placeholder="Select Course"
                                                isSearchable
                                                onChange={(selected) => handleChaneProgram(selected)}
                                            />
                                        </div>
                                        <ErrorMessage name="courseId" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Course Type
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="courseType" type="text" className="form-control" disabled />
                                        <ErrorMessage name="courseType" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Organized By
                                            <span className="text-danger">*</span>
                                        </label>
                                        <Field name="organizer" type="text" className="form-control" disabled />
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
                                            minDate={values.fromDate || null}
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
                                        <label className="form-label">Registration Fee (₹)</label>

                                        {values.registrationFee === 0 ? (

                                            <Field
                                                name="registrationFee"
                                                type="number"
                                                className="form-control"
                                                disabled
                                            />

                                        ) : feeOptions.length > 1 ? (

                                            <Select
                                                options={feeOptions}
                                                value={feeOptions.find(fee => fee.value === values.registrationFee) || null}
                                                placeholder="Select Fee Type"
                                                onChange={(selected) => {
                                                    setFieldValue("registrationFee", selected ? selected.value : 0);
                                                }}
                                            />

                                        ) : (

                                            <Field
                                                name="registrationFee"
                                                type="number"
                                                className="form-control"
                                                disabled
                                            />

                                        )}

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


                                    <div className="col-md-12">
                                        <label className="form-label">Remarks</label>
                                        <Field name="remarks" as="textarea" rows={3} className="form-control" />
                                        <ErrorMessage name="remarks" component="div" className="invalid-msg" />
                                    </div>

                                </div>

                                <div className="text-center mt-4">
                                    <button type="submit"
                                        className={requisitionId ? `update` : `submit`}
                                    >
                                        {requisitionId ? `update` : `submit`}
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

            {showCourseModal && (
                <CourseModal
                    showProgramModal={showCourseModal}
                    setShowProgramModal={setShowCourseModal}
                    setCourseData={setCourseData}
                    fetchPrograms={fetchPrograms}
                />
            )}

        </div>
    )
};

export default MandatoryTrainingAddEdit;