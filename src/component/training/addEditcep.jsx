import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/Navbar';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { getDivisions, handleApiError } from "../../service/master.service";
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import * as Yup from "yup";
import "react-datepicker/dist/react-datepicker.css";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { AddCepData, editCepData, getCepDataById } from '../../service/training.service';
import Select from "react-select";
import { format } from "date-fns";
import { useLocation, useNavigate } from 'react-router-dom';

const AddEditCepComponent = () => {

  const navigate = useNavigate();
  const [divisionList, setDivisionList] = useState([]);

  const divisionOptions = divisionList.map((div) => ({
    label: div.divisionCode,
    value: div.divisionId,
  }));

  const location = useLocation();
  const editData = location.state?.cepItem || null;
  const isEdit = !!editData;

  const [intialvalues, setInitialValues] = useState({
    divisionId: editData?.divisionId || null,
    divisionCode: editData?.divisionCode || "",
    fromDate: editData?.fromDate ? new Date(editData.fromDate) : null,
    toDate: editData?.toDate ? new Date(editData.toDate) : null,
    duration: editData?.duration || "",
    noOfParticipants: editData?.noOfParticipants || "",
    totalAmount: editData?.totalAmount || "",
    amountSpent: editData?.amountSpent || "",
    comments: editData?.comments || "",
  });


  const validationSchema = Yup.object({

    divisionId: Yup.string()
      .nullable()
      .required("Division is required"),

    fromDate: Yup.date()
      .nullable()
      .typeError("Invalid From Date")
      .required("From Date is required"),

    toDate: Yup.date()
      .nullable()
      .typeError("Invalid To Date")
      .required("To Date is required")
      .min(Yup.ref("fromDate"), "To Date must be after From Date"),

    noOfParticipants: Yup.number()
      .typeError("No. of Participants must be a number")
      .positive("Must be greater than 0")
      .integer("Must be a whole number")
      .required("No. of Participants is required"),

    totalAmount: Yup.number()
      .typeError("Total Amount must be a number")
      .positive("Must be greater than 0")
      .required("Total Amount is required"),

    amountSpent: Yup.number()
      .typeError("Amount Spent must be a number")
      .positive("Must be greater than 0")
      .required("Amount Spent is required"),

    comments: Yup.string()
      .trim()
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment cannot exceed 500 characters")
      .required("Comment is required"),

  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        ...values,
        fromDate: values.fromDate
          ? format(values.fromDate, "yyyy-MM-dd")
          : null,
        toDate: values.toDate
          ? format(values.toDate, "yyyy-MM-dd")
          : null,
      };

      const confirm = await AlertConfirmation({
        title: "Are you sure!",
        message: "",
      });

      if (!confirm) return;

      const response = isEdit
        ? await editCepData({ ...payload, cepId: editData?.cepId })
        : await AddCepData(payload);

      if (response && response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || (isEdit ? "CEP updated successfully!" : "CEP added successfully!"),
          showConfirmButton: false,
          timer: 1500,
        });

        resetForm();
        navigate("/cep");
      } else {
        Swal.fire("Warning", response?.message || "Something went wrong", "warning");
      }

    } catch (error) {
      console.error("Error:", error);

      Swal.fire("Warning", handleApiError ? handleApiError(error) : "Something went wrong", "warning");

    } finally {
      setSubmitting(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await getDivisions();
      setDivisionList(response?.data || []);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      Swal.fire("Error", "Failed to fetch division data. Please try again later.", "error");
    }
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

  const fetchCepDatabyId = async (id) => {
    try {
      const response = await getCepDataById(id);
      const data = response?.data;
      setInitialValues({
        ...data,
        fromDate: data?.fromDate ? new Date(data.fromDate) : null,
        toDate: data?.toDate ? new Date(data.toDate) : null,
      });
    } catch (error) {
      console.error("Error fetching getCepDataById:", error);
    }
  };

  useEffect(() => {

    fetchDivisions();
    if (isEdit && editData?.cepId) {
      fetchCepDatabyId(editData.cepId);
    }
  }, []);

  return (
    <div>
      <Navbar />
      <h3 className="fancy-heading mt-3">
              {isEdit ? "Edit CEP" : "Add CEP"}
        <span className="underline-glow">
          <span className="pulse-dot"></span>
          <span className="pulse-dot"></span>
          <span className="pulse-dot"></span>
        </span>
      </h3>


      <div className="p-5">
        <div className="card p-3 shadow-sm border-rounded">

          <Formik
            initialValues={intialvalues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >

            {({ values, handleChange, setFieldValue }) => (

              <Form autoComplete="off">

                <div className="row g-3 custom-modal-body p-3">
                  <div className="col-md-2">
                    <label className="form-label">Division</label>
                    <Select
                      options={divisionOptions}
                      value={
                        divisionOptions.find(
                          (option) => option.value === Number(values.divisionId)
                        ) || null
                      }
                      onChange={(selectedOption) => {
                        setFieldValue("divisionId", selectedOption?.value || null);
                        setFieldValue("divisionCode", selectedOption?.label || "");
                      }}
                      placeholder="Select Division Code"
                      isSearchable
                      isClearable
                    />
                    <ErrorMessage name="divisionId" component="div" className="text-danger small" />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">From Date</label>
                    <DatePicker
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


                  <div className="col-md-3">
                    <label className="form-label">To Date</label>
                    <DatePicker
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
                      minDate={values.fromDate}
                      onKeyDown={(event) => event.preventDefault()}
                    />
                    <ErrorMessage name="toDate" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">Duration (Days)</label>
                    <Field name="duration" type="number" className="form-control" disabled />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">No Of Participants</label>
                    <Field name="noOfParticipants" type="number" className="form-control" />
                    <ErrorMessage name="noOfParticipants" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">Total Amount</label>
                    <Field name="totalAmount" type="number" className="form-control" />
                    <ErrorMessage name="totalAmount" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">Amount Spent</label>
                    <Field name="amountSpent" type="number" className="form-control" />
                    <ErrorMessage name="amountSpent" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-8">
                    <label className="form-label">Comments</label>
                    <Field name="comments" type="text" className="form-control" />
                    <ErrorMessage name="comments" component="div" className="text-danger small" />
                  </div>

                </div>


                <div className="text-center mt-3">
                  <button
                    type="btn"
                    className={`btn ${isEdit ? "update" : "submit"}`}
                  >
                    {isEdit ? "UPDATE" : "SUBMIT"}
                  </button>
                  <button
                    type="button"
                    className="back"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>

                </div>

              </Form>

            )}

          </Formik>

        </div>
      </div>
    </div>
  );
};

export default AddEditCepComponent;