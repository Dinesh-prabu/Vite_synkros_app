import { Suspense, useEffect, useState, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./header";
import SideBar from "./sidebar";
import { isEmpty } from "lodash";
import "./style.scss"

const LayoutComponent = () => {
    const location = useLocation();

    const menuItems:any  =[ ]

    const [pageTilte, setpageTilte] = useState<string>("");
    console.log(pageTilte)

    useEffect(() => {
        const { pathname } = location;
        const path = pathname.split("/");
        const title = path[path.length - 1].replace(/[^a-zA-Z0-9 ]/g, " ");
        setpageTilte(title);
    }, [location]);

     
    const PrivateRoute = useMemo(() => ({ children }: { children: React.ReactNode }) => {
        const storage = localStorage.getItem('auth');
        return storage ? <>{children}</> :  <>{children}</>;
    }, []);

 
    return (
        <>
            <section className="container-wrapper">
                    <SideBar menuItems={menuItems} />
                    <div className={`container-wrapper__innerblk ${!isEmpty(pageTilte) && "hactive"}`}>
                        { pageTilte!=="dashboard" &&<Header title={pageTilte} />}
                        <Suspense fallback={<div>Loading...</div>}>
                            <PrivateRoute>
                                <Outlet />
                            </PrivateRoute>
                        </Suspense>
                    </div>
            </section>
        </>
    );
};

export default LayoutComponent;
