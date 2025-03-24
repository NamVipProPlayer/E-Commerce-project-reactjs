import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./stylesTextarea.module.scss";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(styles.textarea, className)}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = "Textarea";

export { Textarea };
