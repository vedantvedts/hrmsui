import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import Swal from "sweetalert2";
import { ErrorMessage, Field, Form, Formik } from "formik";
import styles from "./ChangePassword.module.css";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { updatePassWord } from "../../service/admin.service";
import Navbar from "../navbar/Navbar";


const ChangePassword = () => {
    const navigate = useNavigate();

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [invalidChar, setInvalidChar] = useState("");

    const [strength, setStrength] = useState({
        score: 0,
        label: "",
    });

    const initialValues = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    };

    const calculateStrength = (password) => {
        let score = 0;

        const rules = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password),
            nospace: /^\S+$/.test(password),
        };

        Object.values(rules).forEach((r) => r && score++);

        let label = "";
        if (score <= 2) label = "Weak";
        else if (score === 3) label = "Medium";
        else if (score === 4) label = "Strong";
        else label = "Very Strong";

        setStrength({ score, label, rules });
    };


    const validationSchema = Yup.object().shape({
        oldPassword: Yup.string().required("Old password is required"),

        newPassword: Yup.string()
            .required("New password is required")
            .min(8, "At least 8 characters")
            .matches(/^[A-Za-z0-9!@#$%^&*]+$/, "Only !@#$%^&* characters are allowed")
            .matches(/[A-Z]/, "Must include an uppercase letter")
            .matches(/[a-z]/, "Must include a lowercase letter")
            .matches(/[0-9]/, "Must include a number")
            .matches(/[!@#$%^&*]/, "Must include a special character (!@#$%^&*)"),

        confirmPassword: Yup.string()
            .required("Please confirm your password")
            .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
    });


    const handleSubmit = async (values) => {
        const isConfirmed = await AlertConfirmation({
            title: 'Are you sure to change password?',
            message: '',
        });

        if (!isConfirmed) return;

        // Show loading popup
        Swal.fire({
            title: 'Updating Password...',
            text: 'Please wait...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const result = await updatePassWord(values);

            // Close loading popup
            Swal.close();

            if (result === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Password updated successfully!",
                    showConfirmButton: false,
                    timer: 2500,
                });

                navigate("/dashboard");

            } else if (result === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Incorrect old password!",
                    showConfirmButton: false,
                    timer: 2500,
                });

            } else if (result === 422) {
                Swal.fire({
                    icon: "error",
                    title: "New password cannot be the same as the old password!",
                    showConfirmButton: false,
                    timer: 2500,
                });

            } else if (result === 503) {
                Swal.fire({
                    icon: "error",
                    title: "Unable to change password. One of the servers is down!",
                    showConfirmButton: false,
                    timer: 2500,
                });

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Password update failed!",
                    showConfirmButton: false,
                    timer: 2500,
                });
            }

        } catch (error) {
            Swal.close();

            console.error("Error occurred while updating password", error);

            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "There was an issue updating your password.",
            });
        }
    };

    useEffect(() => {
        if (invalidChar) {
            const timer = setTimeout(() => setInvalidChar(""), 2200);
            return () => clearTimeout(timer);
        }
    }, [invalidChar]);


    return (
        <>
            <Navbar />
            <div className={styles.wrapper}>
                <div className={`${styles.card} shadow-lg`}>

                    <div className={styles.headerSection}>
                        <FaLock className={styles.headerIcon} />
                        <span className={styles.headerTitle}>Change Password</span>
                        <p className={styles.headerSubtitle}>
                            Keep your account secure by choosing a strong password.
                        </p>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values }) => (
                            <Form className={styles.formArea}>

                                {/* Old Password */}
                                <div className="mb-3">
                                    <label className={styles.formLabel}>
                                        Old Password <span className="text-danger">*</span>
                                    </label>
                                    <div className={styles.passwordField}>
                                        <Field
                                            name="oldPassword"
                                            type={showOld ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Enter your old password"
                                            onPaste={(e) => e.preventDefault()}
                                            onCopy={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}

                                        />
                                        <span
                                            className={styles.eyeIcon}
                                            onClick={() => setShowOld(!showOld)}
                                        >
                                            {showOld ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    <ErrorMessage
                                        name="oldPassword"
                                        component="div"
                                        className={styles.errorText}
                                    />
                                </div>

                                {/* New Password */}
                                <div className="mb-3">
                                    <label className={styles.formLabel}>
                                        New Password <span className="text-danger">*</span>
                                    </label>
                                    <div className={styles.passwordField}>
                                        <Field
                                            name="newPassword"
                                            type={showNew ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Enter a strong new password"
                                            onPaste={(e) => e.preventDefault()}
                                            onCopy={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}

                                            onKeyUp={(e) => calculateStrength(e.target.value)}
                                            onKeyDown={(e) => {
                                                const allowed = /[A-Za-z0-9!@#$%^&*]/;

                                                if (
                                                    e.key.length === 1 &&   // only printable characters, not Backspace/Tab
                                                    !allowed.test(e.key)
                                                ) {
                                                    e.preventDefault();
                                                    setInvalidChar(e.key);
                                                }
                                            }}
                                        />

                                        <span
                                            className={styles.eyeIcon}
                                            onClick={() => setShowNew(!showNew)}
                                        >
                                            {showNew ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    {invalidChar && (
                                        <div className={styles.invalidCharWarning}>
                                            Character "<strong>{invalidChar}</strong>" is not allowed.
                                            Allowed special characters: <strong>! @ # $ % ^ & *</strong>
                                        </div>
                                    )}

                                    <ErrorMessage
                                        name="newPassword"
                                        component="div"
                                        className={styles.errorText}
                                    />

                                    {/* Strength Meter */}
                                    {values.newPassword && (
                                        <div className={styles.strengthWrapper}>
                                            <div
                                                className={`${styles.strengthBar} ${styles[`strength${strength.score}`]
                                                    }`}
                                            ></div>
                                            <span className={styles.strengthLabel}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-3">
                                    <label className={styles.formLabel}>
                                        Confirm Password <span className="text-danger">*</span>
                                    </label>
                                    <div className={styles.passwordField}>
                                        <Field
                                            name="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Re-enter your new password"
                                            onPaste={(e) => e.preventDefault()}
                                            onCopy={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}

                                        />
                                        <span
                                            className={styles.eyeIcon}
                                            onClick={() => setShowConfirm(!showConfirm)}
                                        >
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    <ErrorMessage
                                        name="confirmPassword"
                                        component="div"
                                        className={styles.errorText}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-2"
                                >
                                    Update Password
                                </button>
                            </Form>
                        )}
                    </Formik>

                    {/* Security Notes */}
                    <div className={styles.securityHint}>
                        <p><strong>Password must include:</strong></p>

                        <ul className={styles.securityHintRules}>
                            <li className={strength.rules?.length ? styles.ok : styles.notOk}>
                                <span>{strength.rules?.length ? "✔" : "✖"}</span> Minimum 8 characters
                            </li>

                            <li className={strength.rules?.uppercase ? styles.ok : styles.notOk}>
                                <span>{strength.rules?.uppercase ? "✔" : "✖"}</span> One uppercase letter (A–Z)
                            </li>

                            <li className={strength.rules?.lowercase ? styles.ok : styles.notOk}>
                                <span>{strength.rules?.lowercase ? "✔" : "✖"}</span> One lowercase letter (a-z)
                            </li>

                            <li className={strength.rules?.number ? styles.ok : styles.notOk}>
                                <span>{strength.rules?.number ? "✔" : "✖"}</span> One number (0–9)
                            </li>

                            <li className={strength.rules?.special ? styles.ok : styles.notOk}>
                                <span>{strength.rules?.special ? "✔" : "✖"}</span> One special character (!@#$%^&*)
                            </li>

                            <li className={strength.rules?.nospace ? styles.ok : styles.notOk}>
                                <span>{strength.rules?.nospace ? "✔" : "✖"}</span> No spaces allowed
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </>
    );
}

export default ChangePassword;
