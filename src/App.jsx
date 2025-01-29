import { createContext, useState } from "react";
import Button from "@component/Buton/Button";
import MainLayout from "@component/Layout/Layout";
import Header from "./component/Header/Header";

export const ThemeContext = createContext();
function App() {
    return (
        <>
            <MainLayout>
               <Header/>
            </MainLayout>
        </>
    );
}
export default App;
