import { useNavigate } from "react-router-dom";
import exStyles from "./licenseExp.module.css";
import LiceseImg from "../../assets/images/licenseExpired.png";

const LicenseExp = () => {
    const navigate = useNavigate();

    return (
        <div className={exStyles.pageWrapper}>
            {/* Soft decorative background shapes */}
            <div className={exStyles.blob}></div>
            
            <div className={exStyles.cardCustom}>
                <div className={exStyles.imageWrapper}>
                    <img
                        className={exStyles.divImg}
                        alt="License Expired"
                        src={LiceseImg}
                    />
                </div>

                <div className={exStyles.badge}>
                    ATTENTION REQUIRED
                </div>

                <h1 className={exStyles.divh1}>
                    License Expired
                </h1>

                <p className={exStyles.divp}>
                    Your access period has ended. To continue using our professional 
                    tools, a license renewal is required.
                </p>

                <div className={exStyles.contactSection}>
                    <p>Support & Renewals</p>
                    <h3 className={exStyles.brandText}>Team Vedant Tech Solutions</h3>
                </div>

                <button
                    onClick={() => navigate("/login")}
                    className={exStyles.backToHome}
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default LicenseExp;