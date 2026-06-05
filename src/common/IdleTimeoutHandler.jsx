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

        // FIX: Navigate immediately so private routes unmount and don't break
        navigate("/login", { replace: true });

        if (!isManual) {
            // The system logged them out automatically. 
            // This now pops up on top of the login page cleanly.
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "You have been logged out due to inactivity",
                confirmButtonText: "Ok",
                allowOutsideClick: false
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
                        clearInterval(timerInterval);
                        Swal.close();
                        handleLogout(false);
                    }
                }, 1000);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            warningActive.current = false;

            if (result.isConfirmed) {
                // User clicked "Stay Logged In"
                startTimer();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked "Logout Now"
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
        const registerEvents = () => events.forEach((e) => window.addEventListener(e, resetTimer));
        const unregisterEvents = () => events.forEach((e) => window.removeEventListener(e, resetTimer));

        registerEvents();
        startTimer();

        return () => {
            clearTimer();
            unregisterEvents();
        };
    }, [resetTimer, startTimer, isPublic]);

    return children;
}

export default IdleTimeoutHandler;