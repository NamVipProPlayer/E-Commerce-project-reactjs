import React, { useContext, useState } from "react";
import { ThemeContext } from "../App";
import styles from "./Buton/Button.module.css"
import classNames from "classnames";
function Category() {
  const cate = [
    {
      name: "FrontEnd code",
      type: "Html, css",
      price: 500,
    },
    {
      name: "Back end code",
      type: "javascript, typescript",
      price: 1000,
    },
    {
      name: "Database",
      type: "MySql, MongoDb",
      price: 200,
    },
  ];

  const [showCategories, setShowCategories] = useState(false);

  const themeData = useContext(ThemeContext);
  console.log(themeData);
  return (
    <div>
      <button className={classNames(styles.btn)} onClick={() => setShowCategories((prev) => !prev)}>
        {showCategories ? "Hide" : "Show"} Categories
      </button>
      {showCategories && (
        <ul >
          {cate.map((categoryCode, index) =>
            categoryCode.price >= 500 ? (
              <li key={index}>
                name: {categoryCode.name}, type: {categoryCode.type}
              </li>
            ) : (
              <li key={index}>Price is below 500</li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

export default Category;
