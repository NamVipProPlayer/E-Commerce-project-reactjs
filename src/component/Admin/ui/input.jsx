import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./stylesInput.module.scss";

const Input = React.forwardRef(
    ({ className, type = "text", ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(styles.input, className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
