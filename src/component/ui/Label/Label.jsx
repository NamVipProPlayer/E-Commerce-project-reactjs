import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import classNames from "classnames";
import "./stylesLabel.module.scss"; // Import SCSS file for styling

const Label = React.forwardRef(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={classNames("custom-label", className)}
        {...props}
    />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
