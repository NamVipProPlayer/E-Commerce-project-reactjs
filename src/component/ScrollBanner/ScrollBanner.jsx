import styles from "./styles.module.scss";
import Srollbanner1 from "@Images/nike-just-do-it.png";
import Scrollbanner2 from "@Images/nike-just-do-it (1).png";
function ScrollBanner() {
    const {container} = styles;
    return (
        <div className={container}>
            <div>
                <img src={Srollbanner1} alt="Scroll Banner" />
            </div>
                <div>
                    <p>You can't ban greatness</p>

                    <h1>Unbanable</h1>
                    <button></button>
                </div>
            <div>
                <img src={Scrollbanner2} alt="Scroll Banner" />
            </div>
        </div>
    );
}

export default ScrollBanner;
