import BoxIcon from "./BoxIcon/BoxIcon";
import { dataBoxIcon, dataMenu } from "./constant";
import Menu from "./Menu/Menu";
import styles from "./stylesHeader.module.scss";
function Header() {
    const {containerFlexItems, containerMenu} = styles;
    return (
        <div>
            <div>
                <div className={containerFlexItems}>
                    {dataBoxIcon.map((items) => {
                        return <BoxIcon type={items.type} href={items.href} />;
                    })}
                </div>
                <div className={containerMenu}>
                    {
                        dataMenu.map((items)=>{
                            return <Menu content={items.content} href={items.href}/>
                        })
                    }
                </div>
            </div>
            <div></div>
            <div></div>
        </div>
    );
}

export default Header;
