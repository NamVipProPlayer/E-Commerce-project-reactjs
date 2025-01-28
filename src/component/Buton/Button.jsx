import classNames from "classnames";
import styles from "./Button.module.css";
function Button({ primary }) {
  console.log(primary);
  return (
    <div>
      <button
        className={classNames(styles.btn, {
          [styles.primary]: primary,
          [styles.default]: !primary,
        })}
      >
        Click Me
      </button>
    </div>
  );
}

export default Button;
