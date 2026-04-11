import React, { useEffect, useState } from "react"
import Navbar from '../navbar/Navbar';
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from 'react-datepicker';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { getEmployees, getProjectList, handleApiError } from "../../service/master.service";
import { Adddistrubutiondata, EditDistribution  ,getDistributionByID} from '../../service/training.service';
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { format } from "date-fns";
import Swal from "sweetalert2";

const AddEditDistributionComponent = () => {

      const navigate = useNavigate();
      const location = useLocation();

      const editItem = location.state?.item || null;
      const isEdit = !!editItem;

      const [employeeList, setEmployeeList] = useState([]);
      const roleName = localStorage.getItem("roleName");
      const empId = localStorage.getItem("empId");
      const [projectList, setProjectList] = useState([]);


      const initialValues = {
            empId: editItem?.empId || null,
            aoEmpId: editItem?.aoEmpId || null,
            roEmpId: editItem?.roEmpId || null,
            projectId: editItem?.projectId || null,
           
            appointment: editItem?.appointment || "",
            techActivity: editItem?.techActivity || "",
            nonTechActivity: editItem?.nonTechActivity || "",
      };


      const validationSchema = Yup.object({
           

            empId: Yup.number()
                  .nullable()
                  .required("Employee is required"),

            aoEmpId: Yup.number()
                  .nullable()
                  .required("AO Officer is required")
                  .test(
                        "not-same-as-empId",
                        "AO Officer cannot be the same as Employee",
                        function (value) {
                              return value !== this.parent.empId;
                        }
                  ),

            roEmpId: Yup.number()
                  .nullable()
                  .required("RO Officer is required")
                  .test(
                        "not-same-as-empId",
                        "RO Officer cannot be the same as Employee",
                        function (value) {
                              return value !== this.parent.empId;
                        }
                  )
                  .test(
                        "not-same-as-aoEmpId",
                        "RO Officer cannot be the same as AO Officer",
                        function (value) {
                              return value !== this.parent.aoEmpId;
                        }
                  ),

            projectId: Yup.number()
                  .nullable()
                  .required("Project is required"),

            appointment: Yup.string()
                  .trim()
                  .max(255, "Appointment must be at most 255 characters")
                  .required("Appointment is required"),

            techActivity: Yup.string()
                  .trim()
                  .max(500, "Tech Activity must be at most 500 characters")
                  .required("Tech Activity is required"),

            nonTechActivity: Yup.string()
                  .trim()
                  .max(500, "Non-Tech Activity must be at most 500 characters")
                  .required("Non-Tech Activity is required"),
      });

      useEffect(() => {
            fetchEmployees();
            fetchProjects();
     if (isEdit && editItem?.distributionId) {
      fetchdistributionByID(editItem.distributionId); 
    }

      }, []);

      const fetchEmployees = async () => {
            try {
                  const response = await getEmployees(empId, roleName);
                  setEmployeeList(response?.data || []);
            } catch (error) {
                  console.error("Error fetching employees:", error);
            }
      };

      const fetchProjects = async () => {
            try {
                  const response = await getProjectList();
                  setProjectList(response?.data || []);
            } catch (error) {
                  console.error("Error fetching projects:", error);
            }
      };

        const fetchdistributionByID = async (id) => {
          try {
            const response = await getDistributionByID(id);
            const data = response?.data;
            initialValues({
              ...data,

            });
          } catch (error) {
            console.error("Error fetching getDistributionByID():", error);
          }
        };

      const employeeOptions = employeeList.map((emp) => ({
            value: emp.empId,
            label: `${emp.title || ""} ${emp.empName || ""}`.trim(),
            data: emp,
      }));

      const projectOptions = projectList.map((project) => ({
            value: project.projectId,
            label: `${project.projectCode} - ${project.projectShortName}`,
            data: project,
      }));


      const handleSubmit = async (values, { setSubmitting, resetForm }) => {
            try {
                  const payload = {
                        ...(isEdit && { distributionId: editItem.distributionId }),
                        empId: values.empId,
                        aoEmpId: values.aoEmpId,
                        roEmpId: values.roEmpId,
                        projectId: values.projectId,
                     
                        appointment: values.appointment.trim(),
                        techActivity: values.techActivity.trim(),
                        nonTechActivity: values.nonTechActivity.trim(),
                  };

                  const confirm = await AlertConfirmation({
                        title: "Are you sure!",
                        message: "",
                  });
                  if (!confirm) return;

                  const response = isEdit
                        ? await EditDistribution(payload)
                        : await Adddistrubutiondata(payload);
 if (response && response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || (isEdit ? "Distribution updated successfully!" : "Distribution added successfully!"),
          showConfirmButton: false,
          timer: 1500,
        });

        resetForm();
        navigate(-1);
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

      return (
            <div>
                  <Navbar />   
                          <h3 className="fancy-heading mt-3">
                              {isEdit ? "Edit Distribution" : "Add Distribution"}
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
                                    onSubmit={handleSubmit}
                                    enableReinitialize 
                              >
                                    {({ values, setFieldValue, setFieldTouched, isSubmitting }) => (
                                          <Form autoComplete="off">

                                                <div className="row g-3 custom-modal-body p-3">
                                                      <div className="col-md-3">
                                                            <label className="form-label">
                                                                  Employee
                                                            </label>
                                                            <Select
                                                                  options={employeeOptions}
                                                                  value={employeeOptions.find(
                                                                        (item) => item.value === Number(values.empId)
                                                                  ) || null}
                                                                  onChange={(selected) => setFieldValue("empId", selected?.value ?? null)}
                                                                  onBlur={() => setFieldTouched("empId", true)}
                                                                  isSearchable
                                                                  placeholder="Select Employee"
                                                            />
                                                            <ErrorMessage name="empId" component="div" className="text-danger small" />
                                                      </div>


                                                      <div className="col-md-3">
                                                            <label className="form-label">
                                                                  AO Officer Name 
                                                            </label>
                                                            <Select
                                                                  options={employeeOptions}
                                                                  value={employeeOptions.find(
                                                                        (item) => item.value === Number(values.aoEmpId)
                                                                  ) || null}
                                                                  onChange={(selected) => setFieldValue("aoEmpId", selected?.value ?? null)}
                                                                  onBlur={() => setFieldTouched("aoEmpId", true)}
                                                                  isSearchable
                                                                  placeholder="Select AO Officer"
                                                            />
                                                            <ErrorMessage name="aoEmpId" component="div" className="text-danger small" />
                                                      </div>


                                                      <div className="col-md-3">
                                                            <label className="form-label">
                                                                  RO Officer Name 
                                                            </label>
                                                            <Select
                                                                  options={employeeOptions}
                                                                  value={employeeOptions.find(
                                                                        (item) => item.value === Number(values.roEmpId)
                                                                  ) || null}
                                                                  onChange={(selected) => setFieldValue("roEmpId", selected?.value ?? null)}
                                                                  onBlur={() => setFieldTouched("roEmpId", true)}
                                                                  isSearchable
                                                                  placeholder="Select RO Officer"
                                                            />
                                                            <ErrorMessage name="roEmpId" component="div" className="text-danger small" />
                                                      </div>


                                                      <div className="col-md-3">
                                                            <label className="form-label">
                                                                  Project Code 
                                                            </label>
                                                            <Select
                                                                  options={projectOptions}
                                                                  value={projectOptions.find(
                                                                        (item) => item.value === Number(values.projectId)
                                                                  ) || null}
                                                                  onChange={(selected) => setFieldValue("projectId", selected?.value ?? null)}
                                                                  onBlur={() => setFieldTouched("projectId", true)}
                                                                  isSearchable
                                                                  placeholder="Select Project"
                                                            />
                                                            <ErrorMessage name="projectId" component="div" className="text-danger small" />
                                                      </div>

                                                      <div className="col-md-2">
                                                            <label className="form-label">
                                                                  Appointment 
                                                            </label>
                                                            <Field
                                                                  name="appointment"
                                                                  type="text"
                                                                  className="form-control"
                                                                  onBlur={(e) => {
                                                                        setFieldValue("appointment", e.target.value.trim());
                                                                        setFieldTouched("appointment", true);
                                                                  }}
                                                            />
                                                            <ErrorMessage name="appointment" component="div" className="text-danger small" />
                                                      </div>


                                                      <div className="col-md-5">
                                                            <label className="form-label">
                                                                  Tech Activity 
                                                            </label>
                                                            <Field
                                                                  as="textarea"
                                                                  name="techActivity"
                                                                  className="form-control"
                                                                  onBlur={(e) => {
                                                                        setFieldValue("techActivity", e.target.value.trim());
                                                                        setFieldTouched("techActivity", true);
                                                                  }}
                                                            />
                                                            <ErrorMessage name="techActivity" component="div" className="text-danger small" />
                                                      </div>

                                                      {/* Non-Tech Activity */}
                                                      <div className="col-md-5">
                                                            <label className="form-label">
                                                                  Non-Tech Activity 
                                                            </label>
                                                            <Field
                                                                  as="textarea"
                                                                  name="nonTechActivity"
                                                                  className="form-control"
                                                                  onBlur={(e) => {
                                                                        setFieldValue("nonTechActivity", e.target.value.trim());
                                                                        setFieldTouched("nonTechActivity", true);
                                                                  }}
                                                            />
                                                            <ErrorMessage name="nonTechActivity" component="div" className="text-danger small" />
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
                                                            className="btn back"
                                                            onClick={() => navigate(-1)}
                                                      >
                                                            BACK
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

export default AddEditDistributionComponent;