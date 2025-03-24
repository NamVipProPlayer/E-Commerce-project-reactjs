import React from "react";
import styles from "./stylesbadge.module.scss";

const Badge = ({ className, variant = "default", ...props }) => {
    return (
        <div
            className={`${styles.badge} ${styles[variant]} ${className || ""}`}
            {...props}
        />
    );
};

export { Badge };
