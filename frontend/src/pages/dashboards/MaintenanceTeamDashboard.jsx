import React, { useState, useEffect } from 'react';
import { workApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ClipboardList,
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Upload,
  Camera,
  X,
  FileCheck,
  Send,
  Radio,
  Layers,
  ArrowRight,
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function MaintenanceTeamDashboard({ tab }) {
  const { showSuccess, showError } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal: Complete Task
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [resolvedImagePreview, setResolvedImagePreview] = useState('/cards/infra_card_8.png');
  const [completionForm, setCompletionForm] = useState({
    workPerformed: '',
    materialsUsed: '',
    completionRemarks: '',
    completionPhotoUrl: '/cards/infra_card_8.png',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const list = await workApi.list();
      setTasks(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (task) => {
    try {
      await workApi.transition(task.id, {
        status: 'IN_PROGRESS',
        workPerformed: 'Maintenance crew mobilized on site with repair equipment. Physical non-destructive inspection initiated.',
      });
      loadTasks();
      showSuccess(`Work Order #${task.id} marked IN PROGRESS! Repair crew active on site.`);
    } catch (err) {
      showError('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenCompleteModal = (task) => {
    setActiveTask(task);
    setResolvedImagePreview('/cards/feature_5.png');
    setCompletionForm({
      workPerformed: 'Completed physical crack depth testing and joint bearing level verification. Recalibrated expansion gap to 14mm and sealed with high-pressure epoxy resin.',
      materialsUsed: 'Sikadur 52 high-pressure epoxy resin (4L), cold asphalt patch (25kg), high-tensile anchor bolts (4 units).',
      completionRemarks: 'Girder deflection stabilized within municipal safety margin. No immediate structural danger detected.',
      completionPhotoUrl: '/cards/feature_5.png',
    });
    setShowCompleteModal(true);
  };

  const handleResolvedPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
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
          setResolvedImagePreview(compressed);
          setCompletionForm((prev) => ({ ...prev, completionPhotoUrl: compressed }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCompletionReport = async (e) => {
    e.preventDefault();
    if (!activeTask) return;
    try {
      await workApi.transition(activeTask.id, {
        status: 'COMPLETED',
        workPerformed: completionForm.workPerformed,
        materialsUsed: completionForm.materialsUsed,
        completionRemarks: completionForm.completionRemarks,
        completionPhotoUrl: completionForm.completionPhotoUrl,
      });
      setShowCompleteModal(false);
      loadTasks();
      showSuccess('Field Completion Report & Photographic Proof submitted! The Infrastructure Officer has been notified for verification.');
    } catch (err) {
      showError('Failed to submit report: ' + (err.response?.data?.message || err.message));
    }
  };

  const assignedTasks = tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'SUBMITTED' || t.status === 'APPROVED');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'SUBMITTED_FOR_VERIFICATION' || t.status === 'VERIFIED' || t.status === 'CLOSED');

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-greeting">{getGreeting()}, Er. B. Tharun Reddy</div>
          <div className="welcome-subtitle">Civil Infrastructure Rapid Repair Wing · Maintenance Directorate</div>
        </div>
        <div className="welcome-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Metric Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="metric-value">{assignedTasks.length}</div>
            <div className="metric-label">Assigned Work Orders</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div className="metric-value">{inProgressTasks.length}</div>
            <div className="metric-label">Repairs In Progress</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="metric-value">{completedTasks.length}</div>
            <div className="metric-label">Completed Repairs</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)' }}>
            <Radio size={24} />
          </div>
          <div>
            <div className="metric-value">100%</div>
            <div className="metric-label">Crew Readiness Level</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: ASSIGNED TASKS (MAIN)
         ========================================================================= */}
      {(tab === 'tasks' || !tab) && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">FIELD REPAIR DISPATCH</span>
              <h3 className="panel-title">Assigned Maintenance Tasks</h3>
            </div>
          </div>

          {assignedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.15rem', color: '#1e293b' }}>All Assigned Tasks Addressed</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                New maintenance requests dispatched by the Infrastructure Officer will appear here instantly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    padding: '1.4rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-assigned">{task.assetCode || 'CIVIL'}</span>
                      <span className={`badge ${task.priority === 'CRITICAL' ? 'badge-closed' : 'badge-in-progress'}`}>
                        {task.priority}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Due: {task.dueDate || 'Immediate'}</span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 6px' }}>
                      {task.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {task.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleStartWork(task)}
                      className="btn-secondary"
                      style={{ padding: '9px 16px', fontSize: '0.86rem' }}
                    >
                      <Wrench size={16} />
                      <span>Start Repair</span>
                    </button>
                    <button
                      onClick={() => handleOpenCompleteModal(task)}
                      className="btn-primary"
                      style={{ padding: '9px 18px', fontSize: '0.86rem', background: '#059669' }}
                    >
                      <CheckCircle size={16} />
                      <span>Complete Task & Upload Proof</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ACTIVE REPAIRS IN PROGRESS
         ========================================================================= */}
      {tab === 'in-progress' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">SITE EXECUTION</span>
              <h3 className="panel-title">Repairs Currently In Progress</h3>
            </div>
          </div>

          {inProgressTasks.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No repairs currently marked in progress.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: '#fffbeb',
                    borderRadius: '10px',
                    border: '1.5px solid #fde68a',
                    padding: '1.4rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-in-progress">IN PROGRESS</span>
                      <b style={{ color: '#92400e' }}>{task.assetName}</b>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#78350f', margin: '0 0 6px' }}>
                      {task.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1.5, margin: 0 }}>
                      {task.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenCompleteModal(task)}
                    className="btn-primary"
                    style={{ padding: '9px 18px', fontSize: '0.86rem', background: '#059669' }}
                  >
                    <CheckCircle size={16} />
                    <span>Complete Task & Upload Proof</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: COMPLETED WORK ORDERS ARCHIVE
         ========================================================================= */}
      {tab === 'history' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">HISTORICAL AUDIT</span>
              <h3 className="panel-title">Completed Work Orders & Field Reports</h3>
            </div>
          </div>

          {completedTasks.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No completed work orders logged yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Asset</th>
                    <th>Title</th>
                    <th>Work Performed</th>
                    <th>Resolved Photo Proof</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTasks.map((task) => (
                    <tr key={task.id}>
                      <td>#{task.id}</td>
                      <td><b>{task.assetName}</b></td>
                      <td><b>{task.title}</b></td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>{task.workPerformed}</td>
                      <td>
                        {task.completionPhotoUrl ? (
                          <img
                            src={task.completionPhotoUrl}
                            alt="Resolved Evidence"
                            style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #10b981' }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${task.status === 'VERIFIED' || task.status === 'CLOSED' ? 'badge-completed' : 'badge-assigned'}`}>
                          {task.status}
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
          MODAL: UPLOAD FIELD COMPLETION EVIDENCE (FIX 403 & SUPPORT RESOLVED IMAGE)
         ========================================================================= */}
      {showCompleteModal && activeTask && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Field Completion Evidence</h3>
              <button onClick={() => setShowCompleteModal(false)} className="modal-close"><X size={20} /></button>
            </div>

            <form onSubmit={submitCompletionReport}>
              <div style={{ marginBottom: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <b style={{ color: 'var(--primary-dark)' }}>{activeTask.title}</b>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>{activeTask.assetName}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Work Performed On Site <span className="req">*</span></label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Please describe repair work performed on site"
                  value={completionForm.workPerformed}
                  onChange={(e) => setCompletionForm({ ...completionForm, workPerformed: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Materials Used & Equipment <span className="req">*</span></label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Please list materials and equipment used"
                  value={completionForm.materialsUsed}
                  onChange={(e) => setCompletionForm({ ...completionForm, materialsUsed: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Completion Remarks & Post-Repair Condition <span className="req">*</span></label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Please enter post-repair condition and engineering remarks"
                  value={completionForm.completionRemarks}
                  onChange={(e) => setCompletionForm({ ...completionForm, completionRemarks: e.target.value })}
                  required
                />
              </div>

              {/* Resolved Photo Evidence Upload Field */}
              <div className="form-group">
                <label className="form-label">Completion Photograph Evidence (Resolved Image) <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={resolvedImagePreview}
                    alt="Resolved Preview"
                    style={{ width: '90px', height: '65px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleResolvedPhotoChange}
                      className="form-input"
                      style={{ padding: '6px' }}
                    />
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      Upload photo proof showing repaired girder, sealed crack, or paved road.
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCompleteModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#059669' }}>
                  <Send size={16} />
                  <span>Submit Completion Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
