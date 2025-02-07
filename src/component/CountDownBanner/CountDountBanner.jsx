import Button from "@component/Buton/Button";
import styles from "./stylesCountDownBanner.module.scss";
import CountDownTimer from "@component/CountDown/CountDownTimer";
function CountDownBanner() {
    const { container, containerTimer, title, btn } = styles;
    const targetDate = "2025-12-31T00:00:00";
    return (
        <div className={container}>
            <div className={containerTimer}>
                <CountDownTimer targetDate={targetDate} />
            </div>
            <p className={title}>The Classic Make a Comback</p>
            <div className={btn}>
                <Button content={"Buy now"} />
            </div>
        </div>
    );
}

export default CountDownBanner;
