import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@styles/_main.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./component/Layout.jsx";
import Category from "./component/Category.jsx";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/layout",
    element: <Layout/>,
  },
  {
    path: "/category",
    element: <Category />,
  },

]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
   <RouterProvider router={routers}/>
  </StrictMode>
);
