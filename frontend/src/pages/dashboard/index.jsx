import React from 'react';
import { useAuth } from '../../context/AuthContext';

import UserDashboard from './UserDashboard';
import ReviewerDashboard from './ReviewerDashboard';

/**
 * Router component that renders the appropriate dashboard
 * based on the user's role. Admin is handled separately in App.jsx.
 */
const DashboardRouter = () => {
    const { user } = useAuth();

    if (user?.role === 'reviewer') {
        return <ReviewerDashboard />;
    }

    // Default to UserDashboard for "user" role
    return <UserDashboard />;
};

export default DashboardRouter;
