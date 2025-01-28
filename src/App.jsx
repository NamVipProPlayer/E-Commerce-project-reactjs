import { createContext, useState } from "react";
import Body from "./component/Body";
import Button from "./component/Buton/Button";
export const ThemeContext = createContext();
function App() {
  const [theme, setTheme] = useState("dark");
  //create context

  return (
    <div>
      <h2>Hello Router React</h2>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/layout">Layout</a>
        </li>
        <li>
          <a href="/category">Category</a>
        </li>
      </ul>
    </div>
  );
}
export default App;
