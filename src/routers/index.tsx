import { Suspense, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import LoginSF from '../pages/LoginSF'
import DashBoard from "../pages/main/dashboard";
import LayoutComponent from "../pages/main/layout";
import DeviceSetup from "../pages/devicesetup"

const RouterNavigation = () => {
    const routes = useMemo(() => (
        <Suspense>
            <Routes>
                <Route path="/" element={<LoginSF />} />
                <Route path="/dashboard" element={<LayoutComponent />}>
                    <Route index element={<DashBoard />} />
                    <Route path="/dashboard/device-setup" element={<DeviceSetup />} />
                </Route>
            </Routes>
        </Suspense>
    ), [])

    return (
        <>
            {routes}
        </>
    );
};

export default RouterNavigation;

