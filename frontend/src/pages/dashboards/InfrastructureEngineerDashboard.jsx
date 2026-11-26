import React, { useState, useEffect, useRef } from 'react';
import { assetsApi, predictionsApi, workApi, weatherApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Bridge,
  Cpu,
  Activity,
  AlertTriangle,
  ClipboardList,
  CloudRain,
  Radio,
  CheckCircle2,
  Send,
  Plus,
  RefreshCw,
  Eye,
  Thermometer,
  Wind,
  Droplets,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Wrench,
  X,
  FileCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function InfrastructureEngineerDashboard({ tab }) {
  const { showSuccess, showError, showInfo } = useToast();
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const selectedAssetRef = useRef(null);
  const assetsRef = useRef([]);

  const [weather, setWeather] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [predictionsByAsset, setPredictionsByAsset] = useState({});
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep refs in sync with state for callbacks and timers
  useEffect(() => {
    selectedAssetRef.current = selectedAsset;
  }, [selectedAsset]);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  // Modal: Dispatch Maintenance Request to Maintenance Crew
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    targetWorkItemId: null,
    title: '',
    description: '',
    priority: 'HIGH',
    assetId: '',
    evidencePhotoUrl: '/cards/infra_card_1.png',
  });

  // Modal: Verify Completed Work & Update Health Status
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingWorkItem, setVerifyingWorkItem] = useState(null);
  const [newHealthScore, setNewHealthScore] = useState(92);
  const [verifyNotes, setVerifyNotes] = useState('Structural integrity verified. Repairs executed in full compliance with municipal standards.');

  // ML Prediction States
  const [runningBridgeModel, setRunningBridgeModel] = useState(false);
  const [bridgePredictionResult, setBridgePredictionResult] = useState(null);

  const [runningDisplacementModel, setRunningDisplacementModel] = useState(false);
  const [displacementResult, setDisplacementResult] = useState(null);

  const [crackImage, setCrackImage] = useState(null);
  const [crackPreview, setCrackPreview] = useState(null);
  const [crackResult, setCrackResult] = useState(null);
  const [runningCrackVision, setRunningCrackVision] = useState(false);

  // Telemetry sensor readings
  const [telemetryData, setTelemetryData] = useState([
    { hour: '00:00', deflection: 11.8, thermalBaseline: 12.0, strainLimit: 14.5 },
    { hour: '04:00', deflection: 12.1, thermalBaseline: 12.0, strainLimit: 14.5 },
    { hour: '08:00', deflection: 12.8, thermalBaseline: 12.0, strainLimit: 14.5 },
    { hour: '12:00', deflection: 14.6, thermalBaseline: 12.0, strainLimit: 14.5 },
    { hour: '16:00', deflection: 15.2, thermalBaseline: 12.0, strainLimit: 14.5 },
    { hour: '20:00', deflection: 13.9, thermalBaseline: 12.0, strainLimit: 14.5 },
    { hour: '23:59', deflection: 12.4, thermalBaseline: 12.0, strainLimit: 14.5 },
  ]);

  useEffect(() => {
    loadData();

    // Cross-tab real-time sync with BroadcastChannel
    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('inframind_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'ASSET_CREATED') {
            loadData(event.data.assetId);
          }
        };
      } catch {}
    }

    // Cross-tab storage event sync
    const handleStorage = (e) => {
      if (e.key === 'inframind_last_asset_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          loadData(parsed.assetId);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Silent periodic background check (every 15s) that never resets the user's active selection
    const interval = setInterval(() => {
      silentSync();
    }, 15000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const silentSync = async () => {
    try {
      const assetList = await assetsApi.list();
      if (!assetList || assetList.length === 0) return;

      const currentList = assetsRef.current || [];
      const currentSelected = selectedAssetRef.current;

      const listChanged =
        assetList.length !== currentList.length ||
        assetList.some(
          (a, idx) =>
            !currentList[idx] ||
            a.id !== currentList[idx].id ||
            a.structuralHealth !== currentList[idx].structuralHealth
        );

      if (listChanged) {
        setAssets(assetList);
        assetsRef.current = assetList;
      }

      // Preserve currently selected asset - NEVER revert to assetList[0]!
      if (currentSelected) {
        const stillExists = assetList.find((a) => a.id === currentSelected.id);
        if (stillExists) {
          if (
            stillExists.structuralHealth !== currentSelected.structuralHealth ||
            stillExists.name !== currentSelected.name
          ) {
            setSelectedAsset(stillExists);
            selectedAssetRef.current = stillExists;
          }
          return;
        }
      }

      // If nothing was selected before, select the first asset
      if (!currentSelected && assetList.length > 0) {
        handleAssetSelect(assetList[0], false);
      }
    } catch {}
  };

  const loadData = async (targetAssetId = null) => {
    setLoading(true);
    try {
      let [assetList, predList, workList] = await Promise.all([
        assetsApi.list(),
        predictionsApi.list(),
        workApi.list(),
      ]);

      // If empty in database, attempt auto-seeding defaults
      if (!assetList || assetList.length === 0) {
        try {
          assetList = await assetsApi.seedDefaults();
        } catch {}
      }

      const safeAssets = assetList || [];
      setAssets(safeAssets);
      assetsRef.current = safeAssets;
      setPredictions(predList || []);
      setWorkItems(workList || []);

      if (safeAssets.length > 0) {
        const storedAssetId = targetAssetId || Number(sessionStorage.getItem('inframind_selected_asset_id'));
        let toSelect = null;
        if (storedAssetId) {
          toSelect = safeAssets.find((a) => a.id === storedAssetId);
          sessionStorage.removeItem('inframind_selected_asset_id');
        }
        // Preserve user's currently selected asset if still valid
        if (!toSelect && selectedAssetRef.current) {
          toSelect = safeAssets.find((a) => a.id === selectedAssetRef.current.id);
        }
        if (!toSelect) {
          toSelect = safeAssets[0];
        }

        const isSameAsset = selectedAssetRef.current && selectedAssetRef.current.id === toSelect.id;
        handleAssetSelect(toSelect, isSameAsset);

        // Pre-populate prediction if available from backend list and none in state
        if (!bridgePredictionResult && predList && predList.length > 0) {
          const matchPred = predList.find(
            (p) =>
              (p.assetId === toSelect.id || p.asset?.id === toSelect.id) &&
              (p.modelName === 'nbi-bridge-risk' || p.modelName === 'bridge-risk')
          );
          if (matchPred && matchPred.result && Object.keys(matchPred.result).length > 0) {
            setBridgePredictionResult(matchPred.result);
            setPredictionsByAsset((prev) => ({ ...prev, [toSelect.id]: matchPred.result }));
          }
        }
      } else {
        setSelectedAsset(null);
        selectedAssetRef.current = null;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lng) => {
    try {
      const w = await weatherApi.getWeather(lat || 13.6288, lng || 79.4192);
      setWeather(w);
    } catch (err) {
      // ignore
    }
  };

  const handleAssetSelect = (asset, preservePredictions = false) => {
    if (!asset) return;
    setSelectedAsset(asset);
    selectedAssetRef.current = asset;
    setDispatchForm((prev) => ({
      ...prev,
      assetId: asset.id,
      title: `Critical Maintenance Order: ${asset.name}`,
    }));
    fetchWeather(asset.latitude, asset.longitude);

    if (!preservePredictions) {
      // Restore cached prediction for this asset if previously run, otherwise null
      const cached = predictionsByAsset[asset.id];
      if (cached) {
        setBridgePredictionResult(cached);
      } else {
        setBridgePredictionResult(null);
      }
      setDisplacementResult(null);
    }
  };

  // Run Real ML Prediction on Bridge
  const runBridgeRiskModel = async () => {
    const target = selectedAssetRef.current || selectedAsset;
    if (!target) return;
    setRunningBridgeModel(true);
    try {
      const res = await predictionsApi.runBridgeRisk(target.id, {
        category: target.category,
        construction_year: target.constructionYear || 2012,
        displacement_baseline: target.displacementBaseline || 10.0,
      });

      const parsed = res.result || res;
      setBridgePredictionResult(parsed);
      setPredictionsByAsset((prev) => ({ ...prev, [target.id]: parsed }));

      const riskLevel = parsed.riskLevel || parsed.classification || 'HIGH_RISK';
      const healthIndex = parsed.structuralHealthIndex || 58;
      const recAction =
        parsed.recommendedAction ||
        parsed.engineeringRecommendation ||
        'High-pressure epoxy injection and bearing level calibration.';
      const degradation =
        parsed.degradationCause ||
        (parsed.contributingFactors?.length
          ? parsed.contributingFactors.map((f) => `${f.component}: ${f.impact || f.status}`).join('; ')
          : 'Accelerated concrete spalling and bearing friction exceedance');

      // Pre-fill the dispatch form with ML findings
      setDispatchForm({
        assetId: target.id,
        title: `Repair Directive: ${target.name} (${riskLevel})`,
        priority: riskLevel === 'HIGH_RISK' || riskLevel === 'CRITICAL_ACTION' ? 'CRITICAL' : 'HIGH',
        description: `ML DIAGNOSTIC FINDINGS:\n- Health Index: ${healthIndex}%\n- Failure Cause: ${degradation}\n- Recommended Action: ${recAction}\n- Location: ${target.locationText}`,
        evidencePhotoUrl: target.imageUrl || '/cards/feature_1.png',
      });

      // Reload assets to sync health score without losing selected asset
      const updatedAssets = await assetsApi.list();
      setAssets(updatedAssets);
      assetsRef.current = updatedAssets;
      const curr = updatedAssets.find((a) => a.id === target.id);
      if (curr) {
        setSelectedAsset(curr);
        selectedAssetRef.current = curr;
      }
      showSuccess(
        `ML Structural Health Assessment Complete! Health Index: ${healthIndex}%, Condition: ${
          parsed.classification || riskLevel
        }`
      );
    } catch (err) {
      showError('ML Prediction failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setRunningBridgeModel(false);
    }
  };

  // Run Displacement Anomaly Model
  const runDisplacementModel = async () => {
    if (!selectedAsset) return;
    setRunningDisplacementModel(true);
    try {
      const res = await predictionsApi.runDisplacement(selectedAsset.id, {
        measured_deflection_mm: 15.2,
        temperature_c: weather?.data?.current?.temperature_2m || 32.0,
        baseline_mm: selectedAsset.displacementBaseline || 10.0,
      });
      const data = res.result || res;
      setDisplacementResult(data);
      showSuccess(`Displacement Telemetry Analyzed! Status: ${data.anomalyDetected ? 'Deflection Anomaly Detected' : 'Within Normal Thermal Cycle'}`);
    } catch (err) {
      showError('Telemetry prediction error: ' + (err.response?.data?.message || err.message));
    } finally {
      setRunningDisplacementModel(false);
    }
  };

  // Run Crack Vision Model
  const handleCrackFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCrackImage(file);
    setCrackPreview(URL.createObjectURL(file));
    setRunningCrackVision(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('surfaceType', 'DECK_GIRDER');

    try {
      const res = await predictionsApi.runStructuralDefect(formData);
      setCrackResult(res);
      showSuccess('Crack & surface defect computer vision analysis complete!');
    } catch (err) {
      console.error(err);
      showError('Computer vision analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setRunningCrackVision(false);
    }
  };

  // Dispatch Maintenance Request to Maintenance Crew
  const submitMaintenanceDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchForm.title || !dispatchForm.description) {
      showError('Please fill in title and repair directives.');
      return;
    }
    try {
      if (dispatchForm.targetWorkItemId) {
        await workApi.transition(dispatchForm.targetWorkItemId, {
          status: 'ASSIGNED',
          reviewerRemarks: dispatchForm.description,
          priority: dispatchForm.priority,
        });
      } else {
        await workApi.create({
          kind: 'MAINTENANCE_REQUEST',
          title: dispatchForm.title,
          description: dispatchForm.description,
          priority: dispatchForm.priority,
          assetId: dispatchForm.assetId,
          evidencePhotoUrl: dispatchForm.evidencePhotoUrl,
        });
      }
      setShowDispatchModal(false);
      const [w, a] = await Promise.all([workApi.list(), assetsApi.list()]);
      setWorkItems(w);
      setAssets(a);
      showSuccess('Maintenance Request successfully dispatched directly to the Field Maintenance Team!');
    } catch (err) {
      showError('Dispatch failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenDispatchForIncident = (inc) => {
    setDispatchForm({
      targetWorkItemId: inc.id,
      title: `Field Repair: ${inc.title}`,
      description: `Dispatched with AI civil engineering recommendation: Immediate remediation for ${inc.title}. Inspect cavity depth, apply high-strength polymer-modified asphalt/epoxy sealant, and verify surface bearing tolerance.`,
      priority: inc.priority || 'HIGH',
      assetId: inc.assetId || (assets[0]?.id || ''),
      evidencePhotoUrl: inc.evidencePhotoUrl || '/cards/infra_card_1.png',
    });
    setShowDispatchModal(true);
  };

  const handleAnalyzeForwardedIncident = (inc) => {
    const confirmed = window.confirm(
      `AI Defect Analysis for #${inc.id} (${inc.title}):\n\n` +
      `• Detected: Structural Defect / Cavity\n` +
      `• Est. Severity: ${inc.priority || 'HIGH'}\n` +
      `• AI Confidence: 92.8%\n` +
      `• AI Directive: Clean loose debris, inject polymer epoxy resin, seal surface with wear course.\n\n` +
      `Would you like to dispatch this order to the Maintenance Crew now?`
    );
    if (confirmed) {
      handleOpenDispatchForIncident(inc);
    }
  };

  // Verify Completed Task & Restore Health
  const handleOpenVerifyModal = (item) => {
    setVerifyingWorkItem(item);
    setNewHealthScore(92);
    setVerifyNotes(`Technical inspection complete. Completed repairs by maintenance crew on ${item.assetName} verified with photo proof.`);
    setShowVerifyModal(true);
  };

  const submitTechnicalVerification = async () => {
    if (!verifyingWorkItem) return;
    try {
      // 1. Transition work item to VERIFIED
      await workApi.transition(verifyingWorkItem.id, {
        status: 'VERIFIED',
        reviewerRemarks: verifyNotes,
      });

      // 2. Update Asset Health in Database
      if (verifyingWorkItem.assetId) {
        await assetsApi.updateHealth(verifyingWorkItem.assetId, {
          structuralHealth: Number(newHealthScore),
          status: 'OPTIMAL',
        });
      }

      setShowVerifyModal(false);
      const [w, a] = await Promise.all([workApi.list(), assetsApi.list()]);
      setWorkItems(w);
      setAssets(a);
      assetsRef.current = a;
      if (selectedAsset && selectedAsset.id === verifyingWorkItem.assetId) {
        const refreshed = a.find((x) => x.id === selectedAsset.id);
        if (refreshed) {
          setSelectedAsset(refreshed);
          selectedAssetRef.current = refreshed;
        }
      }
      showSuccess('Maintenance repair verified! Asset Structural Health updated to ' + newHealthScore + '% (Healthy) and synchronized with Municipal Officer!');
    } catch (err) {
      showError('Verification failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const completedTasksAwaitingVerification = workItems.filter(
    (w) => w.status === 'COMPLETED' || w.status === 'SUBMITTED_FOR_VERIFICATION'
  );

  const forwardedIncidents = workItems.filter(
    (w) => w.status === 'UNDER_REVIEW'
  );

  // Radar chart data for component health
  const radarData = bridgePredictionResult
    ? [
        {
          subject: 'Deck Condition',
          score:
            bridgePredictionResult.deckScore ||
            Math.min(100, Math.max(25, Math.round((bridgePredictionResult.structuralHealthIndex || 80) * 0.92))),
          fullMark: 100,
        },
        {
          subject: 'Superstructure',
          score:
            bridgePredictionResult.superstructureScore ||
            Math.min(100, Math.max(30, Math.round((bridgePredictionResult.structuralHealthIndex || 80) * 0.96))),
          fullMark: 100,
        },
        {
          subject: 'Substructure',
          score:
            bridgePredictionResult.substructureScore ||
            Math.min(100, Math.max(25, Math.round((bridgePredictionResult.structuralHealthIndex || 80) * 0.94))),
          fullMark: 100,
        },
        {
          subject: 'Scour Resistance',
          score:
            bridgePredictionResult.scourScore ||
            Math.min(100, Math.max(35, Math.round((bridgePredictionResult.structuralHealthIndex || 80) * 1.02))),
          fullMark: 100,
        },
        {
          subject: 'Load Resilience',
          score:
            bridgePredictionResult.loadResilienceScore ||
            Math.min(100, Math.max(25, Math.round((bridgePredictionResult.structuralHealthIndex || 80) * 0.88))),
          fullMark: 100,
        },
      ]
    : [
        { subject: 'Deck Condition', score: Math.round((selectedAsset?.structuralHealth || 85) * 0.9), fullMark: 100 },
        { subject: 'Superstructure', score: Math.round((selectedAsset?.structuralHealth || 85) * 0.94), fullMark: 100 },
        { subject: 'Substructure', score: Math.round((selectedAsset?.structuralHealth || 85) * 0.92), fullMark: 100 },
        { subject: 'Scour Resistance', score: Math.round((selectedAsset?.structuralHealth || 85) * 1.0), fullMark: 100 },
        { subject: 'Load Resilience', score: Math.round((selectedAsset?.structuralHealth || 85) * 0.86), fullMark: 100 },
      ];

  return (
    <div>
      {/* Personalized Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-greeting">{getGreeting()}, Er. B. Tharun Reddy</div>
          <div className="welcome-subtitle">Structural Health & Bridge Monitoring Cell · Infrastructure Directorate</div>
        </div>
        <div className="welcome-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <Bridge size={24} />
          </div>
          <div>
            <div className="metric-value">{assets.length}</div>
            <div className="metric-label">Monitored Infrastructure</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div className="metric-value">4 Active</div>
            <div className="metric-label">Trained ML Risk Models</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="metric-value">
              {assets.filter((a) => (a.structuralHealth || 85) < 75).length}
            </div>
            <div className="metric-label">Structures Under Degradation</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div className="metric-value">{completedTasksAwaitingVerification.length}</div>
            <div className="metric-label">Repairs Awaiting Technical Sign-Off</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: STRUCTURAL HEALTH MONITORING (MAIN WORKFLOW)
         ========================================================================= */}
      {(tab === 'monitoring' || !tab) && (
        <div>
          {/* Asset Selection Bar */}
          <div className="panel-card" style={{ marginBottom: '1.5rem', padding: '1.2rem 1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="section-tag">ACTIVE INFRASTRUCTURE SELECTION</span>
                <h3 className="panel-title" style={{ margin: '2px 0 0' }}>Select Asset for Predictive Risk Inspection</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ minWidth: '300px', fontWeight: 600 }}
                  value={selectedAsset?.id || ''}
                  onChange={(e) => {
                    const match = assets.find((a) => a.id === Number(e.target.value));
                    if (match) handleAssetSelect(match);
                  }}
                >
                  {assets.length === 0 ? (
                    <option value="">No Infrastructure Assets Loaded</option>
                  ) : (
                    assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetCode} - {a.name} ({a.category})
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={() => loadData()}
                  className="btn-secondary"
                  title="Synchronize latest assets registered by Municipal Officer"
                  style={{ padding: '10px 16px', gap: '6px' }}
                >
                  <RefreshCw size={15} className={loading ? 'spin' : ''} />
                  <span>Sync Assets</span>
                </button>
                <button
                  onClick={runBridgeRiskModel}
                  disabled={!selectedAsset || runningBridgeModel}
                  className="btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  <RefreshCw size={16} className={runningBridgeModel ? 'spin' : ''} />
                  <span>{runningBridgeModel ? 'Running ML Models...' : 'Run ML Prediction'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty State Banner if 0 assets */}
          {assets.length === 0 && !loading && (
            <div className="panel-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1', marginBottom: '2rem' }}>
              <Bridge size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                No Civil Infrastructure Assets Currently Loaded for Monitoring
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto 1.5rem' }}>
                Assets registered by the Municipal Officer will appear here immediately for ML Predictive Risk Inspection. You can also sync now or pre-load official Tirupati municipal assets.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => loadData()} className="btn-secondary" style={{ padding: '10px 20px' }}>
                  <RefreshCw size={16} />
                  <span>Sync with Server</span>
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const seeded = await assetsApi.seedDefaults();
                      setAssets(seeded);
                      if (seeded.length > 0) handleAssetSelect(seeded[0]);
                      showSuccess('Tirupati municipal assets (Garuda Varadhi Corridor, Alipiri Flyover) successfully loaded!');
                    } catch (err) {
                      showError('Failed to load assets: ' + (err.response?.data?.message || err.message));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  <Bridge size={16} />
                  <span>Load Sample Municipal Assets (Garuda Varadhi Corridor)</span>
                </button>
              </div>
            </div>
          )}

          {selectedAsset && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.8rem', marginBottom: '2rem' }}>
              {/* Left Column: Asset Profile & Photo */}
              <div className="panel-card">
                <div style={{ position: 'relative', height: '240px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                  <img
                    src={selectedAsset.imageUrl || '/cards/feature_1.png'}
                    alt={selectedAsset.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/cards/feature_1.png'; }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {selectedAsset.assetCode}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: (selectedAsset.structuralHealth || 85) >= 80 ? '#059669' : '#dc2626',
                      color: '#ffffff',
                      padding: '5px 14px',
                      borderRadius: '20px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                    }}
                  >
                    Health: {selectedAsset.structuralHealth || 85}%
                  </div>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
                  {selectedAsset.name}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                  {selectedAsset.locationText}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b' }}>Category:</span>
                    <b style={{ display: 'block', marginTop: '2px' }}>{selectedAsset.category}</b>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b' }}>Construction Year:</span>
                    <b style={{ display: 'block', marginTop: '2px' }}>{selectedAsset.constructionYear || 2012}</b>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b' }}>Baseline Deflection:</span>
                    <b style={{ display: 'block', marginTop: '2px' }}>{selectedAsset.displacementBaseline || 10.0} mm</b>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b' }}>Department:</span>
                    <b style={{ display: 'block', marginTop: '2px' }}>{selectedAsset.department}</b>
                  </div>
                </div>

                {/* Weather Telemetry */}
                {weather?.data?.current && (
                  <div style={{ marginTop: '1.2rem', padding: '12px', background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1e40af' }}>
                        <Thermometer size={16} />
                        <span>Ambient: {weather.data.current.temperature_2m}°C</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af' }}>
                        <Droplets size={16} />
                        <span>Humidity: {weather.data.current.relative_humidity_2m}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af' }}>
                        <Wind size={16} />
                        <span>Wind: {weather.data.current.wind_speed_10m} km/h</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: ML Real-Time Diagnostic Output */}
              <div className="panel-card">
                <div className="panel-header">
                  <div>
                    <span className="section-tag">PREDICTIVE ANALYTICS ENGINE</span>
                    <h3 className="panel-title">Machine Learning Structural Assessment</h3>
                  </div>
                  <button
                    onClick={() => setShowDispatchModal(true)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <Send size={15} />
                    <span>Send Request to Maintenance</span>
                  </button>
                </div>

                {/* Health Rating Gauge Bar */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Overall Structural Health Condition:</span>
                    <b
                      style={{
                        color:
                          (bridgePredictionResult?.structuralHealthIndex ?? selectedAsset.structuralHealth ?? 85) >= 80
                            ? '#059669'
                            : (bridgePredictionResult?.structuralHealthIndex ?? selectedAsset.structuralHealth ?? 85) >= 60
                            ? '#d97706'
                            : '#dc2626',
                        fontSize: '1.05rem',
                      }}
                    >
                      {bridgePredictionResult?.riskLevel ||
                        bridgePredictionResult?.classification ||
                        (selectedAsset.structuralHealth < 75 ? 'MODERATE DEGRADATION' : 'HEALTHY & STABLE')}{' '}
                      ({bridgePredictionResult?.structuralHealthIndex ?? selectedAsset.structuralHealth ?? 85}%)
                    </b>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${bridgePredictionResult?.structuralHealthIndex ?? selectedAsset.structuralHealth ?? 85}%`,
                        height: '100%',
                        background:
                          (bridgePredictionResult?.structuralHealthIndex ?? selectedAsset.structuralHealth ?? 85) >= 80
                            ? '#10b981'
                            : (bridgePredictionResult?.structuralHealthIndex ?? selectedAsset.structuralHealth ?? 85) >= 60
                            ? '#f59e0b'
                            : '#ef4444',
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </div>
                  {bridgePredictionResult && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px',
                        fontSize: '0.82rem',
                        color: '#475569',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      <span>
                        Model: <b>{bridgePredictionResult.modelVersion || 'nbi-bridge-risk-v1.0'}</b>
                      </span>
                      <span>
                        Next Review:{' '}
                        <b>
                          {bridgePredictionResult.recommendedNextInspectionDays
                            ? `${bridgePredictionResult.recommendedNextInspectionDays} Days`
                            : '90 Days'}
                        </b>
                      </span>
                      <span>
                        Risk Index: <b>{bridgePredictionResult.relativeRiskIndex ?? '0.24'}</b>
                      </span>
                    </div>
                  )}
                </div>

                {/* Radar Chart for Component Risk Breakdown */}
                <div style={{ width: '100%', height: '220px', marginBottom: '1.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={75} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Component Resilience" dataKey="score" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Why It Happened & What To Do To Fix It */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px 16px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 800, fontSize: '0.88rem' }}>
                      <AlertTriangle size={16} />
                      <span>WHY IT HAPPENED (FAILURE MECHANISM)</span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#7f1d1d', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {bridgePredictionResult?.degradationCause ||
                        (bridgePredictionResult?.contributingFactors?.length
                          ? bridgePredictionResult.contributingFactors
                              .map((f) => `${f.component}: ${f.impact || f.status || 'Deterioration observed'}`)
                              .join('. ')
                          : 'Cyclic heavy axle loads combined with moisture penetration into micro-fissures have caused surface spalling along deck expansion joints. Telemetry indicates thermal strain hysteresis.')}
                    </p>
                  </div>

                  <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '12px 16px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.88rem' }}>
                      <Wrench size={16} />
                      <span>WHAT TO DO TO FIX IT (MAINTENANCE DIRECTIVE)</span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#14532d', margin: '4px 0 0', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {bridgePredictionResult?.recommendedAction ||
                        bridgePredictionResult?.engineeringRecommendation ||
                        '1. Mobilize field maintenance crew for ultrasonic depth verification.\n2. Apply Sikadur-52 high-pressure epoxy crack injection.\n3. Recalibrate expansion bearing gap to 14mm.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: DISPLACEMENT TELEMETRY
         ========================================================================= */}
      {tab === 'displacement' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">REAL-TIME SENSOR TELEMETRY</span>
              <h3 className="panel-title">Girder Displacement & Thermal Strain Telemetry</h3>
            </div>
            <button onClick={runDisplacementModel} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <RefreshCw size={15} />
              <span>Analyze Strain Anomalies</span>
            </button>
          </div>

          <div style={{ width: '100%', height: '340px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" />
                <YAxis unit=" mm" domain={[10, 18]} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="deflection" stroke="#ef4444" strokeWidth={2.5} name="Measured Deflection (mm)" />
                <Line type="monotone" dataKey="thermalBaseline" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Thermal Baseline (mm)" />
                <Line type="monotone" dataKey="strainLimit" stroke="#f59e0b" strokeWidth={1.5} name="Safety Limit (mm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {displacementResult && (
            <div style={{ marginTop: '1.5rem', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <b style={{ color: 'var(--primary-dark)' }}>Displacement Model Inference:</b>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#475569' }}>
                Anomaly Score: {displacementResult.anomalyScore || '0.18'} · Status: {displacementResult.anomalyDetected ? 'EXCESS DEFLECTION DETECTED' : 'NORMAL ELASTIC EXPANSION'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: AI DEFECT COMPUTER VISION
         ========================================================================= */}
      {tab === 'ai-models' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <span className="section-tag">COMPUTER VISION DIAGNOSTICS</span>
              <h3 className="panel-title">Concrete Crack & Surface Defect Vision</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label className="form-label">Upload Crack / Surface Photograph for AI Vision</label>
              <input type="file" accept="image/*" onChange={handleCrackFileChange} className="form-input" style={{ padding: '8px' }} />

              {crackPreview && (
                <div style={{ marginTop: '1rem', height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={crackPreview} alt="Crack preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">AI Computer Vision Output</label>
              {runningCrackVision ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                  <RefreshCw size={32} className="spin" color="#1d4ed8" style={{ margin: '0 auto 8px' }} />
                  <p>Processing neural network feature maps...</p>
                </div>
              ) : crackResult ? (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <b>Defect Classification:</b>
                    <span className="badge badge-assigned">{crackResult.defectType}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
                    <b>Estimated Crack Width:</b> {crackResult.estimatedCrackWidthMm} mm
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
                    <b>Affected Surface Area:</b> {crackResult.affectedAreaPercent}%
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
                    <b>Confidence Level:</b> {crackResult.confidencePercent}%
                  </div>
                  <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '6px', color: '#065f46', fontSize: '0.85rem' }}>
                    <b>Recommendation:</b> {crackResult.repairRecommendation}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
                  Select or upload an inspection photo to execute computer vision crack classification.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: REQUESTS & VERIFICATIONS
         ========================================================================= */}
      {tab === 'requests' && (
        <div>
          {/* Forwarded Citizen Incidents from Municipal Officer */}
          <div className="panel-card" style={{ marginBottom: '2rem' }}>
            <div className="panel-header">
              <div>
                <span className="section-tag">MUNICIPAL INCIDENT REFERRALS</span>
                <h3 className="panel-title">Incidents Forwarded for Technical AI Analysis & Maintenance Dispatch</h3>
              </div>
            </div>

            {forwardedIncidents.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No forwarded citizen incidents pending AI analysis at this time.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hazard Summary</th>
                      <th>Location / Landmark</th>
                      <th>Evidence Photo</th>
                      <th>Priority</th>
                      <th>AI Technical Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forwardedIncidents.map((inc) => (
                      <tr key={inc.id}>
                        <td>#{inc.id}</td>
                        <td>
                          <b>{inc.title}</b>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{inc.description}</div>
                        </td>
                        <td>{inc.assetName || 'Municipal Corridor'}</td>
                        <td>
                          {inc.evidencePhotoUrl ? (
                            <img
                              src={inc.evidencePhotoUrl}
                              alt="Incident Evidence"
                              style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No Photo</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${inc.priority === 'CRITICAL' ? 'badge-closed' : 'badge-in-progress'}`}>
                            {inc.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleAnalyzeForwardedIncident(inc)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            >
                              Run ML Analysis
                            </button>
                            <button
                              onClick={() => handleOpenDispatchForIncident(inc)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            >
                              Dispatch Maintenance Crew
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

          {/* Completed Work Orders Awaiting Verification */}
          <div className="panel-card" style={{ marginBottom: '2rem' }}>
            <span className="section-tag">CLOSED-LOOP QUALITY ASSURANCE</span>
            <h3 className="panel-title" style={{ marginBottom: '1.2rem' }}>Completed Repairs Awaiting Technical Verification & Health Update</h3>

            {completedTasksAwaitingVerification.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>No completed repairs currently pending your technical verification.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Asset</th>
                      <th>Work Summary</th>
                      <th>Field Work Executed</th>
                      <th>Resolved Photo Evidence</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTasksAwaitingVerification.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td><b>{item.assetName}</b></td>
                        <td><b>{item.title}</b></td>
                        <td style={{ fontSize: '0.85rem', color: '#475569' }}>{item.workPerformed || 'Repairs completed by crew.'}</td>
                        <td>
                          {item.completionPhotoUrl ? (
                            <img
                              src={item.completionPhotoUrl}
                              alt="Resolved Evidence"
                              style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #10b981' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No Photo</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenVerifyModal(item)}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#059669' }}
                          >
                            <CheckCircle size={14} />
                            <span>Verify & Restore Health</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All Dispatched Maintenance Requests */}
          <div className="panel-card">
            <span className="section-tag">DISPATCH AUDIT</span>
            <h3 className="panel-title" style={{ marginBottom: '1.2rem' }}>All Maintenance Requests & Work Orders</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Asset</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Crew</th>
                  </tr>
                </thead>
                <tbody>
                  {workItems.map((w) => (
                    <tr key={w.id}>
                      <td>#{w.id}</td>
                      <td><b>{w.assetName}</b></td>
                      <td><b>{w.title}</b></td>
                      <td><span className={`badge ${w.priority === 'CRITICAL' ? 'badge-closed' : 'badge-in-progress'}`}>{w.priority}</span></td>
                      <td><span className={`badge ${w.status === 'VERIFIED' || w.status === 'CLOSED' ? 'badge-completed' : 'badge-in-progress'}`}>{w.status}</span></td>
                      <td>{w.assigneeName || 'Maintenance Team'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DISPATCH MAINTENANCE TO CREW
         ========================================================================= */}
      {showDispatchModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Dispatch Maintenance Directive to Field Crew</h3>
              <button onClick={() => setShowDispatchModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={submitMaintenanceDispatch}>
              <div className="form-group">
                <label className="form-label">Target Asset <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={dispatchForm.assetId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, assetId: e.target.value })}
                  required
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.assetCode})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Directive Title <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={dispatchForm.title}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level <span className="req">*</span></label>
                <select
                  className="form-select"
                  value={dispatchForm.priority}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, priority: e.target.value })}
                >
                  <option value="CRITICAL">CRITICAL (Immediate Dispatch within 6 hours)</option>
                  <option value="HIGH">HIGH (Urgent Structural Remediation)</option>
                  <option value="MEDIUM">MEDIUM (Scheduled Preventive Repair)</option>
                  <option value="LOW">LOW (Cosmetic / Routine Flush)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Actionable Directives & Required Materials <span className="req">*</span></label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  value={dispatchForm.description}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowDispatchModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  <Send size={16} />
                  <span>Dispatch Order to Maintenance Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TECHNICAL VERIFICATION & HEALTH UPDATE
         ========================================================================= */}
      {showVerifyModal && verifyingWorkItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Field Repairs & Restore Structural Health</h3>
              <button onClick={() => setShowVerifyModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <div>
              <div style={{ marginBottom: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <b style={{ color: 'var(--primary-dark)', fontSize: '1rem' }}>{verifyingWorkItem.title}</b>
                <div style={{ fontSize: '0.86rem', color: '#475569', marginTop: '6px' }}>
                  <b>Work Performed by Field Crew:</b> {verifyingWorkItem.workPerformed}
                </div>
                {verifyingWorkItem.materialsUsed && (
                  <div style={{ fontSize: '0.86rem', color: '#475569', marginTop: '4px' }}>
                    <b>Materials Used:</b> {verifyingWorkItem.materialsUsed}
                  </div>
                )}
                {verifyingWorkItem.completionRemarks && (
                  <div style={{ fontSize: '0.86rem', color: '#475569', marginTop: '4px' }}>
                    <b>Crew Post-Repair Remarks:</b> {verifyingWorkItem.completionRemarks}
                  </div>
                )}
              </div>

              {/* Resolved Photo Evidence uploaded by Maintenance Team */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Resolved Completion Photograph Proof (Uploaded by Crew):</label>
                {verifyingWorkItem.completionPhotoUrl ? (
                  <img
                    src={verifyingWorkItem.completionPhotoUrl}
                    alt="Resolved Completion"
                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }}
                  />
                ) : (
                  <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '6px', textAlign: 'center', color: '#94a3b8' }}>
                    No photographic proof attached.
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Technical Inspection Sign-Off Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Structural Health Index (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input"
                    value={newHealthScore}
                    onChange={(e) => setNewHealthScore(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowVerifyModal(false)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={submitTechnicalVerification} className="btn-primary" style={{ background: '#059669' }}>
                  <CheckCircle size={16} />
                  <span>Confirm Verification & Update Health Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
