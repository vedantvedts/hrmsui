import { useState } from "react";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import Select from "react-select";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { addCalenderData, calendarFileDownload, getAgencies, getCalenderList } from "../../service/training.service";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { format } from "date-fns";
import { FaDownload } from "react-icons/fa6";

const Calendar = () => {

    const [calendarList, setCalendarList] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [showMoal, setShowModal] = useState(false);

    const currentYear = new Date().getFullYear();
    const range = 20;
    const pageSize = 4;

    const years = Array.from(
        { length: range * 2 + 1 },
        (_, i) => currentYear - range + i
    );

    const [selectedYear, setSelectedYear] = useState(currentYear);

    const currentIndex = years.indexOf(currentYear);
    const [startIndex, setStartIndex] = useState(
        Math.max(0, currentIndex - Math.floor(pageSize / 2))
    );
    const visibleYears = years.slice(startIndex, startIndex + pageSize);

    const handleNext = () => {
        if (startIndex + pageSize < years.length) {
            setStartIndex(startIndex + pageSize);
        }
    };

    const handlePrev = () => {
        if (startIndex - pageSize >= 0) {
            setStartIndex(startIndex - pageSize);
        }
    };

    useEffect(() => {
        if (selectedYear) {
            fetchCalenderList(selectedYear);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchCalenderList = async (year) => {
        try {
            const response = await getCalenderList(year);
            setCalendarList(response?.data || []);
        } catch (error) {
            console.error("Error fetching calender list:", error);
            Swal.fire("Error", "Failed to fetch calender data. Please try again later.", "error");
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await getAgencies();
            setAgencyList(response?.data || []);
        } catch (error) {
            console.error("Error fetching agencies:", error);
            Swal.fire("Error", "Failed to fetch agency data. Please try again later.", "error");
        }
    };

    const [initialValues, setInitialValues] = useState({
        organizerId: "",
        trainingName: "",
        file: null,
    });

    const validationSchema = Yup.object().shape({
        organizerId: Yup.string().required("Agency is required"),
        trainingName: Yup.string().required("Training Name is required"),
        file: Yup.mixed().required("File is required"),
    });

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.agency, sortable: true, align: 'text-center' },
        { name: "Training Name", selector: (row) => row.trainingName, sortable: true, align: 'text-center' },
        { name: "Uploaded Date", selector: (row) => row.uploadDate, sortable: true, align: 'text-center' },
        { name: "File", selector: (row) => row.file, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return calendarList.map((data, index) => ({
            sn: index + 1,
            agency: data.agency,
            trainingName: data.trainingName,
            uploadDate: data.createdDate ? format(new Date(data.createdDate), "dd-MM-yyyy hh:mm a") : "-",
            file: data.fileName ?
                <button className="download-btn"
                    onClick={() => { handleDownload(data.calendarId) }}>
                    <FaDownload />
                </button>
                : "-",
        }));
    }

    const handleDownload = async (id) => {
        let response = await calendarFileDownload(id);

        const { data, fileName, contentType } = response;

        if (data === '0') {
            Swal.fire("Error", "File not found", "error");
            return;
        }

        const blob = new Blob([data], { type: contentType });

        if (contentType === "application/pdf") {
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
        } else {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    };

    const handleAdd = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {

            const dto = {
                ...values,
                agencyId: values.agencyId,
                trainingName: values.trainingName,
                year: selectedYear,
            }

            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await addCalenderData(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                closeModal();
                resetForm();
                fetchCalenderList(selectedYear);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const usedAgencyIds = new Set(
        calendarList.map(item => item?.organizerId)
    );

    const agencyOptions = agencyList
        .filter(data => !usedAgencyIds.has(data?.organizerId))
        .map(data => ({
            value: data?.organizerId,
            label: data?.organizer
        }));

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Calendar List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex justify-content-end">
                <div className="modern-year-picker me-3">

                    <div className="year-header">
                        <span className="year-title">Select Year</span>
                        <span className="year-selected">{selectedYear}</span>
                    </div>

                    <div className="year-body">
                        <button
                            className="nav-btn me-2"
                            onClick={handlePrev}
                            disabled={startIndex === 0}
                        >
                            <FaArrowLeft />
                        </button>

                        <div className="year-list">
                            {visibleYears.map((year) => (
                                <button
                                    key={year}
                                    className={`year-pill ${selectedYear === year ? "active" : ""
                                        }`}
                                    onClick={() => setSelectedYear(year)}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>

                        <button
                            className="nav-btn ms-2"
                            onClick={handleNext}
                            disabled={startIndex + pageSize >= years.length}
                        >
                            <FaArrowRight />
                        </button>
                    </div>

                </div>
            </div>

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

            {showMoal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={closeModal}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title"><span className="cs-head-text">Add Calender Data</span></h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        enableReinitialize
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values, setFieldValue, isSubmitting, isValid, errors, touched, setFieldTouched, setFieldError }) => (
                                            <Form autoComplete="off">

                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Organizer</label>
                                                        <Select
                                                            className="cs-select"
                                                            options={agencyOptions}
                                                            value={agencyOptions.find(o => o.value === values.agencyId)}
                                                            onChange={o => setFieldValue("organizerId", o?.value || "")}
                                                        />
                                                        <ErrorMessage name="organizerId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">Training Name</label>
                                                        <Field name="trainingName" type="text" className="form-control" />
                                                        <ErrorMessage name="trainingName" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">Upload File</label>
                                                        <input name="file" type="file" className="form-control" onChange={e => setFieldValue("file", e.currentTarget.files[0])} />
                                                        <ErrorMessage name="file" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button type="submit"
                                                        className="submit"
                                                        disabled={isSubmitting || !isValid}
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={closeModal}
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

export default Calendar;