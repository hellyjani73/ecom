import React, { FC, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import RentCloth from "../pages/RentClothes";
import Management from "../pages/Management";
import ShopExpenses from "../pages/ShopExpense";
import Employees from "../pages/Employees";
import ClothDetails from "../pages/RentClothes/Details";
import EmployeesDetails from "../pages/Employees/Details";
import NotFoundPage from "../common/404";
import SystemSetup from "../pages/SystemSetup";
import RentalSchedule from "../pages/RentalSchedule";
import WholesalerDetails from "../pages/Management/Details";
import AvailCloth from "../pages/AvailCloth";
import ClothCategory from "../pages/ClothCategory";
import StitchingCategory from "../pages/StitchingCategory";
import Tailor from "../pages/Tailor";
import TailorDetails from "../pages/Tailor/Details";
import Dashboard from "../pages/Dashboard";
import Report from "../pages/Report";
import Customer from "../pages/Customer";
import CustomerDetails from "../pages/Customer/Details";
import ClothFabric from "../pages/ClothFabric";
import CustomerBill from "../pages/CustomerBill";
import ProtectedRoute from "./ProtectedRoute";
import ClothBooking from "../pages/ClothBooking";
import VendorManagement from "../pages/VendorManagement";
import VendorDetails from "../pages/VendorManagement/Details";
import InvoiceTemplate from "../pages/InvoiceTemplate";
import VendorSubscription from "../pages/VendorSubscription";
import Bills from "../pages/Bills";
import Washing from "../pages/Washing";
import WashermenDetails from "../pages/Washing/Details";
import WashermenAllocationReport from "../pages/WashermenAlloction";

const LoginPage = lazy(
  () => import("../pages/Login/index" /* webpackChunkName: "login" */)
);

const RegisterPage = lazy(
  () => import("../pages/Register/index" /* webpackChunkName: "register" */)
);

const AppRoutes: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        <Route
          path={ROUTES.RENT_CLOTH}
          element={
            <ProtectedRoute>
              <RentCloth />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLOTH_DETAILS}
          element={
            <ProtectedRoute>
              <ClothDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MANAGEMENT}
          element={
            <ProtectedRoute>
              <Management />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WHOLESALER_DETAILS}
          element={
            <ProtectedRoute>
              <WholesalerDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SHOP_EXPENSES}
          element={
            <ProtectedRoute>
              <ShopExpenses />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES}
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RENTAL_SHEDULE}
          element={
            <ProtectedRoute>
              <RentalSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES_DETAILS}
          element={
            <ProtectedRoute>
              <EmployeesDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SYSTEM_SETUP}
          element={
            <ProtectedRoute>
              <SystemSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.AVAILCLOTH}
          element={
            <ProtectedRoute>
              <AvailCloth />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.Cloth_Analytics}
          element={
            <ProtectedRoute>
              <AvailCloth />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLOTH_CATEGORY}
          element={
            <ProtectedRoute>
              <ClothCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.STITCHING_CATEGORY}
          element={
            <ProtectedRoute>
              <StitchingCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TAILOR}
          element={
            <ProtectedRoute>
              <Tailor />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TAILOR_DETAILS}
          element={
            <ProtectedRoute>
              <TailorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REPORT}
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER}
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_DETAILS}
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLOTH_FABRIC}
          element={
            <ProtectedRoute>
              <ClothFabric />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_BILL}
          element={
            <ProtectedRoute>
              <CustomerBill />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLOTH_BOOKING}
          element={
            <ProtectedRoute>
              <ClothBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLOTH_BOOKING_EIDT}
          element={
            <ProtectedRoute>
              <ClothBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMER_BILL_EDIT}
          element={
            <ProtectedRoute>
              <CustomerBill />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.VENDOR_MANAGEMENT}
          element={
            <ProtectedRoute>
              <VendorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.VENDOR_DETAILS}
          element={
            <ProtectedRoute>
              <VendorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INVOICE_TEMPLATE}
          element={
            <ProtectedRoute>
              <InvoiceTemplate />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.VENDOR_SUBSCRIPTIONS}
          element={
            <ProtectedRoute>
              <VendorSubscription />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BILL}
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WASHING}
          element={
            <ProtectedRoute>
              <Washing />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WASHING_DETAILS}
          element={
            <ProtectedRoute>
              <WashermenDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WASHERMENT_ALLOCATION}
          element={
            <ProtectedRoute>
              <WashermenAllocationReport />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
