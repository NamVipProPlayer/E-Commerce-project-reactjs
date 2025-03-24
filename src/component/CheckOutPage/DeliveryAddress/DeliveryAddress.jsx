import React, { useState } from "react";
import { Search } from "lucide-react";
import styles from "./DeliveryAddress.module.scss";

const DeliveryAddress = ({ onAddressSubmit }) => {
    const [addressData, setAddressData] = useState({
        houseNumber: "",
        street: "",
        ward: "",
        district: "",
        cityOrProvince: "",
        phoneNumber: ""
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddressSubmit(addressData);
        setIsSubmitted(true);
        console.log("address submitted: ", addressData);
    };

    const handleEdit = () => {
        setIsSubmitted(false);
    };

    return (
        <div className={styles.deliveryAddress}>
            <h2 className={styles.title}>Delivery</h2>

            <form onSubmit={handleSubmit} className={styles.sections}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        {isSubmitted
                            ? "Delivery Address:"
                            : "Enter your address details:"}
                    </h3>
                    <div className={styles.inputGroup}>
                        <div className={styles.row}>
                            <div className={styles.inputHalf}>
                                <label
                                    htmlFor="houseNumber"
                                    className={styles.label}
                                >
                                    House Number
                                </label>
                                <input
                                    type="text"
                                    id="houseNumber"
                                    name="houseNumber"
                                    placeholder="House Number"
                                    value={addressData.houseNumber}
                                    onChange={handleChange}
                                    className={`${styles.input} ${
                                        isSubmitted ? styles.inputReadOnly : ""
                                    }`}
                                    required
                                    readOnly={isSubmitted}
                                />
                            </div>

                            <div className={styles.inputHalf}>
                                <label
                                    htmlFor="street"
                                    className={styles.label}
                                >
                                    Street
                                </label>
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    placeholder="Street Name"
                                    value={addressData.street}
                                    onChange={handleChange}
                                    className={`${styles.input} ${
                                        isSubmitted ? styles.inputReadOnly : ""
                                    }`}
                                    required
                                    readOnly={isSubmitted}
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputHalf}>
                                <label htmlFor="ward" className={styles.label}>
                                    Ward
                                </label>
                                <input
                                    type="text"
                                    id="ward"
                                    name="ward"
                                    placeholder="Ward"
                                    value={addressData.ward}
                                    onChange={handleChange}
                                    className={`${styles.input} ${
                                        isSubmitted ? styles.inputReadOnly : ""
                                    }`}
                                    required
                                    readOnly={isSubmitted}
                                />
                            </div>

                            <div className={styles.inputHalf}>
                                <label
                                    htmlFor="district"
                                    className={styles.label}
                                >
                                    District
                                </label>
                                <input
                                    type="text"
                                    id="district"
                                    name="district"
                                    placeholder="District"
                                    value={addressData.district}
                                    onChange={handleChange}
                                    className={`${styles.input} ${
                                        isSubmitted ? styles.inputReadOnly : ""
                                    }`}
                                    required
                                    readOnly={isSubmitted}
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputFull}>
                                <label
                                    htmlFor="cityOrProvince"
                                    className={styles.label}
                                >
                                    City/Province
                                </label>
                                <div className={styles.searchInput}>
                                    {!isSubmitted && (
                                        <Search className={styles.searchIcon} />
                                    )}
                                    <input
                                        type="text"
                                        id="cityOrProvince"
                                        name="cityOrProvince"
                                        placeholder="City or Province"
                                        value={addressData.cityOrProvince}
                                        onChange={handleChange}
                                        className={`${styles.input} ${
                                            isSubmitted
                                                ? styles.inputReadOnly
                                                : styles.inputWithIcon
                                        }`}
                                        required
                                        readOnly={isSubmitted}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isSubmitted && (
                            <p className={styles.note}>
                                We do not ship to P.O. boxes
                            </p>
                        )}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        Contact information:
                    </h3>
                    <div className={styles.inputGroup}>
                        <div className={styles.inputFull}>
                            <label
                                htmlFor="phoneNumber"
                                className={styles.label}
                            >
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Phone number"
                                value={addressData.phoneNumber}
                                onChange={handleChange}
                                className={`${styles.input} ${
                                    isSubmitted ? styles.inputReadOnly : ""
                                }`}
                                required
                                readOnly={isSubmitted}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    {isSubmitted ? (
                        <button
                            type="button"
                            className={styles.changeButton}
                            onClick={handleEdit}
                        >
                            Change Address
                        </button>
                    ) : (
                        <button type="submit" className={styles.submitButton}>
                            Save Address
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DeliveryAddress;
