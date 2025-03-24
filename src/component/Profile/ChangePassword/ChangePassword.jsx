import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    KeyRound,
    Lock,
    EyeOff,
    Eye,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    ArrowLeft
} from "lucide-react";
import styles from "./ChangePassword.module.scss";
import { AuthContext } from "@Contexts/AuthContext";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
import userService from "@apis/userService.js";
import { getCurrentFormattedDateTime } from "@component/utils/dateTimeUtils";

const ChangePassword = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { userInfo } = useContext(StorageContext);

    // Form state
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [currentDateTimes, setCurrentDateTime] = useState(getCurrentFormattedDateTime());

    // Password validation states
    const [validations, setValidations] = useState({
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
    });

    // Current date and user info
    const currentDateTime = currentDateTimes;
    const currentUser = userInfo?.name || "Guest";

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Validate password as user types
        if (name === "newPassword" || name === "confirmPassword") {
            validatePassword();
        }
    };

    const validatePassword = () => {
        const { newPassword, confirmPassword } = formData;

        setValidations({
            hasMinLength: newPassword.length >= 8,
            hasUppercase: /[A-Z]/.test(newPassword),
            hasLowercase: /[a-z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
            passwordsMatch:
                newPassword === confirmPassword && newPassword !== ""
        });
    };

    const isFormValid = () => {
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword) {
            setFormError("Current password is required");
            return false;
        }

        if (!newPassword) {
            setFormError("New password is required");
            return false;
        }

        if (newPassword !== confirmPassword) {
            setFormError("New passwords don't match");
            return false;
        }

        // Check all validation criteria
        const {
            hasMinLength,
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSpecialChar
        } = validations;
        if (
            !(
                hasMinLength &&
                hasUppercase &&
                hasLowercase &&
                hasNumber &&
                hasSpecialChar
            )
        ) {
            setFormError("Password doesn't meet security requirements");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!isFormValid()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Call API to update password
            await userService.updateProfile({
                userId: userInfo?._id,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            // Success handling
            setFormSuccess("Password updated successfully!");

            // Clear form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            // Redirect after delay
            setTimeout(() => {
                navigate("/account/profile");
            }, 3000);
        } catch (error) {
            console.error("Error updating password:", error);
            setFormError(
                error.response?.data?.message ||
                    "Failed to update password. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        switch (field) {
            case "current":
                setShowCurrentPassword(!showCurrentPassword);
                break;
            case "new":
                setShowNewPassword(!showNewPassword);
                break;
            case "confirm":
                setShowConfirmPassword(!showConfirmPassword);
                break;
            default:
                break;
        }
    };

    return (
        <div className={styles.changePasswordContainer}>
            <div className={styles.header}>
                <h1>Change Password</h1>
                <div className={styles.userBadge}>
                    <span>Logged in as: {currentUser}</span>
                </div>
                <div className={styles.lastUpdated}>
                    <span>Current time: {currentDateTime}</span>
                </div>
            </div>

            <div className={styles.formCard}>
                {formSuccess && (
                    <div className={styles.successMessage}>
                        <CheckCircle size={18} />
                        <span>{formSuccess}</span>
                    </div>
                )}

                {formError && (
                    <div className={styles.errorMessage}>
                        <AlertCircle size={18} />
                        <span>{formError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="currentPassword">
                            <KeyRound size={16} />
                            Current Password
                        </label>
                        <div className={styles.passwordInputContainer}>
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your current password"
                                required
                            />
                            <button
                                type="button"
                                className={styles.showPasswordButton}
                                onClick={() =>
                                    togglePasswordVisibility("current")
                                }
                                aria-label={
                                    showCurrentPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showCurrentPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">
                            <Lock size={16} />
                            New Password
                        </label>
                        <div className={styles.passwordInputContainer}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your new password"
                                required
                            />
                            <button
                                type="button"
                                className={styles.showPasswordButton}
                                onClick={() => togglePasswordVisibility("new")}
                                aria-label={
                                    showNewPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showNewPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">
                            <Lock size={16} />
                            Confirm New Password
                        </label>
                        <div className={styles.passwordInputContainer}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your new password"
                                required
                            />
                            <button
                                type="button"
                                className={styles.showPasswordButton}
                                onClick={() =>
                                    togglePasswordVisibility("confirm")
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={styles.passwordRequirements}>
                        <h4>Password Requirements:</h4>
                        <ul>
                            <li
                                className={
                                    validations.hasMinLength ? styles.valid : ""
                                }
                            >
                                At least 8 characters long
                            </li>
                            <li
                                className={
                                    validations.hasUppercase ? styles.valid : ""
                                }
                            >
                                At least one uppercase letter
                            </li>
                            <li
                                className={
                                    validations.hasLowercase ? styles.valid : ""
                                }
                            >
                                At least one lowercase letter
                            </li>
                            <li
                                className={
                                    validations.hasNumber ? styles.valid : ""
                                }
                            >
                                At least one number
                            </li>
                            <li
                                className={
                                    validations.hasSpecialChar
                                        ? styles.valid
                                        : ""
                                }
                            >
                                At least one special character
                            </li>
                            <li
                                className={
                                    validations.passwordsMatch
                                        ? styles.valid
                                        : ""
                                }
                            >
                                Passwords match
                            </li>
                        </ul>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => navigate("/account/profile")}
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isSubmitting}
                        >
                            <Save size={16} />
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>

            <button
                className={styles.backButton}
                onClick={() => navigate("/account/profile")}
            >
                <ArrowLeft size={16} />
                Back to Profile
            </button>
        </div>
    );
};

export default ChangePassword;
