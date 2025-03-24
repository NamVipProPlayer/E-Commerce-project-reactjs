import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./styles.module.scss";
import classNames from "classnames";

const Button = React.forwardRef(
    (
        {
            className,
            variant = "default",
            size = "default",
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={classNames(
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
