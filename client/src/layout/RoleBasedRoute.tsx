import React from 'react';
import { Route, Navigate, RouteProps } from 'react-router-dom';

interface RoleBasedRouteProps  {
    element: React.ReactNode;
    requiredRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ element, requiredRoles, ...rest }) => {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const userRole = userDetails.userType;

    if (!userDetails || Object.keys(userDetails).length === 0) {
        return <Navigate to="/" />;
    }

    if (!requiredRoles.includes(userRole)) {
        return <Navigate to='/notfound' />;
    }

    return (
        <Route {...rest} element={element} />
    );
}

export default RoleBasedRoute;
