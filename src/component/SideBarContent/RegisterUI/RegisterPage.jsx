import React, { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import LogoLogin from "@Images/image.png";
import styles from "../LoginUI/stylesLoginUI.module.scss";
import {
    FaRegEye,
    FaRegEyeSlash,
    FaFacebookSquare,
    FaLinkedin,
    FaTwitterSquare
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userService from "@/apis/userService.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";

function RegisterPage() {
    const { imgLogo, checkBox, IconShowPassWord } = styles;
    const [isHidden, setIsHidden] = useState(false);
    const { setAuth } = useContext(AuthContext);
    const { setIsOpen } = useContext(SideBarContext);
    const navigate = useNavigate();

    // Close sidebar when this page loads
    React.useEffect(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(3, "At least 3 characters")
                .required("Name is required"),
            email: Yup.string()
                .email("Invalid email")
                .required("Email is required"),
            phone: Yup.string()
                .matches(/^\d{10,15}$/, "Phone must be 10-15 digits")
                .required("Phone is required"),
            password: Yup.string()
                .min(6, "At least 6 characters")
                .required("Password is required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Confirm your password")
        }),
        onSubmit: async (values, { setSubmitting }) => {
            console.log("Submitting data:", values);
            try {
                await userService.register(values);

                toast.success("Registration successful! Please log in.", {
                    position: "top-right",
                    autoClose: 2000
                });

                setTimeout(() => navigate("/"), 2000); // Redirect to login
            } catch (error) {
                toast.error(error.response?.message || "Registration failed!", {
                    position: "top-right",
                    autoClose: 3000
                });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <ToastContainer />
            <div
                className="p-4 shadow-lg"
                style={{ maxWidth: "400px", width: "100%" }}
            >
                <div className="text-center">
                    <img src={LogoLogin} alt="Logo" className={imgLogo} />
                    <h1 className="text-break">Join Us</h1>
                    <h5 className="text-muted">Create your account</h5>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <input
                            id="name"
                            type="text"
                            className={`form-control mb-3 ${
                                formik.touched.name && formik.errors.name
                                    ? "is-invalid"
                                    : ""
                            }`}
                            placeholder="Full Name*"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="text-danger small">
                                {formik.errors.name}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <input
                            id="email"
                            type="email"
                            className={`form-control mb-3 ${
                                formik.touched.email && formik.errors.email
                                    ? "is-invalid"
                                    : ""
                            }`}
                            placeholder="Email*"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-danger small">
                                {formik.errors.email}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <input
                            id="phone"
                            type="tel"
                            className={`form-control mb-3 ${
                                formik.touched.phone && formik.errors.phone
                                    ? "is-invalid"
                                    : ""
                            }`}
                            placeholder="Phone Number*"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            autoComplete="tel"
                        />
                        {formik.touched.phone && formik.errors.phone && (
                            <div className="text-danger small">
                                {formik.errors.phone}
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group position-relative">
                        <div
                            className={IconShowPassWord}
                            onClick={() => setIsHidden(!isHidden)}
                        >
                            {isHidden ? <FaRegEyeSlash /> : <FaRegEye />}
                        </div>
                        <input
                            id="password"
                            type={isHidden ? "text" : "password"}
                            className={`form-control mb-3 ${
                                formik.touched.password &&
                                formik.errors.password
                                    ? "is-invalid"
                                    : ""
                            }`}
                            placeholder="Password*"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            autoComplete="new-password"
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-danger small">
                                {formik.errors.password}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <input
                            id="confirmPassword"
                            type="password"
                            className={`form-control mb-3 ${
                                formik.touched.confirmPassword &&
                                formik.errors.confirmPassword
                                    ? "is-invalid"
                                    : ""
                            }`}
                            placeholder="Confirm Password*"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.confirmPassword &&
                            formik.errors.confirmPassword && (
                                <div className="text-danger small">
                                    {formik.errors.confirmPassword}
                                </div>
                            )}
                    </div>

                    {/* Terms Agreement */}
                    <div className="form-group my-2 d-flex align-items-center gap-2">
                        <input
                            type="checkbox"
                            className={checkBox}
                            id="terms"
                            required
                        />
                        <label htmlFor="terms">
                            I agree to the terms & conditions
                        </label>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="btn btn-dark btn-lg w-100 mt-3"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? "Registering..." : "Register"}
                    </button>

                    {/* Social Login */}
                    <div className="mt-3 text-center">
                        <p className="text-muted">Or continue with</p>
                        <div className="d-flex justify-content-center gap-3">
                            <FaFacebookSquare
                                size={"2rem"}
                                className={checkBox}
                            />
                            <FaLinkedin size={"2rem"} className={checkBox} />
                            <FaTwitterSquare
                                size={"2rem"}
                                className={checkBox}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;
