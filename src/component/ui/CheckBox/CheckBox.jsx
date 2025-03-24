import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import classNames from "classnames";
import styles from "./stylesCheckBox.module.scss"; // ✅ Use the imported styles

const Checkbox = React.forwardRef(
    ({ className, checked, onCheckedChange, ...props }, ref) => (
        <CheckboxPrimitive.Root
            ref={ref}
            className={classNames(styles.customCheckbox, className)}
            checked={checked}
            onCheckedChange={onCheckedChange}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                className={styles.customCheckboxIndicator}
            >
                <Check className={styles.checkIcon} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
