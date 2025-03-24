import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./stylesButton.module.scss";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
    (
        {
            className,
            asChild = false,
            variant = "default",
            size = "default",
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(
                    styles.button,
                    styles[variant],
                    styles[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
