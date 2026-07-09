import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { usePermission } from "../../common/usePermission";

import {
    getCashLimitList,
    addCashLimit,
    updateCashLimit
} from "../../service/admin.service";
import { format } from "date-fns";

const CashLimit = () => {

    const { canView, canAdd, canEdit } = usePermission("Cash Limit");
    const [cashLimitList, setCashLimitList] = useState([]);
    const [filteredCashLimitList, setFilteredCashLimitList] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const [initialValues, setInitialValues] = useState({
        cashLimitId: "",
        cashLimit: "",
        fromDate: null,
        toDate: null
    });

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;

    };

    const getNextFromDate = () => {

        if (cashLimitList.length === 0) {
            return null;
        }

        const latestRecord = cashLimitList[0];

        if (!latestRecord.toDate) {
            return null;
        }

        const date = new Date(latestRecord.toDate);
        date.setDate(date.getDate() + 1);

        return date;
    };

    const formatCurrency = (amount) => {
        if (!amount) return "-";
        return new Intl.NumberFormat("en-IN", {
            currency: "INR",
            minimumFractionDigits: 2
        }).format(amount);
    };

    useEffect(() => {
        fetchCashLimitList();
    }, []);

    useEffect(() => {
        if (editData) {
            setInitialValues({
                cashLimitId: editData.cashLimitId || "",
                cashLimit: editData.cashLimit || "",
                fromDate: editData.fromDate ? new Date(editData.fromDate) : null,
                toDate: editData.toDate ? new Date(editData.toDate) : null
            });
        }
    }, [editData]);

    const fetchCashLimitList = async () => {

        try {
            const response = await getCashLimitList();
            setCashLimitList(response?.data || []);
            setFilteredCashLimitList(response?.data || []);

        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                "Unable to fetch Cash Limit List",
                "error"
            );
        }
    };

    const handleAdd = () => {

        setEditData(null);

        const nextFromDate = getNextFromDate();

        setInitialValues({
            cashLimitId: "",
            cashLimit: "",
            fromDate: nextFromDate,
            toDate: null
        });
        setShowEditModal(true);
    };

    const handleEdit = (item) => {
        setEditData(item);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    const validationSchema = Yup.object({

        cashLimit: Yup.number()
            .typeError("Cash Limit must be numeric")
            .required("Cash Limit is required")
            .positive("Cash Limit must be greater than zero")
            .test(
                "cash-limit-validation",
                "Cash Limit can have up to 12 digits ",
                (value) => {
                    if (value === undefined || value === null) return true;

                    const str = value.toString();
                    const [integerPart, decimalPart] = str.split(".");

                    return (
                        integerPart.length <= 12 &&
                        (!decimalPart || decimalPart.length <= 2)
                    );
                }
            ),

        fromDate: Yup.date()
            .nullable()
            .when([], {

                is: () => cashLimitList.length === 0,

                then: (schema) =>
                    schema.required("From Date is required"),
                otherwise: (schema) =>
                    schema.notRequired()
            }),

        toDate: Yup.date()
            .required("To Date is required")
            .min(
                Yup.ref("fromDate"),
                "To Date should be greater than or equal to From Date"
            )
    });

    const columns = [
        {
            name: "SN",
            selector: row => row.sn,
            sortable: true,
            align: "text-center"
        },
        {
            name: "Cash Limit",
            selector: row => row.cashLimit,
            sortable: true,
            align: "text-right"
        },
        {
            name: "From Date",
            selector: row => row.fromDate,
            sortable: true,
            align: "text-center"
        },
        {
            name: "To Date",
            selector: row => row.toDate,
            sortable: true,
            align: "text-center"
        },
        {
            name: "Created By",
            selector: row => row.createdBy,
            sortable: true,
            align: "text-center"
        },
        {
            name: "Status",
            selector: row => row.status,
            sortable: true,
            align: "text-center"
        },
        {
            name: "Action",
            selector: row => row.action,
            align: "text-center"
        }
    ];

    const mappedData = () => {

        return filteredCashLimitList.map((item, index) => ({

            sn: index + 1,
            cashLimit: formatCurrency(item.cashLimit),
            createdBy: item.createdBy,
            fromDate: formatDate(item.fromDate),
            toDate: formatDate(item.toDate),

            status:
                item.isActive === 1 ?

                    <span className="badge bg-success">
                        Active
                    </span>
                    :
                    <span className="badge bg-danger">
                        Inactive
                    </span>,

            action: (
                <>
                    <Tooltip
                        id="Tooltip"
                        className="text-white"
                    />

                    {canEdit && item.isActive === 1 && (
                        <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEdit(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Edit"
                        >
                            <FaEdit />
                        </button>
                    )}

                </>

            )

        }));

    };

    const handleSubmit = async ( values, { resetForm, setSubmitting }) => {
        try {
            const confirm = await AlertConfirmation({
                title: "Are you sure to submit?",
                message: ""
            });

            if (!confirm) {
                setSubmitting(false);
                return;
            }

            let response;

            const payload = {
                cashLimit: values.cashLimit,
                fromDate: values.fromDate
                    ? format(values.fromDate, "yyyy-MM-dd")
                    : null,
                toDate: values.toDate
                    ? format(values.toDate, "yyyy-MM-dd")
                    : null
            };

            if (editData != null) {
                response = await updateCashLimit(
                    values.cashLimitId,
                    payload
                );

            } else {
                response = await addCashLimit(payload);
            }

            if (response.success) {
                Swal.fire(
                    "Success",
                    response.message,
                    "success"
                );
                closeEditModal();
                fetchCashLimitList();
                resetForm();

            } else {
                Swal.fire(
                    "Warning",
                    response.message,
                    "warning"
                );
            }

        } catch (error) {
            console.error(error);
            Swal.fire(
                "Error",
                error?.response?.data?.message ||
                "Something went wrong",
                "error"
            );
        }
        finally {
            setSubmitting(false);
        }

    };

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Cash Limit
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                <Datatable
                    columns={columns}
                    data={mappedData()}
                />

                {canAdd &&
                    <button
                        type="button"
                        className="add mt-2"
                        onClick={handleAdd}
                    >
                        Add New
                    </button>
                }
            </div>

            {showEditModal && (
                <>
                    <div
                        className="modal-backdrop show custom-backdrop"
                        onClick={closeEditModal}
                    ></div>

                    <div
                        className="modal d-block custom-modal"
                        tabIndex="-1"
                        role="dialog"
                    >
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">

                                    <h5 className="modal-title">
                                        <span className="cs-head-text">
                                            {editData ? "Update Cash Limit" : "Add Cash Limit"}
                                        </span>
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeEditModal}
                                    ></button>

                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        enableReinitialize
                                        onSubmit={handleSubmit}
                                    >
                                        {({
                                            values,
                                            setFieldValue,
                                            isSubmitting,
                                            isValid
                                        }) => (
                                            <Form autoComplete="off">

                                                <div className="row">

                                                    {/* Cash Limit */}
                                                    <div className="col-md-3">
                                                        <label className="form-label mt-2">
                                                            Cash Limit
                                                        </label>
                                                    </div>

                                                    <div className="col-md-5">
                                                        <Field
                                                            name="cashLimit"
                                                            type="number"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage
                                                            name="cashLimit"
                                                            component="div"
                                                            className="invalid-msg"
                                                        />
                                                    </div>

                                                </div>

                                                <div className="row mt-3">

                                                    {/* Validity Period */}
                                                    <div className="col-md-3">
                                                        <label className="form-label mt-2">
                                                            Validity Period
                                                        </label>
                                                    </div>

                                                    <div className="col-md-4">
                                                        <DatePicker
                                                            selected={values.fromDate}
                                                            onChange={(date) =>
                                                                setFieldValue("fromDate", date)
                                                            }
                                                            dateFormat="dd-MM-yyyy"
                                                            className="form-control"
                                                            placeholderText="From Date"
                                                            disabled={cashLimitList.length > 0 && !editData}
                                                        />
                                                        <ErrorMessage
                                                            name="fromDate"
                                                            component="div"
                                                            className="invalid-msg"
                                                        />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <DatePicker
                                                            selected={values.toDate}
                                                            onChange={(date) => setFieldValue("toDate", date)}
                                                            dateFormat="dd-MM-yyyy"
                                                            className="form-control"
                                                            placeholderText="To Date"
                                                            minDate={values.fromDate}
                                                        />
                                                        <ErrorMessage
                                                            name="toDate"
                                                            component="div"
                                                            className="invalid-msg"
                                                        />
                                                    </div>

                                                </div>

                                                <div className="text-center mt-4">

                                                    <button
                                                        type="submit"
                                                        className={editData ? "update" : "submit"}
                                                        disabled={isSubmitting || !isValid}
                                                    >
                                                        {editData ? "Update" : "Submit"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="back ms-2"
                                                        onClick={closeEditModal}
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

export default CashLimit;