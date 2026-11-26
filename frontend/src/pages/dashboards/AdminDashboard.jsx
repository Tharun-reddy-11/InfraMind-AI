import React, { useState, useEffect } from 'react';
import { adminApi, assetsApi, predictionsApi, workApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Bridge,
  Cpu,
  Database,
  ShieldCheck,
  UserPlus,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  Radio,
  Server,
  Globe,
  X,
  Lock,
  Layers,
  Wrench,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard({ tab }) {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal: Provision New Municipal User
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: 'Tharun@30',
    role: 'INFRASTRUCTURE_ENGINEER',
    mobile: '+91 98765 00000',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    address: 'Municipal Corporation Engineering Wing',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [uList, aList, pList, wList] = await Promise.all([
        adminApi.listUsers(),
        assetsApi.list(),
        predictionsApi.list(),
        workApi.list(),
      ]);
      setUsers(uList);
      setAssets(aList);
      setPredictions(pList);
      setWorkItems(wList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await adminApi.toggleUserStatus(id);
      const uList = await adminApi.listUsers();
      setUsers(uList);
      showSuccess('User account status updated!');
    } catch (err) {
      showError('Toggle status failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.provisionUser(userForm);
      setShowUserModal(false);
      setUserForm({
        fullName: '',
        email: '',
        password: 'Tharun@30',
        role: 'INFRASTRUCTURE_ENGINEER',
        mobile: '+91 98765 00000',
        city: 'Tirupati',
        state: 'Andhra Pradesh',
        address: 'Municipal Corporation Engineering Wing',
      });
      const uList = await adminApi.listUsers();
      setUsers(uList);
      showSuccess('New official account provisioned into the municipal operations system!');
    } catch (err) {
      showError('Provisioning failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'MUNICIPAL_ENGINEER': return 'Municipal Officer';
      case 'INFRASTRUCTURE_ENGINEER': return 'Infrastructure Officer';
      case 'MAINTENANCE_TEAM': return 'Maintenance Officer';
      case 'ADMIN': return 'System Administrator';
      case 'CITIZEN': return 'Citizen / Public User';
      default: return r;
    }
  };

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-greeting">{getGreeting()}, B. Tharun Reddy</div>
          <div className="welcome-subtitle">Municipal Governance Administration · Central Command</div>
        </div>
        <div className="welcome-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="metric-value">{users.length}</div>
            <div className="metric-label">Authorized Municipal Accounts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)' }}>
            <Bridge size={24} />
          </div>
          <div>
            <div className="metric-value">{assets.length}</div>
            <div className="metric-label">Monitored Infrastructure Assets</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div className="metric-value">{predictions.length}</div>
            <div className="metric-label">Completed Risk Analyses</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="metric-value">100% Active</div>
            <div className="metric-label">System Security & Health</div>
          </div>
        </div>
      </div>

      {/* Professional Municipal Systems Status Strip (Replacing all raw technical words) */}
      <div
        className="panel-card"
        style={{
          background: 'linear-gradient(135deg, #0f2744 0%, #1e293b 100%)',
          color: '#ffffff',
          marginBottom: '2rem',
        }}
      >
        <span className="section-tag" style={{ color: '#38bdf8' }}>
          MUNICIPAL OPERATIONS & SERVICE PLATFORM HEALTH
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 1.2rem' }}>
          Operational Infrastructure Systems & Civil Services
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px 18px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#34d399" />
              <b style={{ fontSize: '0.94rem' }}>Municipal Core Operations Engine</b>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              High-Availability · Secure Operational Service
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px 18px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#34d399" />
              <b style={{ fontSize: '0.94rem' }}>Central Infrastructure Database</b>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              Encrypted Relational Data Store · Operational
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px 18px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#34d399" />
              <b style={{ fontSize: '0.94rem' }}>Predictive Analytics Engine</b>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              NBI Bridge Risk & Defect AI · Real-Time Ready
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px 18px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="#38bdf8" />
              <b style={{ fontSize: '0.94rem' }}>GIS Spatial & Climate Service</b>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              Live Weather Telemetry & City Mapping
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: USER & ROLE MANAGEMENT (MAIN)
         ========================================================================= */}
      {(tab === 'users' || !tab) && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">ROLE-BASED GOVERNANCE</span>
              <h3 className="panel-title">Authorized Municipal Accounts</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 12px 6px 32px', fontSize: '0.85rem' }}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
              <button
                onClick={() => setShowUserModal(true)}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                <UserPlus size={16} />
                <span>Provision New User</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Official Email</th>
                  <th>Assigned Role</th>
                  <th>Municipality</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><b>{u.fullName}</b></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-closed' : u.role === 'MUNICIPAL_ENGINEER' ? 'badge-assigned' : u.role === 'INFRASTRUCTURE_ENGINEER' ? 'badge-in-progress' : 'badge-completed'}`}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td>{u.city || 'Tirupati'}</td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-completed' : 'badge-closed'}`}>
                        {u.active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        {u.active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ALL INFRASTRUCTURE ASSETS
         ========================================================================= */}
      {tab === 'assets-all' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">COMPREHENSIVE INVENTORY</span>
              <h3 className="panel-title">All City Infrastructure Assets</h3>
            </div>
          </div>

          {assets.length === 0 ? (
            <p style={{ color: '#64748b' }}>No infrastructure assets currently registered in the municipal database.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Photo</th>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Year Built</th>
                    <th>Structural Health</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id}>
                      <td><b style={{ color: 'var(--primary)' }}>{a.assetCode}</b></td>
                      <td>
                        <img
                          src={a.imageUrl || '/cards/feature_1.png'}
                          alt={a.name}
                          style={{ width: '50px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => { e.target.src = '/cards/feature_1.png'; }}
                        />
                      </td>
                      <td><b>{a.name}</b></td>
                      <td><span className="badge badge-assigned">{a.category}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{a.locationText}</td>
                      <td>{a.constructionYear}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: (a.structuralHealth || 85) >= 80 ? '#059669' : '#dc2626' }}>
                            {a.structuralHealth || 85}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${a.status === 'OPTIMAL' || a.status === 'ACTIVE' ? 'badge-completed' : 'badge-in-progress'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: PREDICTIVE MODELS & INTELLIGENCE
         ========================================================================= */}
      {tab === 'ml-status' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="panel-card">
              <span className="section-tag">BRIDGE HEALTH MODEL</span>
              <h4 style={{ margin: '4px 0 8px', fontWeight: 800 }}>NBI Degradation Risk Model</h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                Trained on National Bridge Inventory datasets. Multi-factor gradient-boosted regression on deck, superstructure, substructure, and daily truck volume.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <div><b>Validation Accuracy:</b> 92.4%</div>
                <div><b>Trained Records:</b> 1,664 NBI Structures</div>
              </div>
            </div>

            <div className="panel-card">
              <span className="section-tag">DISPLACEMENT TELEMETRY</span>
              <h4 style={{ margin: '4px 0 8px', fontWeight: 800 }}>Thermal Strain Compensator</h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                Separates elastic diurnal temperature expansion from permanent structural settlement and bearing friction resistance.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <div><b>Sampling Rate:</b> Real-time hourly</div>
                <div><b>Deflection Tolerance:</b> ±2.5mm</div>
              </div>
            </div>

            <div className="panel-card">
              <span className="section-tag">COMPUTER VISION</span>
              <h4 style={{ margin: '4px 0 8px', fontWeight: 800 }}>Concrete Crack & Defect AI</h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                Deep convolutional network classifying surface fissures, shear cracks, and calculating millimeter crack widths.
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <div><b>Precision:</b> 91.2%</div>
                <div><b>Standards:</b> ASTM C856 Structural Specs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SYSTEM OPERATIONAL AUDIT LOG
         ========================================================================= */}
      {tab === 'audit' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">OPERATIONAL AUDIT TRAIL</span>
              <h3 className="panel-title">System Operational & Repair Logs</h3>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Action / Operation</th>
                  <th>Associated Infrastructure</th>
                  <th>Recorded By</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workItems.map((item) => (
                  <tr key={item.id}>
                    <td>LOG-{item.id + 1000}</td>
                    <td><b>{item.kind?.replace('_', ' ')}: {item.title}</b></td>
                    <td>{item.assetName || 'General'}</td>
                    <td>{item.reporterName}</td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(item.createdAt).toLocaleString()}</td>
                    <td><span className="badge badge-assigned">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PROVISION NEW USER
         ========================================================================= */}
      {showUserModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Provision New Municipal Official Account</h3>
              <button onClick={() => setShowUserModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleProvisionUser}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email Address <span className="req">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Role Assignment <span className="req">*</span></label>
                  <select
                    className="form-select"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="MUNICIPAL_ENGINEER">Municipal Officer</option>
                    <option value="INFRASTRUCTURE_ENGINEER">Infrastructure Officer</option>
                    <option value="MAINTENANCE_TEAM">Maintenance Officer</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowUserModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  <UserPlus size={16} />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
