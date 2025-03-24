import { useRef, useEffect, useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogOverlay,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@radix-ui/react-dialog";
import { 
    Loader2, X, UserCog, Phone, Mail, User, 
    KeyRound, ShieldCheck, Save, Calendar
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "./stylesUserForm.module.scss";
import { toast } from "react-toastify";

// Current time and user constants
const CURRENT_DATETIME = "2025-03-18 06:37:30";
const CURRENT_USER = "NamProPlayer20";

// Modified schema for updates - password is optional
const userUpdateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Must be a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
    roleId: z.number().min(1).max(2, "Role must be 1 (User) or 2 (Admin)"),
    phone: z.string().optional()
});

export function UserUpdateForm({ open, onOpenChange, onSubmit, isSubmitting, userData }) {
    const [changePassword, setChangePassword] = useState(false);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting: formSubmitting, isDirty }
    } = useForm({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            roleId: 1,
            phone: ""
        }
    });

    // Reset and populate form when user data changes or modal opens
    useEffect(() => {
        if (userData && open) {
            reset({
                name: userData.name || "",
                email: userData.email || "",
                password: "", // Don't populate password
                roleId: userData.roleId || 1,
                phone: userData.phone || ""
            });
            setChangePassword(false);
        }
    }, [userData, open, reset]);

    // Enhanced submit handler with metadata
    const handleFormSubmit = (data) => {
        try {
            // If not changing password, remove it from the data
            const formattedData = {
                ...data,
                updatedAt: CURRENT_DATETIME,
                updatedBy: CURRENT_USER
            };
            
            // Remove empty password if not changing
            if (!changePassword || !formattedData.password) {
                delete formattedData.password;
            }
            
            onSubmit(userData?.id || userData?._id, formattedData);
        } catch (error) {
            toast.error("Error updating user: " + error.message);
            console.error("Form submission error:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className={styles.overlay} />
            <DialogContent className={styles.modal}>
                <div className={styles.modalHeader}>
                    <DialogTitle className={styles.modalTitle}>
                        <UserCog className={styles.titleIcon} size={20} />
                        Update User
                    </DialogTitle>
                    <DialogClose className={styles.closeButton}>
                        <X size={18} />
                    </DialogClose>
                </div>

                <DialogDescription className={styles.modalDescription}>
                    Update user information for {userData?.name || "selected user"}.
                </DialogDescription>

                <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
                    <div className={styles.formLayout}>
                        {/* Left Column - Primary Information */}
                        <div className={styles.formColumn}>
                            <h3 className={styles.sectionTitle}>Account Information</h3>
                            
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <User className={styles.inputIcon} size={16} />
                                    Full Name <span className={styles.required}>*</span>
                                </label>
                                <input 
                                    {...register("name")} 
                                    className={`${styles.input} ${errors.name ? styles.inputError : ""}`} 
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
                                    <Mail className={styles.inputIcon} size={16} /> 
                                    Email Address <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                                    placeholder="Email address"
                                />
                                {errors.email && (
                                    <p className={styles.error}>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.passwordHeader}>
                                    <label className={styles.label}>
                                        <KeyRound className={styles.inputIcon} size={16} />
                                        Password
                                    </label>
                                    <div className={styles.passwordToggle}>
                                        <input 
                                            type="checkbox" 
                                            id="changePassword" 
                                            checked={changePassword}
                                            onChange={() => setChangePassword(!changePassword)}
                                        />
                                        <label htmlFor="changePassword">Change password</label>
                                    </div>
                                </div>
                                {changePassword ? (
                                    <>
                                        <input
                                            type="password"
                                            {...register("password")}
                                            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                                            placeholder="New password (min 6 characters)"
                                        />
                                        {errors.password && (
                                            <p className={styles.error}>
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.passwordPlaceholder}>
                                        <span>••••••••</span>
                                        <small>Check the box above to change password</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Additional Information */}
                        <div className={styles.formColumn}>
                            <h3 className={styles.sectionTitle}>Additional Details</h3>
                        
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Phone className={styles.inputIcon} size={16} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
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
                                    <ShieldCheck className={styles.inputIcon} size={16} />
                                    User Role <span className={styles.required}>*</span>
                                </label>
                                <select
                                    {...register("roleId", {
                                        setValueAs: (value) => Number(value)
                                    })}
                                    className={`${styles.input} ${styles.select} ${errors.roleId ? styles.inputError : ""}`}
                                >
                                    <option value="1">Standard User</option>
                                    <option value="2">Administrator</option>
                                </select>
                                {errors.roleId && (
                                    <p className={styles.error}>
                                        {errors.roleId.message}
                                    </p>
                                )}
                            </div>

                            {/* User metadata */}
                            <div className={styles.metadataSection}>
                                <h4 className={styles.metadataTitle}>User Information</h4>
                                <div className={styles.metadataGrid}>
                                    {userData?.createdAt && (
                                        <div className={styles.metadataItem}>
                                            <span className={styles.metadataLabel}>Created:</span>
                                            <span className={styles.metadataValue}>
                                                {userData.createdAt}
                                            </span>
                                        </div>
                                    )}
                                    {userData?.updatedAt && (
                                        <div className={styles.metadataItem}>
                                            <span className={styles.metadataLabel}>Last Updated:</span>
                                            <span className={styles.metadataValue}>
                                                {userData.updatedAt}
                                            </span>
                                        </div>
                                    )}
                                    {userData && (userData.id || userData._id) && (
                                        <div className={styles.metadataItem}>
                                            <span className={styles.metadataLabel}>User ID:</span>
                                            <span className={styles.metadataValue}>
                                                {userData.id || userData._id}
                                            </span>
                                        </div>
                                    )}
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
                            disabled={isSubmitting || formSubmitting || !isDirty}
                            className={styles.submitButton}
                        >
                            {(isSubmitting || formSubmitting) ? (
                                <>
                                    <Loader2 className={styles.loader} />
                                    <span>Updating User...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className={styles.formFooter}>
                        <span className={styles.timestamp}>
                            <Calendar size={14} />
                            {CURRENT_DATETIME}
                        </span>
                        <span className={styles.userInfo}>
                            <User size={14} />
                            {CURRENT_USER}
                        </span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}