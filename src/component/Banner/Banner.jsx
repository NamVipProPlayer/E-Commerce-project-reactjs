
import { useNavigate } from "react-router-dom";
import styles from "./stylesBanner.module.scss";

import Button from "@component/Buton/Button";

function Banner() {
    const { container, content, title, des } = styles;
    const navigate = useNavigate();

    return (
        <div className={container}>
            <div className={content}>
                <h1 className={title}>N & M Store</h1>
                <div className={des}>Walk Confidently, Walk With Us.</div>
                <Button content={"Go to store"}  onClick={()=>{navigate("/OurStore")}}/>
            </div>
        </div>
    );
}

export default Banner;
