import styles from "./stylesSkeleton.module.scss";

export default function Skeleton({ className, style, ...props }) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={style}
            {...props}
        />
    );
}
