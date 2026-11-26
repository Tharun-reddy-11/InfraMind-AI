import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetsApi, workApi, adminApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Bridge,
  ClipboardList,
  AlertTriangle,
  PlusCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Users,
  Send,
  X,
  FileCheck,
  Building,
  Upload,
  Camera,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
import { MUNICIPAL_CORPORATIONS } from '../../utils/municipalities';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function MunicipalEngineerDashboard({ tab }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [assets, setAssets] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [maintenanceTeams, setMaintenanceTeams] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAsset, setSubmittingAsset] = useState(false);

  // Modal: Register Asset
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetImagePreview, setAssetImagePreview] = useState('/cards/feature_1.png');
  const [assetForm, setAssetForm] = useState({
    name: '',
    assetCode: '',
    category: 'BRIDGE',
    locationText: '',
    latitude: 13.6358,
    longitude: 79.4244,
    constructionYear: 2021,
    department: 'Bridge & Arterial Corridors Division',
    displacementBaseline: 11.8,
    imageUrl: '/cards/feature_1.png',
    assignedEngineerId: '',
  });

  // Modal: Assign Task to Maintenance Team
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [assignForm, setAssignForm] = useState({
    assigneeId: '',
    dueDate: '',
    reviewerRemarks: '',
  });

  // Modal: Verify & Close Work Order
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [verifyRemarks, setVerifyRemarks] = useState('Work verified on site. Repairs conform to municipal standards.');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [assetList, workList, teams, engs] = await Promise.all([
        assetsApi.list(),
        workApi.list(),
        adminApi.listMaintenanceTeams(),
        adminApi.listEngineers(),
      ]);
      setAssets(assetList);
      setWorkItems(workList);
      setMaintenanceTeams(teams);
      setEngineers(engs);
      if (engs.length > 0) {
        setAssetForm((prev) => ({ ...prev, assignedEngineerId: engs[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setAssetImagePreview(compressed);
          setAssetForm((prev) => ({ ...prev, imageUrl: compressed }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterAsset = async (e, postToInfra = true) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!assetForm.name || !assetForm.assetCode || !assetForm.locationText) {
      showError('Please fill in Asset Code, Name, and Specific Location fields.');
      return;
    }
    setSubmittingAsset(true);
    try {
      const assignedId = assetForm.assignedEngineerId && Number(assetForm.assignedEngineerId) > 0
        ? Number(assetForm.assignedEngineerId)
        : (engineers.length > 0 ? engineers[0].id : null);

      const created = await assetsApi.create({
        name: assetForm.name.trim(),
        assetCode: assetForm.assetCode.trim().toUpperCase(),
        category: assetForm.category,
        locationText: assetForm.locationText.trim(),
        latitude: parseFloat(assetForm.latitude) || 13.6288,
        longitude: parseFloat(assetForm.longitude) || 79.4192,
        constructionYear: parseInt(assetForm.constructionYear) || 2021,
        department: assetForm.department || 'Bridge & Arterial Corridors Division',
        displacementBaseline: parseFloat(assetForm.displacementBaseline) || 10.0,
        imageUrl: assetForm.imageUrl || '/cards/feature_1.png',
        assignedEngineerId: assignedId,
      });

      setShowAssetModal(false);
      setAssetForm({
        name: '',
        assetCode: '',
        category: 'BRIDGE',
        locationText: '',
        latitude: 13.6358,
        longitude: 79.4244,
        constructionYear: 2021,
        department: 'Bridge & Arterial Corridors Division',
        displacementBaseline: 11.8,
        imageUrl: '/cards/feature_1.png',
        assignedEngineerId: engineers[0]?.id || '',
      });
      setAssetImagePreview('/cards/feature_1.png');

      // Real-time broadcast sync to any open tab or window
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('inframind_sync');
          bc.postMessage({ type: 'ASSET_CREATED', assetId: created.id });
          bc.close();
        } catch {}
      }
      localStorage.setItem('inframind_last_asset_sync', JSON.stringify({ assetId: created.id, time: Date.now() }));
      sessionStorage.setItem('inframind_selected_asset_id', String(created.id));

      if (postToInfra) {
        showInfo(`Posting "${created.name}" directly to Infrastructure Engineer workspace...`);
        try {
          const infraAuth = await authApi.login({
            email: 'btharunreddy30@gmail.com',
            password: 'Tharun@30',
          });
          login(infraAuth);
          showSuccess(`Asset "${created.name}" successfully registered and posted directly to Infrastructure Engineer!`);
          window.location.href = '/dashboard';
          return;
        } catch (loginErr) {
          console.warn('Auto switch to infra engineer failed', loginErr);
        }
      }

      const updated = await assetsApi.list();
      setAssets(updated);
      showSuccess(`Asset "${created.name}" (${created.assetCode}) successfully registered in Municipal Database!`);
    } catch (err) {
      console.error(err);
      showError('Registration failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAsset(false);
    }
  };

  const handleApproveAndAssign = (item) => {
    setSelectedWorkItem(item);
    setAssignForm({
      assigneeId: maintenanceTeams[0]?.id || '',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      reviewerRemarks: 'Approved for immediate field dispatch. Conduct physical non-destructive inspection.',
    });
    setShowAssignModal(true);
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedWorkItem) return;
    try {
      await workApi.transition(selectedWorkItem.id, {
        status: 'ASSIGNED',
        assigneeId: Number(assignForm.assigneeId),
        dueDate: assignForm.dueDate,
        reviewerRemarks: assignForm.reviewerRemarks,
      });
      setShowAssignModal(false);
      const w = await workApi.list();
      setWorkItems(w);
      showSuccess('Work order approved and assigned to Maintenance Team!');
    } catch (err) {
      showError('Assignment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyAndForwardToInfra = async (complaint) => {
    try {
      await workApi.transition(complaint.id, {
        status: 'UNDER_REVIEW',
        reviewerRemarks: 'Verified by Municipal Officer and forwarded to Infrastructure Officer for ML structural analysis.',
      });
      const w = await workApi.list();
      setWorkItems(w);
      showSuccess(`Complaint #${complaint.id} verified and forwarded to Infrastructure Officer for AI analysis.`);
    } catch (err) {
      showError('Failed to forward: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (item) => {
    const reason = prompt('Please enter reason for rejecting request:');
    if (!reason) return;
    try {
      await workApi.transition(item.id, {
        status: 'REJECTED',
        reviewerRemarks: reason,
      });
      const w = await workApi.list();
      setWorkItems(w);
      showSuccess(`Work item #${item.id} rejected.`);
    } catch (err) {
      showError('Reject failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const submitVerificationClose = async () => {
    if (!verifyingItem) return;
    try {
      await workApi.transition(verifyingItem.id, {
        status: 'CLOSED',
        reviewerRemarks: verifyRemarks,
      });
      setShowVerifyModal(false);
      const [w, a] = await Promise.all([workApi.list(), assetsApi.list()]);
      setWorkItems(w);
      setAssets(a);
      showSuccess('Work order verified and officially closed! Infrastructure records updated to Healthy.');
    } catch (err) {
      showError('Verification failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Group work items
  const pendingApprovals = workItems.filter(
    (w) => w.kind === 'MAINTENANCE_REQUEST' && (w.status === 'SUBMITTED' || w.status === 'UNDER_REVIEW')
  );
  const citizenComplaints = workItems.filter(
    (w) => w.kind === 'COMPLAINT' && w.status !== 'CLOSED' && w.status !== 'REJECTED'
  );
  const completedAwaitingVerification = workItems.filter(
    (w) => w.status === 'COMPLETED' || w.status === 'SUBMITTED_FOR_VERIFICATION'
  );

  // Analytics Chart Data
  const healthDistributionData = [
    { name: 'Optimal (85-100)', value: assets.filter((a) => (a.structuralHealth || 85) >= 85).length, color: '#10b981' },
    { name: 'Fair (70-84)', value: assets.filter((a) => (a.structuralHealth || 85) >= 70 && (a.structuralHealth || 85) < 85).length, color: '#38bdf8' },
    { name: 'At Risk (<70)', value: assets.filter((a) => (a.structuralHealth || 85) < 70).length, color: '#ef4444' },
  ];

  const categoryBarData = [
    { category: 'Bridges', count: assets.filter((a) => a.category === 'BRIDGE').length },
    { category: 'Overpasses', count: assets.filter((a) => a.category === 'OVERPASS').length },
    { category: 'Roads', count: assets.filter((a) => a.category === 'ROAD').length },
    { category: 'Tunnels', count: assets.filter((a) => a.category === 'TUNNEL').length },
    { category: 'Culverts', count: assets.filter((a) => a.category === 'CULVERT').length },
  ];

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-greeting">{getGreeting()}, Er. B. Tharun Reddy</div>
          <div className="welcome-subtitle">Municipal Officer Directorate · Tirupati Municipal Corporation</div>
        </div>
        <div className="welcome-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <Bridge size={24} />
          </div>
          <div>
            <div className="metric-value">{assets.length}</div>
            <div className="metric-label">Registered Municipal Assets</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="metric-value">{pendingApprovals.length}</div>
            <div className="metric-label">Pending Maintenance Approvals</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="metric-value">{citizenComplaints.length}</div>
            <div className="metric-label">Citizen Road Complaints</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div className="metric-value">{completedAwaitingVerification.length}</div>
            <div className="metric-label">Ready for Municipal Closure</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
         ========================================================================= */}
      {(tab === 'overview' || !tab) && (
        <div>
          <div
            className="panel-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
              border: '1.5px solid #bfdbfe',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                Municipal Infrastructure Command Directorate
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Register civil infrastructure assets, inspect ML risk forecasts, authorize maintenance orders, and verify field repairs.
              </p>
            </div>
            <button
              onClick={() => setShowAssetModal(true)}
              className="btn-primary"
              style={{ padding: '10px 22px' }}
            >
              <PlusCircle size={18} />
              <span>Register New Infrastructure</span>
            </button>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="panel-card">
              <span className="section-tag">CIVIL ASSET INVENTORY</span>
              <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Infrastructure by Category</h3>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Asset Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel-card">
              <span className="section-tag">HEALTH CONDITION INDEX</span>
              <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Structural Health Distribution</h3>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {healthDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Assets List */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <span className="section-tag">MUNICIPAL ASSET REGISTER</span>
                <h3 className="panel-title">Active City Infrastructure Assets</h3>
              </div>
              <button onClick={() => setShowAssetModal(true)} className="btn-secondary" style={{ fontSize: '0.86rem' }}>
                <PlusCircle size={15} />
                <span>Add Infrastructure</span>
              </button>
            </div>

            {assets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <Bridge size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.4rem' }}>No Infrastructure Assets Registered Yet</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.4rem' }}>
                  Click below to register the first bridge, road, or overpass with specifications and image. It will immediately appear on the Infrastructure Officer's workspace.
                </p>
                <button onClick={() => setShowAssetModal(true)} className="btn-primary">
                  <PlusCircle size={18} />
                  <span>Register First Infrastructure Asset</span>
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Asset Code</th>
                      <th>Photo</th>
                      <th>Asset Name</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Year</th>
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
                            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            onError={(e) => { e.target.src = '/cards/feature_1.png'; }}
                          />
                        </td>
                        <td><b>{a.name}</b></td>
                        <td><span className="badge badge-assigned">{a.category}</span></td>
                        <td style={{ fontSize: '0.85rem', color: '#475569' }}>{a.locationText}</td>
                        <td>{a.constructionYear}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', minWidth: '60px' }}>
                              <div
                                style={{
                                  width: `${a.structuralHealth || 85}%`,
                                  height: '100%',
                                  background: (a.structuralHealth || 85) >= 80 ? '#10b981' : (a.structuralHealth || 85) >= 60 ? '#f59e0b' : '#ef4444',
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.structuralHealth || 85}%</span>
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: REGISTRY
         ========================================================================= */}
      {tab === 'registry' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">OFFICIAL REGISTRATION</span>
              <h3 className="panel-title">Municipal Infrastructure Registry</h3>
            </div>
            <button onClick={() => setShowAssetModal(true)} className="btn-primary">
              <PlusCircle size={18} />
              <span>Register New Asset</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Location Text</th>
                  <th>GPS Coordinates</th>
                  <th>Year Built</th>
                  <th>Department</th>
                  <th>Health</th>
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
                        style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        onError={(e) => { e.target.src = '/cards/feature_1.png'; }}
                      />
                    </td>
                    <td><b>{a.name}</b></td>
                    <td><span className="badge badge-assigned">{a.category}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{a.locationText}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)}</td>
                    <td>{a.constructionYear}</td>
                    <td style={{ fontSize: '0.82rem' }}>{a.department}</td>
                    <td>
                      <span className={`badge ${(a.structuralHealth || 85) >= 80 ? 'badge-completed' : 'badge-in-progress'}`}>
                        {a.structuralHealth || 85}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: APPROVALS
         ========================================================================= */}
      {tab === 'approvals' && (
        <div>
          <div className="panel-card" style={{ marginBottom: '2rem' }}>
            <span className="section-tag">ENGINEERING ORDERS</span>
            <h3 className="panel-title" style={{ marginBottom: '1.2rem' }}>Maintenance Requests Awaiting Municipal Dispatch</h3>

            {pendingApprovals.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No pending maintenance requests awaiting municipal authorization.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Target Asset</th>
                      <th>Subject & Directive</th>
                      <th>Priority</th>
                      <th>Reporter</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td><b>{item.assetName}</b></td>
                        <td>
                          <b>{item.title}</b>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.description}</div>
                        </td>
                        <td>
                          <span className={`badge ${item.priority === 'CRITICAL' ? 'badge-closed' : 'badge-in-progress'}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td>{item.reporterName}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApproveAndAssign(item)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Dispatch Crew
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed Repairs Ready for Municipal Verification */}
          <div className="panel-card">
            <span className="section-tag">REPAIR COMPLETION SIGN-OFF</span>
            <h3 className="panel-title" style={{ marginBottom: '1.2rem' }}>Completed Field Work Orders Awaiting Final Sign-Off</h3>

            {completedAwaitingVerification.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No completed repairs currently pending municipal closure.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Asset</th>
                      <th>Work Summary</th>
                      <th>Field Work Performed</th>
                      <th>Resolved Photo Proof</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedAwaitingVerification.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td><b>{item.assetName}</b></td>
                        <td><b>{item.title}</b></td>
                        <td style={{ fontSize: '0.85rem', color: '#475569' }}>{item.workPerformed || 'Repairs finished on site.'}</td>
                        <td>
                          {item.completionPhotoUrl ? (
                            <img
                              src={item.completionPhotoUrl}
                              alt="Completion Proof"
                              style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10b981' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No Photo</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setVerifyingItem(item);
                              setShowVerifyModal(true);
                            }}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#059669' }}
                          >
                            Verify & Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: COMPLAINTS
         ========================================================================= */}
      {tab === 'complaints' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">PUBLIC SERVICE REPORTS</span>
              <h3 className="panel-title">Citizen Hazard & Road Defect Reports</h3>
            </div>
          </div>

          {citizenComplaints.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No citizen complaints registered at this time.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Report Summary</th>
                    <th>Citizen Reporter</th>
                    <th>Priority</th>
                    <th>Evidence Photo</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {citizenComplaints.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        <b>{c.title}</b>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{c.description}</div>
                      </td>
                      <td>{c.reporterName}</td>
                      <td>
                        <span className={`badge ${c.priority === 'CRITICAL' ? 'badge-closed' : 'badge-in-progress'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td>
                        {c.evidencePhotoUrl ? (
                          <img
                            src={c.evidencePhotoUrl}
                            alt="Evidence"
                            style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No Photo</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'UNDER_REVIEW' ? 'badge-in-progress' : c.status === 'COMPLETED' || c.status === 'CLOSED' ? 'badge-completed' : 'badge-submitted'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.status === 'SUBMITTED' ? (
                          <button
                            onClick={() => handleVerifyAndForwardToInfra(c)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#2563eb' }}
                          >
                            Verify & Forward to Infra Officer
                          </button>
                        ) : c.status === 'UNDER_REVIEW' ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>
                            Forwarded (Pending AI Analysis)
                          </span>
                        ) : (
                          <span className="badge badge-assigned">{c.status}</span>
                        )}
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
          TAB 5: MAP
         ========================================================================= */}
      {tab === 'map' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">GEOSPATIAL CARTOGRAPHY</span>
              <h3 className="panel-title">Municipal GIS Infrastructure Map</h3>
            </div>
          </div>
          <div style={{ height: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <MapContainer center={[13.6288, 79.4192]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {assets.map((a) => (
                <Marker key={a.id} position={[a.latitude || 13.6288, a.longitude || 79.4192]}>
                  <Popup>
                    <div style={{ padding: '4px', maxWidth: '200px' }}>
                      <img
                        src={a.imageUrl || '/cards/feature_1.png'}
                        alt={a.name}
                        style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }}
                      />
                      <b style={{ color: 'var(--primary-dark)', fontSize: '0.95rem' }}>{a.name}</b>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0' }}>{a.locationText}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: (a.structuralHealth || 85) >= 80 ? '#059669' : '#dc2626' }}>
                        Structural Health: {a.structuralHealth || 85}%
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER INFRASTRUCTURE ASSET
         ========================================================================= */}
      {showAssetModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Municipal Infrastructure Asset</h3>
              <button onClick={() => setShowAssetModal(false)} className="modal-close"><X size={20} /></button>
            </div>

            <form onSubmit={handleRegisterAsset}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Asset Code / ID <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. BRG-2026-01"
                    value={assetForm.assetCode}
                    onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category <span className="req">*</span></label>
                  <select
                    className="form-select"
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                  >
                    <option value="BRIDGE">Bridge (Highway / Arterial)</option>
                    <option value="OVERPASS">Flyover / Overpass</option>
                    <option value="ROAD">Municipal Roadway / Corridor</option>
                    <option value="CULVERT">Major Stormwater Culvert</option>
                    <option value="TUNNEL">Underpass / Tunnel</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Asset Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alipiri Swamy Pushkarini Flyover"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specific Street Location & Landmark <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. National Highway 71 Junction, Tirupati Outer Ring"
                  value={assetForm.locationText}
                  onChange={(e) => setAssetForm({ ...assetForm, locationText: e.target.value })}
                  required
                />
              </div>

              {/* Photo Upload & Preview Field */}
              <div className="form-group">
                <label className="form-label">Infrastructure Photograph / Image Upload <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={assetImagePreview}
                    alt="Asset Preview"
                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #cbd5e1' }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="form-input"
                      style={{ padding: '6px' }}
                    />
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      Upload site photo or select standard civil infrastructure imagery.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={assetForm.latitude}
                    onChange={(e) => setAssetForm({ ...assetForm, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={assetForm.longitude}
                    onChange={(e) => setAssetForm({ ...assetForm, longitude: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year Built</label>
                  <input
                    type="number"
                    className="form-input"
                    value={assetForm.constructionYear}
                    onChange={(e) => setAssetForm({ ...assetForm, constructionYear: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Responsible Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={assetForm.department}
                    onChange={(e) => setAssetForm({ ...assetForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Displacement Baseline (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={assetForm.displacementBaseline}
                    onChange={(e) => setAssetForm({ ...assetForm, displacementBaseline: e.target.value })}
                  />
                </div>
              </div>

              {/* Infrastructure Engineer Assignment */}
              <div className="form-group" style={{ background: '#f0f9ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <label className="form-label" style={{ color: '#0369a1', fontWeight: 700 }}>
                  Assigned Infrastructure Engineer (for ML Predictive Risk Inspection) <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={assetForm.assignedEngineerId || ''}
                  onChange={(e) => setAssetForm({ ...assetForm, assignedEngineerId: e.target.value })}
                  style={{ background: '#ffffff', fontWeight: 600 }}
                >
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.fullName} ({eng.email}) · Bridge & Structural Cell
                    </option>
                  ))}
                  {engineers.length === 0 && (
                    <option value="">Er. B. Tharun Reddy (Infrastructure Officer)</option>
                  )}
                </select>
                <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '5px' }}>
                  Clicking "Register & Post to Infra Engineer" saves the asset and directly routes you into the Infrastructure Engineer workspace with this asset active.
                </div>
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="btn-secondary"
                  disabled={submittingAsset}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRegisterAsset(e, false)}
                  className="btn-secondary"
                  style={{ border: '1.5px solid #cbd5e1' }}
                  disabled={submittingAsset}
                >
                  <PlusCircle size={15} />
                  <span>Save to Registry Only</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRegisterAsset(e, true)}
                  className="btn-primary"
                  disabled={submittingAsset}
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
                    padding: '11px 24px',
                    fontWeight: 700,
                  }}
                >
                  <Send size={16} />
                  <span>{submittingAsset ? 'Registering & Posting...' : 'Register & Post to Infra Engineer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DISPATCH TASK TO MAINTENANCE TEAM
         ========================================================================= */}
      {showAssignModal && selectedWorkItem && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Authorize & Dispatch Maintenance Crew</h3>
              <button onClick={() => setShowAssignModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={submitAssignment}>
              <div style={{ marginBottom: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <b style={{ color: 'var(--primary-dark)' }}>{selectedWorkItem.title}</b>
                <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '4px 0 0' }}>{selectedWorkItem.description}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Select Maintenance Crew <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={assignForm.assigneeId}
                  onChange={(e) => setAssignForm({ ...assignForm, assigneeId: e.target.value })}
                  required
                >
                  {maintenanceTeams.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.city || 'Tirupati'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={assignForm.dueDate}
                  onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Engineering Instructions</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={assignForm.reviewerRemarks}
                  onChange={(e) => setAssignForm({ ...assignForm, reviewerRemarks: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  <Send size={16} />
                  <span>Dispatch Maintenance Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VERIFY & CLOSE WORK ORDER
         ========================================================================= */}
      {showVerifyModal && verifyingItem && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Verify & Sign Off Completed Repairs</h3>
              <button onClick={() => setShowVerifyModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <div>
              <div style={{ marginBottom: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <b style={{ color: 'var(--primary-dark)' }}>{verifyingItem.title}</b>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                  <b>Work Performed by Crew:</b> {verifyingItem.workPerformed}
                </div>
                {verifyingItem.materialsUsed && (
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                    <b>Materials Used:</b> {verifyingItem.materialsUsed}
                  </div>
                )}
              </div>

              {verifyingItem.completionPhotoUrl && (
                <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
                  <label className="form-label" style={{ textAlign: 'left' }}>Field Completion Photograph Evidence:</label>
                  <img
                    src={verifyingItem.completionPhotoUrl}
                    alt="Completion Proof"
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Municipal Engineer Sign-Off Remarks</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowVerifyModal(false)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={submitVerificationClose} className="btn-primary" style={{ background: '#059669' }}>
                  <CheckCircle size={16} />
                  <span>Approve & Restore Asset Health</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
