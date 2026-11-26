import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/api';
import {
  Bridge,
  LayoutDashboard,
  ClipboardList,
  Cpu,
  Bell,
  LogOut,
  Users,
  AlertTriangle,
  PlusCircle,
  CheckCircle,
  Radio,
  FileText,
  MapPin,
  X,
  ExternalLink,
} from 'lucide-react';

export default function DashboardLayout({ children, currentTab, setCurrentTab }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.list();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      loadNotifications();
    } catch (err) {
      // ignore
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case 'INFRASTRUCTURE_ENGINEER':
        return [
          { id: 'monitoring', label: 'Technical Monitoring', icon: Radio },
          { id: 'displacement', label: 'Displacement Telemetry', icon: Cpu },
          { id: 'ai-models', label: 'AI Risk Predictions', icon: Bridge },
          { id: 'requests', label: 'Maintenance Requests', icon: ClipboardList },
        ];
      case 'MUNICIPAL_ENGINEER':
        return [
          { id: 'overview', label: 'Municipal Overview', icon: LayoutDashboard },
          { id: 'registry', label: 'Infrastructure Registry', icon: Bridge },
          { id: 'approvals', label: 'Maintenance Approvals', icon: ClipboardList },
          { id: 'complaints', label: 'Citizen Complaints', icon: AlertTriangle },
          { id: 'map', label: 'Municipal GIS Map', icon: MapPin },
        ];
      case 'MAINTENANCE_TEAM':
        return [
          { id: 'tasks', label: 'My Assigned Tasks', icon: ClipboardList },
          { id: 'in-progress', label: 'Active Repairs', icon: Radio },
          { id: 'history', label: 'Completed Work Orders', icon: CheckCircle },
        ];
      case 'ADMIN':
        return [
          { id: 'users', label: 'User & Role Management', icon: Users },
          { id: 'assets-all', label: 'All Infrastructure Assets', icon: Bridge },
          { id: 'ml-status', label: 'ML Models & Datasets', icon: Cpu },
          { id: 'audit', label: 'System Audit Log', icon: FileText },
        ];
      case 'CITIZEN':
      default:
        return [
          { id: 'report', label: 'Report Road / Crack Issue', icon: PlusCircle },
          { id: 'my-reports', label: 'My Submitted Complaints', icon: ClipboardList },
          { id: 'city-status', label: 'Municipal Public Map', icon: MapPin },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="brand">
            <img src="/logo.png" alt="InfraMind AI" style={{ width: '32px', height: '32px' }} />
            <div>
              <span style={{ fontSize: '1.15rem' }}>
                Infra<span style={{ color: 'var(--accent-cyan)' }}>Mind</span>
              </span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
            <div className="user-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: 'var(--text-primary)',
                }}
              >
                {user?.fullName || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.city || 'Tirupati'}</div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            type="button"
            className="sidebar-link"
            style={{ width: '100%', color: 'var(--danger)', padding: '8px 12px' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h2>{navItems.find((n) => n.id === currentTab)?.label || 'Workspace'}</h2>
            <p>InfraMind Municipal Decision Intelligence System · Real-Time Operations</p>
          </div>

          <div className="topbar-actions">
            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <Bell size={18} color="var(--text-secondary)" />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--danger)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: '0',
                    width: '340px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-light)',
                    zIndex: 100,
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.8rem',
                      borderBottom: '1px solid var(--border-light)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    <b style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Municipal Notices</b>
                    <button
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {notifications.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: n.read ? '#f8fafc' : 'var(--primary-soft)',
                            borderLeft: `3px solid ${n.read ? '#cbd5e1' : 'var(--primary)'}`,
                          }}
                        >
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-avatar" title={user?.fullName}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
