import React, { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import LogoLogin from "@Images/image.png";
import styles from "./stylesLoginUI.module.scss";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    FaFacebookSquare,
    FaRegEye,
    FaRegEyeSlash,
    FaLinkedin,
    FaTwitterSquare
} from "react-icons/fa";
import classNames from "classnames";
import userService from "@/apis/userService";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { toast, ToastContainer } from "react-toastify"; // Import toast
import { Link, useNavigate } from "react-router-dom";

function LoginUI() {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const { isopen, setIsOpen } = useContext(SideBarContext);
    const { imgLogo, checkBox, IconShowPassWord } = styles;
    const [isHiden, setIsHiden] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            password: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Password is required")
        }),
        onSubmit: async (values) => {
            try {
                const { token, user } = await userService.login(values);

                if (rememberMe) {
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("uesrId", user._id);
                } else {
                    sessionStorage.setItem("authToken", token);
                    sessionStorage.setItem("userId", user._id);
                }
                // ✅ Redirect after showing the toast
                setTimeout(() => {
                    if (user.roleId === 2) {
                        navigate("/admin"); // Redirect to admin dashboard
                    } else {
                        navigate("/");
                        // setIsOpen(false);
                       // Redirect to home or another page
                    }
                }, 2000); // Delay
                toast.success("Login successful!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
                setAuth(user);
                // setIsOpen(false);
                setTimeout(() => {
                     window.location.reload();
                }, 2000);
               
            } catch (error) {
                toast.error(error.message || "Login failed!", {
                    position: "top-right",
                    autoClose: 900,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored"
                });
            }
        }
    });

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <ToastContainer /> {/* Toast container to display notifications */}
            <div
                className="p-4 shadow-lg"
                style={{ maxWidth: "400px", width: "100%" }}
            >
                <div className="text-center">
                    <img src={LogoLogin} alt="Logo" className={imgLogo} />
                    <h1 className="text-break">Welcome to our store</h1>
                    <h5 className="text-muted">
                        Enter your account to join us
                    </h5>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <input
                            id="email"
                            type="text"
                            className="form-control mb-3 mt-4"
                            placeholder="Email or account's name*"
                            autoComplete="username"
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

                    <div className="form-group position-relative">
                        <div
                            className={IconShowPassWord}
                            onClick={() => setIsHiden(!isHiden)}
                        >
                            {isHiden ? <FaRegEyeSlash /> : <FaRegEye />}
                        </div>
                        <input
                            id="password"
                            type={isHiden ? "text" : "password"}
                            className="form-control mb-4 mt-1"
                            placeholder="Password*"
                            autoComplete="current-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-danger small">
                                {formik.errors.password}
                            </div>
                        )}
                    </div>

                    <div className="form-group my-lg-2 my-md-2 d-flex gap-3">
                        <input
                            type="checkbox"
                            className={classNames(
                                "form-check-input border-2",
                                checkBox
                            )}
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                    </div>

                    <Link
                        to="/register"
                        className="m-2 d-block text-center text-primary small"
                    >
                        Haven't registered? Create one here
                    </Link>

                    <button
                        type="submit"
                        className="btn btn-dark btn-lg w-100 mt-3"
                    >
                        Sign In
                    </button>

                    <div className="mt-3 mb-3 d-flex justify-content-center align-items-center flex-column">
                        <p className="text-muted">
                            Continue with other platforms
                        </p>
                        <div className="d-flex justify-content-around gap-2">
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

export default LoginUI;
