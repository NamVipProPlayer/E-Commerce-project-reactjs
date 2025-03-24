import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import styles from "./stylesForm.module.scss";

const Form = React.forwardRef(({ className, ...props }, ref) => {
    return <form ref={ref} className={cn(styles.form, className)} {...props} />;
});
Form.displayName = "Form";

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn(styles.formItem, className)} {...props} />
    );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={cn(styles.formLabel, className)}
            {...props}
        />
    );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef(({ ...props }, ref) => {
    return <div ref={ref} className={styles.formControl} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <p
            ref={ref}
            className={cn(styles.formDescription, className)}
            {...props}
        />
    );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn(styles.formMessage, className)}
                {...props}
            >
                {children}
            </p>
        );
    }
);
FormMessage.displayName = "FormMessage";

const FormField = ({ name, control, render }) => {
    const formContext = useFormContext();

    if (!formContext && !control) {
        const error = new Error(
            "FormField must be used within a Form with FormProvider, or control must be provided"
        );
        error.name = "FormFieldError";
        throw error;
    }

    const { control: formControl } = formContext || {};

    return (
        <Controller
            control={control || formControl}
            name={name}
            render={({ field, fieldState }) => render({ field, fieldState })}
        />
    );
};

export{
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField
};
