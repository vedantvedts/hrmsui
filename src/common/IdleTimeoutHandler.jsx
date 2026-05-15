import { useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../service/auth.service";


function IdleTimeoutHandler({ timeout, warningTime, children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const mainTimerRef = useRef(null);
    const isLoggingOut = useRef(false);
    const warningActive = useRef(false);

    const publicPaths = useMemo(() => ["/", "/login"], []);
    const isPublic = publicPaths.includes(location.pathname);

    const clearTimer = () => {
        if (mainTimerRef.current) clearTimeout(mainTimerRef.current);
    };

    /**
     * @param {boolean} isManual - If true, skips the "Session Expired" alert 
     * and navigates directly to login.
     */
    const handleLogout = useCallback(async (isManual = false) => {
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;

        clearTimer();

        try {
            // Triggers the logout API
            await logout("S");
        } catch (err) {
            console.error("Logout audit failed:", err);
        }

        // Clean slate
        localStorage.clear();
        sessionStorage.clear();

        if (isManual) {
            // User clicked "Logout Now", just take them to login immediately
            navigate("/login", { replace: true });
        } else {
            // System logged them out automatically, show the reason why
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "You have been logged out due to inactivity",
                confirmButtonText: "Ok",
                allowOutsideClick: false
            }).then(() => {
                navigate("/login", { replace: true });
            });
        }
    }, [navigate]);

    const showWarning = useCallback(() => {
        if (warningActive.current) return;

        warningActive.current = true;
        clearTimer();

        let countdown = warningTime / 1000;
        let timerInterval;

        Swal.fire({
            title: "Session Expiring Soon",
            html: `You will be logged out in <b>${countdown}</b> seconds.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Stay Logged In",
            cancelButtonText: "Logout Now",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                timerInterval = setInterval(() => {
                    countdown--;
                    const b = Swal.getHtmlContainer()?.querySelector("b");
                    if (b) b.textContent = countdown;

                    if (countdown <= 0) {
                        // Triggers the auto-logout path (isManual = false)
                        Swal.close();
                        handleLogout(false);
                    }
                }, 1000);
            },
            willClose: () => {
                // Kill the countdown interval no matter how the modal closes
                clearInterval(timerInterval);
            }
        }).then((result) => {
            warningActive.current = false;

            if (result.isConfirmed) {
                // User clicked "Stay Logged In"
                startTimer();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // 1. User clicked "Logout Now"
                // 2. We call handleLogout(true) for a clean, immediate exit
                handleLogout(true);
            }
        });
    }, [warningTime, handleLogout]);

    const startTimer = useCallback(() => {
        if (isPublic) return;
        clearTimer();
        mainTimerRef.current = setTimeout(() => {
            showWarning();
        }, timeout - warningTime);
    }, [timeout, warningTime, isPublic, showWarning]);

    const resetTimer = useCallback(() => {
        if (isPublic || warningActive.current) return;
        startTimer();
    }, [startTimer, isPublic]);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;

        if (!user || isPublic) {
            clearTimer();
            return;
        }

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        startTimer();

        return () => {
            clearTimer();
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [resetTimer, startTimer, isPublic]);

    return children;
}

export default IdleTimeoutHandler;