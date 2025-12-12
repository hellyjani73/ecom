import React, { FC, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import NotFoundPage from "../common/404";



const LoginPage = lazy(
  () => import("../pages/Login/index" /* webpackChunkName: "login" */)
);

const RegisterPage = lazy(
  () => import("../pages/Register/index" /* webpackChunkName: "register" */)
);

const HomePage = lazy(
  () => import("../pages/Home/index" /* webpackChunkName: "home" */)
);

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
