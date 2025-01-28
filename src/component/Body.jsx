import { memo } from "react";
import Category from "./Category";

function Body({handleDem}) {
 
  return (
    <div>
     <Category/>
    </div>
  );
}

export default memo(Body);
