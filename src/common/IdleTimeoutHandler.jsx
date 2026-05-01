import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../service/auth.service";


function IdleTimeoutHandler({ timeout, children }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Pages where idle timeout should NOT run
    const publicPaths = useMemo(() => ["/", "/login"], []);

    const isPublic = publicPaths.includes(location.pathname);

    useEffect(() => {
        // Read user fresh in this effect
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;

        if (!user || isPublic) {
            return;
        }

        let timer;

        const handleLogout = async () => {
            try {
                await logout("S"); // audit stamp
            } catch (err) {
                console.error("Audit log failed:", err);
            }

            localStorage.clear();
            sessionStorage.clear();

            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "You have been logged out due to inactivity",
            });

            navigate("/login");
        };

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => handleLogout(), timeout);
        };

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((e) => window.addEventListener(e, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(timer);
            events.forEach((e) => window.removeEventListener(e, resetTimer));
        };
    }, [location.pathname, timeout, isPublic, navigate]);

    return children;
}

export default IdleTimeoutHandler;
