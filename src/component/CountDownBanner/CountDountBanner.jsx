import styles from "./stylesCountDownBanner.module.scss";
import CountDownTimer from "@component/CountDown/CountDownTimer";
function CountDownBanner() {
    const { container, containerTimer } = styles;
    const targetDate = "2025-12-31T00:00:00";
    return (
        <div className={container}>
            <div className={containerTimer}>
                <CountDownTimer targetDate={targetDate} />
            </div>
        </div>
    );
}

export default CountDownBanner;
