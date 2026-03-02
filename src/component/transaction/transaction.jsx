import Navbar from '../navbar/Navbar';
import './Transaction.css';
import { getReqTransactionList } from '../../service/training.service';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FaCheckCircle } from 'react-icons/fa';

const Transaction = () => {

    const reqData = JSON.parse(localStorage.getItem("transactionData"));
    const [transactionDetails, setTransactionDetails] = useState([]);

    useEffect(() => {
        if (reqData && reqData.requisitionId) {
            fetchTransactionDetails(reqData.requisitionId);
        }
    }, []);

    const fetchTransactionDetails = async (id) => {
        try {
            const response = await getReqTransactionList(id);
            setTransactionDetails(response?.data || []);
        } catch (error) {
            console.error("Error fetching transaction details:", error);
        }
    };


    function calculateWorkingDayGap(startDate, endDate) {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) return null;

        // Normalize time to midnight
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let current = new Date(start);
        current.setDate(current.getDate() + 1); // next day
        let workingDays = 0;

        while (current <= end) {
            const day = current.getDay(); // 0 = Sun, 6 = Sat
            if (day !== 0 && day !== 6) {
                workingDays++;
            }
            current.setDate(current.getDate() + 1);
        }

        return workingDays;
    };


    const AnimatedCounter = ({ value }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start = 0;
            const duration = 800;
            const increment = value / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }, [value]);

        return <span>{count}</span>;
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="row justify-content-center">

                    <div className="transaction-title">
                        <h5>
                            Transaction Details for <strong>{reqData?.programName || "N/A"}</strong>
                        </h5>

                        {reqData?.fromDate && reqData?.toDate && (
                            <p className="transaction-date">
                                {format(new Date(reqData.fromDate), "dd MMM yyyy")} —{" "}
                                {format(new Date(reqData.toDate), "dd MMM yyyy")}
                            </p>
                        )}
                    </div>

                    <div className="col-md-8 col-lg-11">
                        <div className="timeline-wrapper">
                            <div className="timeline-progress"></div>
                            {transactionDetails.map((step, index) => {
                                const prevItem = transactionDetails[index - 1];
                                const gap =
                                    prevItem && step.actionDate && prevItem.actionDate
                                        ? calculateWorkingDayGap(prevItem.actionDate, step.actionDate)
                                        : null;
                                const isCurrent = index === transactionDetails.length - 1;
                                return (
                                    <div
                                        key={step.id}
                                        className={`timeline-item ${index % 2 === 0 ? "left" : "right"} ${step.statusCode}`}
                                        style={{ animationDelay: `${index * 0.2}s` }}
                                    >
                                        <div className={`timeline-dot ${isCurrent ? "active" : ""}`}>
                                            <FaCheckCircle />
                                        </div>

                                        <div className="timeline-card">
                                            <div className="timeline-header">
                                                <span
                                                    className="badge-status"
                                                    style={{
                                                        background: step.colorCode
                                                            ? step.colorCode
                                                            : "linear-gradient(45deg, #0039e1, #06c0d2)"
                                                    }}
                                                >
                                                    {step.statusDetail}
                                                </span>
                                                <span className="date">
                                                    {format(new Date(step.actionDate), "dd-MM-yyyy hh:mm a")}
                                                </span>
                                            </div>

                                            <p className="user">{step.forwardByName}</p>

                                            {gap !== null && (
                                                <p className="gap">
                                                    ⏳ <AnimatedCounter value={gap} /> Working Day(s)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Transaction;