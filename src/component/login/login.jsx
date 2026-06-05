import { useEffect, useState } from "react";
import * as Yup from "yup";
import "../login/loginPage.css";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { FaEye, FaEyeSlash, FaLock, FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getLicense, login } from "../../service/auth.service";

const Login = () => {

    const navigate = useNavigate();
    const [time, setTime] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialValues] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .required("Username is required")
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must not exceed 20 characters"),
        password: Yup.string()
            .required("Password is required")
            .min(3, "Password must be at least 3 characters")
            .max(40, "Password must not exceed 40 characters"),
    });

    const showError = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLoginSubmit = async (values) => {
        setMessage("");
        setLoading(true);
        const username = values.username;
        const password = values.password;

        try {
            const isLicenseValid = await getLicense();

            if (!isLicenseValid) {
                localStorage.setItem("license-exp", "Y");
                navigate("/license-exp");
                return;
            }

            localStorage.setItem("license-exp", "N");

            const response = await login(username, password);

            if (response?.success) {
                navigate("/dashboard", { replace: true });
            } else {
                showError(response?.message || "Login failed");
            }

        } catch (error) {
            console.error("Login error:", error);
            let resMessage = "Something went wrong, please try again!";

            if (error.response) {
                const status = error.response.status;
                if (status === 401) resMessage = "Invalid username or password";
                else if (status === 403) resMessage = "Your account is locked or disabled";
                else if (status === 400) resMessage = "Invalid input format";
                else if (status === 500) resMessage = "Server error during authentication";
            }

            showError(resMessage);
        } finally {
            setLoading(false);
        }
    };

    // Clock
    useEffect(() => {
        const updateClock = () => {
            const date = new Date();
            let h = date.getHours();
            let m = date.getMinutes();
            let s = date.getSeconds();
            let session = "AM";

            if (h === 0) h = 12;
            if (h > 12) {
                h = h - 12;
                session = "PM";
            }

            h = h < 10 ? "0" + h : h;
            m = m < 10 ? "0" + m : m;
            s = s < 10 ? "0" + s : s;

            setTime(`${h}:${m}:${s} ${session}`);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="login-wrapper">
            {/* HEADER */}
            <header className="main-header">
                <div className="container header-container">
                    <div></div>

                    <div className="brand-center">
                        <h1>HRMS</h1>
                        <p>Human Resource Management System</p>
                    </div>

                    <div className="clock-pill">{time}</div>
                </div>
            </header>

            {/* BODY */}
            <div className="login-viewport">
                <div className="premium-card">
                    <h3 className="text-center mb-4 mt-3">Welcome Back</h3>

                    {message && (
                        <div className="alert alert-danger text-center" role="alert">
                            {message}
                        </div>
                    )}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleLoginSubmit}
                    >
                        {({ errors, touched }) => (
                            <Form className="text-start">

                                {/* Username */}
                                <div className="mb-3 position-relative">
                                    <label className="form-label fw-semibold">
                                        <FaUserAlt className="input-icon" />Username</label>
                                    <Field
                                        type="text"
                                        name="username"
                                        className="form-control custom-input ps-3"
                                        placeholder="Enter Username"
                                    />
                                    <ErrorMessage name="username" component="div" className="error-text" />
                                </div>

                                {/* Password */}
                                <div className="mb-3 position-relative">
                                    <label className="form-label fw-semibold">
                                        <FaLock className="input-icon" />Password</label>
                                    <div className="input-with-icon">
                                        <Field
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="form-control custom-input ps-3 pe-5"
                                            placeholder="Enter Password"
                                        />

                                        <span className="input-eye" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="error-text" />
                                </div>

                                <button className="btn login-btn w-100 mt-3" type="submit"
                                    disabled={loading}
                                > {loading && (
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                )}
                                    Login
                                </button>

                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="footer text-center">
                <div className="container">
                    <p className="mb-0">
                        Designed & Developed by <strong>Vedant Tech Solutions</strong> © {new Date().getFullYear()} HRMS
                    </p>
                    <div className="small-text">
                        Best viewed on&nbsp;
                        <img src="/browsers/chrome.svg" alt="Chrome" className="browser-img" />
                        Chrome 120+,&nbsp;

                        <img src="/browsers/firefox.svg" alt="Firefox" className="browser-img" />
                        Firefox 115+,&nbsp;

                        <img src="/browsers/edge.svg" alt="Edge" className="browser-img" />
                        Edge 120+
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
