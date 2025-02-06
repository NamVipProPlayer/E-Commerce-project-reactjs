import { useEffect, useState } from "react";
import styles from "./stylesCountDown.module.scss";
function CountDownTimer({ targetDate }) {
    const { timerBox } = styles;
    const calculateTimer = () => {
        const diff = +new Date(targetDate) - +new Date();

        let timeLeft = {};

        if (diff > 0) {
            timeLeft = {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimer);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimer());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (number) => String(number).padStart(2, "0");

    const timerComponent = Object.keys(timeLeft).map((interval) => (
        <span key={interval} className={timerBox}>
            {formatNumber(timeLeft[interval])} {interval}{" "}
        </span>
    ));

    return timerComponent;
}

export default CountDownTimer;
