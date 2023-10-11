
import { useNavigate } from "react-router-dom";
import Iconbar from "./compontent/menulist";

import "./style.scss";

const SideBar = () => {

    const navigate = useNavigate()
 
const handleSideBarView = () => {
       navigate('/dashboard/device-setup')
    };
    return (
        <>
            <aside className="aside">
                <Iconbar handleSideBarView ={handleSideBarView } />
            </aside>
            
        </>
    );
};

export default SideBar;
