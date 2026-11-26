import React, { useState, useEffect } from 'react';
import { workApi, predictionsApi, assetsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MUNICIPAL_CORPORATIONS, getMunicipalityByCity } from '../../utils/municipalities';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  ClipboardList,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  ShieldCheck,
  X,
  PlusCircle,
  Layers,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export default function CitizenDashboard({ tab }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialCorp = getMunicipalityByCity(user?.city);
  const [selectedCorp, setSelectedCorp] = useState(initialCorp);
  const [mapCenter, setMapCenter] = useState([initialCorp.lat, initialCorp.lng]);

  // Issue Reporting Form
  const [form, setForm] = useState({
    title: '',
    category: 'ROAD_DAMAGE',
    locationText: '',
    latitude: initialCorp.lat,
    longitude: initialCorp.lng,
    description: '',
    priority: 'HIGH',
    evidencePhotoUrl: '/cards/infra_card_1.png',
  });

  // AI Damage Preview state
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cList, aList] = await Promise.all([
        workApi.list(),
        assetsApi.list(),
      ]);
      setComplaints(cList);
      setAssets(aList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMunicipalityChange = (e) => {
    const corpId = e.target.value;
    const corp = MUNICIPAL_CORPORATIONS.find((m) => m.id === corpId) || MUNICIPAL_CORPORATIONS[0];
    setSelectedCorp(corp);
    setMapCenter([corp.lat, corp.lng]);
    setForm((prev) => ({
      ...prev,
      latitude: corp.lat,
      longitude: corp.lng,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
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
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        setUploadedImagePreview(compressed);
        setForm((prev) => ({ ...prev, evidencePhotoUrl: compressed }));
      };
      img.src = uploadEvt.target.result;
    };
    reader.readAsDataURL(file);

    setAnalyzingImage(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('roadType', 'URBAN_CORRIDOR');

    try {
      const res = await predictionsApi.runRoadDamage(formData);
      setAiPreview(res);
      setForm((prev) => ({
        ...prev,
        title: `${res.damageType} on ${prev.locationText || selectedCorp.city}`,
        priority: res.severity === 'EMERGENCY_HAZARD' ? 'CRITICAL' : 'HIGH',
      }));
    } catch (err) {
      console.error('AI preview error:', err);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!form.title || !form.locationText || !form.description) {
      showError('Please fill out all required fields.');
      return;
    }

    try {
      await workApi.create({
        kind: 'COMPLAINT',
        title: form.title,
        description: `Municipality: ${selectedCorp.name}. Location: ${form.locationText}. ${form.description} ${
          aiPreview ? `[AI Estimated Cavity Depth: ${aiPreview.estimatedPotholeDepthCm}cm, Severity: ${aiPreview.severity}]` : ''
        }`,
        priority: form.priority,
        evidencePhotoUrl: form.evidencePhotoUrl,
      });

      setForm({
        title: '',
        category: 'ROAD_DAMAGE',
        locationText: '',
        latitude: selectedCorp.lat,
        longitude: selectedCorp.lng,
        description: '',
        priority: 'HIGH',
        evidencePhotoUrl: '/cards/infra_card_1.png',
      });
      setAiPreview(null);
      setUploadedImagePreview(null);
      loadAll();
      showSuccess('Your infrastructure report has been successfully submitted to the Municipal Authority!');
    } catch (err) {
      showError('Submission failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-greeting">{getGreeting()}, {user?.fullName || 'Resident'}</div>
          <div className="welcome-subtitle">Public Infrastructure Service Portal · {selectedCorp.name}</div>
        </div>
        <div className="welcome-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Metric Summary */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="metric-value">{complaints.length}</div>
            <div className="metric-label">My Submitted Reports</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-value">
              {complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length}
            </div>
            <div className="metric-label">Under Municipal Review</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div className="metric-value">
              {complaints.filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length}
            </div>
            <div className="metric-label">Repair Crew Dispatched</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="metric-value">
              {complaints.filter((c) => c.status === 'COMPLETED' || c.status === 'VERIFIED' || c.status === 'CLOSED').length}
            </div>
            <div className="metric-label">Verified & Resolved</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: REPORT ISSUE
         ========================================================================= */}
      {(tab === 'report' || !tab) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.8rem', marginBottom: '2rem' }}>
          {/* Report Form */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <span className="section-tag">PUBLIC SERVICE PORTAL</span>
                <h3 className="panel-title">Report Road Damage or Visible Hazard</h3>
              </div>
            </div>

            <form onSubmit={handleSubmitComplaint}>
              <div className="form-group">
                <label className="form-label">Municipal Corporation (Andhra Pradesh & Telangana) <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={selectedCorp.id}
                  onChange={handleMunicipalityChange}
                  style={{ fontWeight: 600, color: 'var(--primary-dark)' }}
                >
                  <optgroup label="Andhra Pradesh Municipal Corporations">
                    {MUNICIPAL_CORPORATIONS.filter((m) => m.state === 'Andhra Pradesh').map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Telangana Municipal Corporations">
                    {MUNICIPAL_CORPORATIONS.filter((m) => m.state === 'Telangana').map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Problem Category <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="ROAD_DAMAGE">Road Pothole / Crater / Surface Collapse</option>
                  <option value="BRIDGE_CRACK">Visible Concrete Fissure / Bridge Barrier Damage</option>
                  <option value="DRAINAGE">Drainage Flooding / Open Culvert</option>
                  <option value="SAFETY_HAZARD">Guardrail Missing / Pedestrian Danger</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Street Location & Landmark <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Please enter street location and nearby landmark"
                  value={form.locationText}
                  onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Photograph Evidence <span className="req">*</span></label>
                <div
                  style={{
                    border: '2px dashed var(--border-light)',
                    borderRadius: '10px',
                    padding: '1.2rem',
                    textAlign: 'center',
                    background: 'var(--bg-cream)',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="evidence-file"
                  />
                  <label htmlFor="evidence-file" style={{ cursor: 'pointer', display: 'block' }}>
                    <Camera size={32} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem' }}>
                      Upload Hazard Photo for AI Vision Analysis
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      JPEG, PNG · Computer vision automatically estimates cavity severity
                    </div>
                  </label>

                  {analyzingImage && (
                    <div style={{ marginTop: '0.8rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                      Analyzing photograph with AI vision model...
                    </div>
                  )}

                  {uploadedImagePreview && (
                    <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                      <img
                        src={uploadedImagePreview}
                        alt="Evidence Preview"
                        style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* AI Damage Assessment Feedback */}
              {aiPreview && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700 }}>
                    <CheckCircle size={16} />
                    <span>AI Hazard Analysis Complete</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#065f46', marginTop: '4px' }}>
                    Detected: <b>{aiPreview.damageType}</b> · Severity: <b>{aiPreview.severity}</b> · Est. Cavity Depth: <b>{aiPreview.estimatedPotholeDepthCm}cm</b>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Complaint Summary / Title <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Please enter complaint title or summary"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description <span className="req">*</span></label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Please enter detailed description of the observed defect or hazard"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                <Send size={16} />
                <span>Submit Complaint to Municipal Engineer</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Status Tracker of Citizen's Reports */}
          <div className="panel-card">
            <span className="section-tag">MY ACTIVE COMPLAINTS</span>
            <h3 className="panel-title" style={{ marginBottom: '1.2rem' }}>Recent Submissions Status</h3>

            {complaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <AlertTriangle size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p>No complaints submitted yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <b style={{ fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{c.title}</b>
                      <span className={`badge ${c.status === 'COMPLETED' || c.status === 'VERIFIED' || c.status === 'CLOSED' ? 'badge-completed' : 'badge-in-progress'}`}>
                        {c.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      {c.description?.slice(0, 80)}...
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                      Submitted on {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MY SUBMITTED COMPLAINTS
         ========================================================================= */}
      {tab === 'my-reports' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">MY SUBMISSIONS</span>
              <h3 className="panel-title">Track Complaint Status</h3>
            </div>
          </div>

          {complaints.length === 0 ? (
            <p style={{ color: '#64748b' }}>You have not submitted any infrastructure complaints yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reported Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Evidence Photo</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        <b>{c.title}</b>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.description}</div>
                      </td>
                      <td>
                        <span className={`badge ${c.priority === 'CRITICAL' ? 'badge-closed' : 'badge-in-progress'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'COMPLETED' || c.status === 'VERIFIED' || c.status === 'CLOSED' ? 'badge-completed' : 'badge-submitted'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.evidencePhotoUrl ? (
                          <img
                            src={c.evidencePhotoUrl}
                            alt="Evidence"
                            style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          'No Photo'
                        )}
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: MUNICIPAL PUBLIC MAP
         ========================================================================= */}
      {tab === 'city-status' && (
        <div className="panel-card">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">PUBLIC CARTOGRAPHY</span>
              <h3 className="panel-title">City Infrastructure Map & Public Hazards</h3>
            </div>
            <div style={{ minWidth: '280px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Center Map on Corporation:
              </label>
              <select
                className="form-select"
                value={selectedCorp.id}
                onChange={handleMunicipalityChange}
                style={{ fontSize: '0.88rem', padding: '6px 12px' }}
              >
                <optgroup label="Andhra Pradesh Municipal Corporations">
                  {MUNICIPAL_CORPORATIONS.filter((m) => m.state === 'Andhra Pradesh').map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Telangana Municipal Corporations">
                  {MUNICIPAL_CORPORATIONS.filter((m) => m.state === 'Telangana').map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div style={{ height: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {assets.map((a) => (
                <Marker key={a.id} position={[a.latitude || mapCenter[0], a.longitude || mapCenter[1]]}>
                  <Popup>
                    <div style={{ padding: '4px' }}>
                      <b style={{ color: 'var(--primary-dark)' }}>{a.name}</b>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.locationText}</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        Structural Health: <b>{a.structuralHealth || 85}%</b>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}