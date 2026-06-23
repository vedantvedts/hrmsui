import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { addYears, format, startOfYear } from "date-fns";
import Navbar from "../navbar/Navbar";
import { ErrorMessage, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import { getEmployees, getSignAuthorityRoles, handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { FaEdit } from "react-icons/fa";
import { usePermission } from "../../common/usePermission";
import { Tooltip } from "react-tooltip";
import { getHandingOverList, insertHandingOver, updateHandingOver, revokeHandingOver } from "../../service/admin.service";
import { BiRevision } from "react-icons/bi";

const HandingOverList = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Handing Over");

    const [hanidnOverList, setHanidnOverList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const roleName = localStorage.getItem("roleName");
    const loginEmpId = localStorage.getItem("empId");
    const [showModal, setShowModal] = useState(false);
    const [editdata, setEditData] = useState(null);
    const fromDate = startOfYear(new Date());
    const toDate = new Date();
    const [fromDateSel, setFromDateSel] = useState(fromDate);
    const [toDateSel, setToDateSel] = useState(toDate);


    useEffect(() => {
        fetchHandingOverList();
        fetchEmployees();
    }, [fromDateSel, toDateSel]);

    const fetchHandingOverList = async () => {
        try {
            const response = await getHandingOverList(format(fromDateSel, "yyyy-MM-dd"), format(toDateSel, "yyyy-MM-dd"));
            setHanidnOverList(response?.data || []);
        } catch (error) {
            console.error("Error fetching sign auth list:", error);
            Swal.fire("Error", "Failed to fetch sign auth data. Please try again later.", "error");
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(loginEmpId, "ROLE_ADMIN");
            const res = response?.data || [];
            setEmployeeList(
                res.map((e) => ({
                    value: e.empId,
                    label: `${e.empName}, ${e.empDesigName}`,
                    divisionId: e.divisionId,
                }))
            );
        } catch (error) {
            console.error("Error fetching employees:", error);
            Swal.fire("Error", "Failed to fetch employee data. Please try again later.", "error");
        }
    };



    const [initialValues, setInitialValues] = useState({
        fromEmpId: Number(loginEmpId) || "",
        toEmpId: "",
        fromDate: new Date() || null,
        toDate: new Date() || null,
    });

    const validationSchema = Yup.object({
        fromEmpId: Yup.string().required("From Officer required"),
        toEmpId: Yup.string().required("To Officer required"),
        fromDate: Yup.date().required("Valid From required"),
        toDate: Yup.date()
            .required("Valid Upto required")
            .min(Yup.ref("fromDate"), "Valid Upto cannot be earlier than Valid From"),
    });

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: "text-center" },
        { name: "Handing Over Employee", selector: (row) => row.fromEmpName, sortable: true, align: "text-left" },
        { name: "Hainding OverTo ", selector: (row) => row.toEmpName, sortable: true, align: "text-left" },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: "text-center" },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: "text-center" },
        { name: "Created Date", selector: (row) => row.createdDate, sortable: true, align: "text-center" },
        { name: "Status", selector: (row) => row.status, sortable: true, align: "text-center" },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return hanidnOverList.map((item, index) => {

            return {
                sn: `${index + 1}`,
                fromEmpName: `${item?.fromEmpName}` || "-",
                toEmpName: `${item?.toEmpName}` || "-",
                fromDate: item?.fromDate
                    ? format(new Date(item.fromDate), "dd-MM-yyyy")
                    : "-",

                toDate: item?.toDate
                    ? format(new Date(item.toDate), "dd-MM-yyyy")
                    : "-",
                createdDate: item?.createdDate ? format(new Date(item.createdDate), "dd-MM-yyyy hh:mm:ss a") : "-",

                status: item?.isActive === 1
                    ? (item.toDate && new Date(item.toDate) < today ? <span className="text-warning fw-bold">Expired</span> : <span className="text-success fw-bold">Active</span>)
                    : <span className="text-danger fw-bold">Revoked</span>,

                action: (
                    <>
                        <Tooltip id="Tooltip" className='text-white' />
                        {item.isActive === 1 && item.toDate && new Date(item.toDate) > today &&
                            <>
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => handleEdit(item)}
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content="Edit"
                                    data-tooltip-place="top"
                                >
                                    <FaEdit className="fs-6" />
                                </button>
                                <button
                                    className="btn btn-sm btn-danger me-2"
                                    onClick={() => handleRevoke(item)}
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content="Revoke"
                                    data-tooltip-place="top"
                                >
                                    <BiRevision className="fs-6" />
                                </button>
                            </>
                        }

                    </>
                ),
            };
        });
    };

    const handleAdd = () => {
        setShowModal(true);
        setEditData(null);
        setInitialValues({
            fromEmpId: Number(loginEmpId) || "",
            toEmpId: employeeList?.filter(emp => emp.value !== Number(loginEmpId))[0]?.value || "",
            fromDate: new Date() || null,
            toDate: new Date() || null,
        });
    };

    const handleEdit = (item) => {
        setEditData(item);
        setInitialValues({
            fromEmpId: item.fromEmpId || "",
            toEmpId: item.toEmpId || "",
            fromDate: item.fromDate ? new Date(item.fromDate) : "",
            toDate: item.toDate ? new Date(item.toDate) : "",
        });
        setShowModal(true);
    };

    const handleRevoke = async (item) => {
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure to revoke?", message: '' });
            if (!confirm) {
                return;
            }
            const response = await revokeHandingOver(item.handingOverId);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchHandingOverList();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const payload = {
                handingOverId: editdata?.handingOverId || null,
                fromEmpId: values.fromEmpId,
                toEmpId: values.toEmpId,
                fromDate: values.fromDate ? format(values.fromDate, "yyyy-MM-dd") : null,
                toDate: values.toDate ? format(values.toDate, "yyyy-MM-dd") : null,
            }
            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editdata ? await updateHandingOver(payload) : await insertHandingOver(payload);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                setShowModal(false);
                fetchHandingOverList();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Handing Over List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>
            
            <div className="d-flex gap-3 justify-content-end me-3 flex-wrap">
                <div className="col-auto">
                    <div className="d-flex align-items-center">
                        <label className="fw-bold me-2 mb-0 text-nowrap d-inline-block">
                            From :
                        </label>
                        <DatePicker
                            selected={fromDateSel}
                            onChange={(newValue) => setFromDateSel(newValue)}
                            className="form-control"
                            placeholderText="From Date"
                            dateFormat="dd-MM-yyyy"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            onKeyDown={(event) => event.preventDefault()}
                            wrapperClassName="d-inline-block"
                        />
                    </div>
                </div>

                <div className="col-auto">
                    <div className="d-flex align-items-center">
                        <label className="fw-bold me-2 mb-0 text-nowrap d-inline-block">
                            To :
                        </label>
                        <DatePicker
                            selected={toDateSel}
                            onChange={(newValue) => setToDateSel(newValue)}
                            className="form-control"
                            placeholderText="To Date"
                            dateFormat="dd-MM-yyyy"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            onKeyDown={(event) => event.preventDefault()}
                            wrapperClassName="d-inline-block"
                        />
                    </div>
                </div>
            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd &&
                    <button
                        className="add"
                        onClick={handleAdd}>
                        ADD NEW
                    </button>
                }
            </div>

            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title"><span className="cs-head-text">{editdata ? "Update Handing Over" : "Add Handing Over"}</span></h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <Formik
                                        initialValues={initialValues}
                                        enableReinitialize
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values, setFieldValue, isSubmitting }) => (
                                            <Form>
                                                {/* Officer */}
                                                <div className="row mb-3 align-items-center">
                                                    <label className="col-md-4 form-label text-start">
                                                        Handing Over From <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-md-6">
                                                        <Select
                                                            options={employeeList}
                                                            value={
                                                                employeeList?.find(
                                                                    (e) => e.value === values.fromEmpId
                                                                ) || null
                                                            }
                                                            onChange={(opt) => {
                                                                const selectedEmpId = opt?.value || "";

                                                                setFieldValue("fromEmpId", selectedEmpId, true);

                                                                if (selectedEmpId === values.toEmpId) {
                                                                    const nextEmployee = employeeList.find(
                                                                        emp => emp.value !== selectedEmpId
                                                                    );

                                                                    setFieldValue("toEmpId", nextEmployee?.value || "");
                                                                }
                                                            }}
                                                            placeholder="Select Officer"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="fromEmpId" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                {/* Role */}
                                                <div className="row mb-3 align-items-center">
                                                    <label className="col-md-4 form-label text-start">
                                                        Handing Over To <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-md-6">
                                                        <Select
                                                            options={employeeList?.filter(
                                                                emp => emp.value !== values.fromEmpId
                                                            )}// Exclude selected fromEmpId
                                                            value={
                                                                employeeList?.find(
                                                                    (e) => e.value === values.toEmpId
                                                                ) || null
                                                            }
                                                            onChange={(opt) => {
                                                                setFieldValue("toEmpId", opt?.value || "", true);
                                                            }}
                                                            placeholder="Select Officer"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="toEmpId" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                {/* Dates */}
                                                <div className="row mb-3 align-items-center">
                                                    <label className="col-md-4 form-label text-start">
                                                        Period <span className="text-danger">*</span>
                                                    </label>

                                                    <div className="col-md-3">
                                                        <DatePicker
                                                            className="form-control"
                                                            selected={values.fromDate}
                                                            onChange={(d) => {
                                                                setFieldValue("fromDate", d);

                                                                if (values.toDate && d > values.toDate) {
                                                                    setFieldValue("toDate", null);
                                                                }
                                                            }}
                                                            dateFormat="dd-MM-yyyy"
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            popperPlacement="bottom-start"
                                                            popperProps={{
                                                                strategy: "fixed"
                                                            }}
                                                            dropdownMode="select"
                                                            onKeyDown={(e) => e.preventDefault()}
                                                            minDate={new Date()}
                                                        />
                                                        <ErrorMessage name="fromDate" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <DatePicker
                                                            className="form-control"
                                                            selected={values.toDate}
                                                            onChange={(d) =>
                                                                setFieldValue("toDate", d)
                                                            }
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="Select Date"
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            popperPlacement="bottom-start"
                                                            popperProps={{
                                                                strategy: "fixed"
                                                            }}
                                                            minDate={values.fromDate}
                                                            onKeyDown={(e) => e.preventDefault()}
                                                            minDate={values.fromDate || new Date()}
                                                        />
                                                        <ErrorMessage name="toDate" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button type="submit"
                                                        className={editdata ? `update` : `submit`}
                                                        disabled={isSubmitting}
                                                    >
                                                        {editdata ? "Update" : "Submit"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={() => setShowModal(false)}
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

export default HandingOverList;