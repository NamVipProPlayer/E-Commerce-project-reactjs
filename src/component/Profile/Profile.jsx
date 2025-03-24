import React, { useState, useEffect, useContext } from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Edit2,
    Save,
    X,
    ChevronRight,
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertTriangle,
    Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.scss";
import { AuthContext } from "@Contexts/AuthContext";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
import userService from "@apis/userService";
import { getCurrentFormattedDateTime } from "@component/utils/dateTimeUtils";

const Profile = () => {
    const { auth } = useContext(AuthContext);
    const { userInfo } = useContext(StorageContext);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [currentDateTimes, setCurrentDateTime] = useState(
        getCurrentFormattedDateTime()
    );

    // Update the time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(getCurrentFormattedDateTime());
        }, 60000); // update every minute

        return () => clearInterval(timer);
    }, []);
    // Using the exact current date format provided
    const currentDateTime = currentDateTimes;
    const currentUser = userInfo ? userInfo.name : "Guest";

    useEffect(() => {
        // Use userInfo from StorageContext if available
        if (userInfo) {
            console.log("User info loaded:", userInfo);
            setUser(userInfo);
            setEditedUser(userInfo);
            setIsLoading(false);
        } else {
            setIsLoading(true);
            console.log("Waiting for user info...");
        }
    }, [userInfo]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);

            // Format to match the provided format: YYYY-MM-DD HH:MM:SS
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const seconds = String(date.getSeconds()).padStart(2, "0");

            // Return in format that matches the current date format
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1:
                return "Customer";
            case 2:
                return "Admin";
            case 3:
                return "Super Admin";
            default:
                return "Guest";
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedUser(user);
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({
            ...editedUser,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const response = await userService.updateProfile({
                name: editedUser.name,
                email: editedUser.email,
                phone: editedUser.phone
            });

            if (response.success) {
                setUser(response.user);
                setIsEditing(false);
                setUpdateSuccess(true);
                // Update storage context if needed
                if (typeof response.user === "object") {
                    localStorage.setItem(
                        "userInfo",
                        JSON.stringify(response.user)
                    );
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setUpdateError(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <h1>My Profile</h1>
                
                <div>
                    {updateSuccess && (
                        <div className={styles.successMessage}>
                            <CheckCircle size={16} />
                            Profile updated successfully!
                        </div>
                    )}

                    {updateError && (
                        <div className={styles.errorMessage}>
                            <AlertTriangle size={16} />
                            {updateError}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.profileContent}>
                <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarContainer}>
                            <div className={styles.avatar}>
                                {user.name
                                    ? user.name.charAt(0).toUpperCase()
                                    : "U"}
                            </div>
                        </div>
                        <div className={styles.userInfo}>
                            <h2>{user.name}</h2>
                            <div className={styles.roleBadge}>
                                <Shield size={14} />
                                <span>{getRoleName(user.roleId)}</span>
                            </div>
                        </div>

                        <button
                            className={styles.editButton}
                            onClick={handleEditToggle}
                            aria-label={
                                isEditing ? "Cancel editing" : "Edit profile"
                            }
                        >
                            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                        </button>
                    </div>

                    {isEditing ? (
                        <form
                            onSubmit={handleSubmit}
                            className={styles.editForm}
                        >
                            <div className={styles.formGroup}>
                                <label htmlFor="name">
                                    <User size={16} />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editedUser.name || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">
                                    <Mail size={16} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editedUser.email || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone">
                                    <Phone size={16} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={editedUser.phone || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleEditToggle}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader
                                                size={16}
                                                className={styles.spinner}
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.profileDetails}>
                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <User size={18} />
                                </div>
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>
                                        Name
                                    </span>
                                    <span className={styles.detailValue}>
                                        {user.name}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <Mail size={18} />
                                </div>
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>
                                        Email
                                    </span>
                                    <span className={styles.detailValue}>
                                        {user.email}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <Phone size={18} />
                                </div>
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>
                                        Phone
                                    </span>
                                    <span className={styles.detailValue}>
                                        {user.phone}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <Calendar size={18} />
                                </div>
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>
                                        Member Since
                                    </span>
                                    <span className={styles.detailValue}>
                                        {formatDate(user.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <Clock size={18} />
                                </div>
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>
                                        Last Profile Update
                                    </span>
                                    <span className={styles.detailValue}>
                                        {formatDate(user.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.accountActions}>
                    <h3>Account Actions</h3>
                    <div className={styles.actionLinks}>
                        <div
                            className={styles.actionLink}
                            onClick={() => navigate("/account/orders")}
                        >
                            <span>My Orders</span>
                            <ChevronRight size={16} />
                        </div>
                        <div
                            className={styles.actionLink}
                            onClick={() => navigate("/account/addresses")}
                        >
                            <span>Saved Addresses</span>
                            <ChevronRight size={16} />
                        </div>
                        <div
                            className={styles.actionLink}
                            onClick={() => navigate("/account/wishlist")}
                        >
                            <span>Wishlist</span>
                            <ChevronRight size={16} />
                        </div>
                        <div
                            className={styles.actionLink}
                            onClick={() => navigate("/account/change-password")}
                        >
                            <span>Change Password</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.idSection}>
                <span>Account ID: {user._id}</span>
            </div>

            <button className={styles.backButton} onClick={() => navigate("/")}>
                <ArrowLeft size={16} />
                Back to Home
            </button>
        </div>
    );
};

export default Profile;
