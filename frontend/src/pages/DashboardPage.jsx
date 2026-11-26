import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import InfrastructureEngineerDashboard from './dashboards/InfrastructureEngineerDashboard';
import MunicipalEngineerDashboard from './dashboards/MunicipalEngineerDashboard';
import MaintenanceTeamDashboard from './dashboards/MaintenanceTeamDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import CitizenDashboard from './dashboards/CitizenDashboard';

export default function DashboardPage() {
  const { user, role } = useAuth();

  const getDefaultTab = () => {
    switch (role) {
      case 'INFRASTRUCTURE_ENGINEER':
        return 'monitoring';
      case 'MUNICIPAL_ENGINEER':
        return 'overview';
      case 'MAINTENANCE_TEAM':
        return 'tasks';
      case 'ADMIN':
        return 'users';
      case 'CITIZEN':
      default:
        return 'report';
    }
  };

  const [currentTab, setCurrentTab] = useState(getDefaultTab());

  const renderDashboard = () => {
    switch (role) {
      case 'INFRASTRUCTURE_ENGINEER':
        return <InfrastructureEngineerDashboard tab={currentTab} />;
      case 'MUNICIPAL_ENGINEER':
        return <MunicipalEngineerDashboard tab={currentTab} />;
      case 'MAINTENANCE_TEAM':
        return <MaintenanceTeamDashboard tab={currentTab} />;
      case 'ADMIN':
        return <AdminDashboard tab={currentTab} />;
      case 'CITIZEN':
      default:
        return <CitizenDashboard tab={currentTab} />;
    }
  };

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderDashboard()}
    </DashboardLayout>
  );
}
