import { useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@radix-ui/react-dialog";
import {
    Loader2,
    X,
    UserPlus,
    Phone,
    Mail,
    User,
    KeyRound,
    ShieldCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "./stylesUserForm.module.scss";
import { toast } from "react-toastify";

// Current time and user constants
const CURRENT_DATETIME = "2025-03-18 06:37:30";
const CURRENT_USER = "NamProPlayer20";

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Must be a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    roleId: z.number().min(1).max(2, "Role must be 1 (User) or 2 (Admin)"),
    phone: z.string().optional()
});

export function UserForm({ open, onOpenChange, onSubmit, isSubmitting }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting: formSubmitting }
    } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            roleId: 1,
            phone: ""
        }
    });

    // Reset form when modal is closed
    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    // Enhanced submit handler with metadata
    const handleFormSubmit = (data) => {
        try {
            const enhancedData = {
                ...data,
                createdAt: CURRENT_DATETIME,
                createdBy: CURRENT_USER
            };

            onSubmit(enhancedData);
        } catch (error) {
            toast.error("Error submitting form: " + error.message);
            console.error("Form submission error:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className={styles.overlay} />
            <DialogContent className={styles.modal}>
                <div className={styles.modalHeader}>
                    <DialogTitle className={styles.modalTitle}>
                        <UserPlus className={styles.titleIcon} size={20} />
                        Add New User
                    </DialogTitle>
                    <DialogClose className={styles.closeButton}>
                        <X size={18} />
                    </DialogClose>
                </div>

                <DialogDescription className={styles.modalDescription}>
                    Create a new user account with the information below.
                </DialogDescription>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className={styles.form}
                >
                    <div className={styles.formLayout}>
                        {/* Left Column - Primary Information */}
                        <div className={styles.formColumn}>
                            <h3 className={styles.sectionTitle}>
                                Account Information
                            </h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <User
                                        className={styles.inputIcon}
                                        size={16}
                                    />
                                    Full Name{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <input
                                    {...register("name")}
                                    className={`${styles.input} ${
                                        errors.name ? styles.inputError : ""
                                    }`}
                                    placeholder="Enter full name"
                                />
                                {errors.name && (
                                    <p className={styles.error}>
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Mail
                                        className={styles.inputIcon}
                                        size={16}
                                    />
                                    Email Address{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`${styles.input} ${
                                        errors.email ? styles.inputError : ""
                                    }`}
                                    placeholder="Email address"
                                />
                                {errors.email && (
                                    <p className={styles.error}>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <KeyRound
                                        className={styles.inputIcon}
                                        size={16}
                                    />
                                    Password{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="password"
                                    {...register("password")}
                                    className={`${styles.input} ${
                                        errors.password ? styles.inputError : ""
                                    }`}
                                    placeholder="Minimum 6 characters"
                                />
                                {errors.password && (
                                    <p className={styles.error}>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Additional Information */}
                        <div className={styles.formColumn}>
                            <h3 className={styles.sectionTitle}>
                                Additional Details
                            </h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Phone
                                        className={styles.inputIcon}
                                        size={16}
                                    />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    className={`${styles.input} ${
                                        errors.phone ? styles.inputError : ""
                                    }`}
                                    placeholder="Phone number (optional)"
                                />
                                {errors.phone && (
                                    <p className={styles.error}>
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <ShieldCheck
                                        className={styles.inputIcon}
                                        size={16}
                                    />
                                    User Role{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <select
                                    {...register("roleId", {
                                        valueAsNumber: true ,// This ensures the value is converted to a number
                                         setValueAs: (value) => Number(value) 
                                    })}
                                    className={`${styles.input} ${
                                        styles.select
                                    } ${
                                        errors.roleId ? styles.inputError : ""
                                    }`}
                                >
                                    <option value="1">Standard User</option>
                                    <option value="2">Administrator</option>
                                </select>
                                {errors.roleId && (
                                    <p className={styles.error}>
                                        {errors.roleId.message}
                                    </p>
                                )}
                                <p className={styles.helpText}>
                                    Administrators have full access to all
                                    system features
                                </p>
                            </div>

                            <div className={styles.securityNote}>
                                <div className={styles.securityNoteContent}>
                                    <h4>Security Notice</h4>
                                    <p>
                                        New users will receive a welcome email
                                        with login instructions.
                                    </p>
                                    <p>
                                        Make sure the email address is correct
                                        and active.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting || formSubmitting}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || formSubmitting}
                            className={styles.submitButton}
                        >
                            {isSubmitting || formSubmitting ? (
                                <>
                                    <Loader2 className={styles.loader} />
                                    <span>Creating User...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    <span>Create User</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className={styles.formFooter}>
                        <span className={styles.timestamp}>
                            {CURRENT_DATETIME}
                        </span>
                        <span className={styles.userInfo}>{CURRENT_USER}</span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
