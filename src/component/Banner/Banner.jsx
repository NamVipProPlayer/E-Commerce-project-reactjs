
import styles from "./stylesBanner.module.scss";

import Button from "@component/Buton/Button";

function Banner() {
    const { container, content, title, des } = styles;

    return (
        <div className={container}>
            <div className={content}>
                <h1 className={title}>N & M Store</h1>
                <div className={des}>Walk Confidently, Walk With Us.</div>
                <Button content={"Go to store"} />
            </div>
        </div>
    );
}

export default Banner;
