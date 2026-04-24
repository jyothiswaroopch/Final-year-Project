import React, { useState } from 'react';
import { ArrowLeft, Monitor, Bell, Shield, Database, Save, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    // Display & Chart
    chartType: 'Candlestick',
    defaultTimeframe: '5m',
    showGridLines: true,
    showCrosshair: true,
    theme: 'Dark',

    // Alerts & Notifications
    priceAlerts: true,
    volumeSpikes: true,
    technicalSignals: true,
    notificationMethod: 'In-app',
    alertSound: true,

    // Risk Management
    defaultStopLoss: 2.0,
    defaultTakeProfit: 5.0,
    positionSizeLimit: 10.0,
    maxDrawdownTolerance: 15.0,

    // Data & Refresh
    realtimeRefreshRate: '1s',
    quoteUpdateFrequency: '5s',
    autoRefreshWatchlist: true,
    refreshInterval: '1m',
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartTypeOptions = ['Candlestick', 'Line', 'Area'];
  const timeframeOptions = ['1m', '5m', '15m', '1h', '1D'];
  const refreshRateOptions = ['1s', '5s', '10s'];
  const updateFrequencyOptions = ['1s', '5s', '10s'];
  const refreshIntervalOptions = ['1m', '5m', '10m'];
  const notificationMethods = ['In-app', 'Email', 'SMS'];
  const themeOptions = ['Dark', 'Light'];

  return (
    <div className="settings-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="settings-header"
      >
        <div className="settings-header-content">
          <button onClick={() => navigate('/dashboard/trader')} className="back-btn">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="settings-title-section">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Customize your trading dashboard experience</p>
          </div>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="settings-container">
        <div className="settings-grid">
          {/* 1. Display & Chart Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="settings-card"
          >
            <div className="card-header">
              <Monitor size={24} />
              <div>
                <h2 className="card-title">1. Display & Chart Preferences</h2>
                <p className="card-description">Customize how charts and data are displayed.</p>
              </div>
            </div>

            <div className="card-content">
              {/* Chart Type */}
              <div className="setting-item">
                <label className="setting-label">Chart Type</label>
                <div className="button-group">
                  {chartTypeOptions.map((option) => (
                    <button
                      key={option}
                      className={`button-option ${settings.chartType === option ? 'active' : ''}`}
                      onClick={() => handleChange('chartType', option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Timeframe */}
              <div className="setting-item">
                <label htmlFor="timeframe" className="setting-label">
                  Default Timeframe
                </label>
                <select
                  id="timeframe"
                  value={settings.defaultTimeframe}
                  onChange={(e) => handleChange('defaultTimeframe', e.target.value)}
                  className="select-input"
                >
                  {timeframeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="toggle-row">
                <div className="toggle-item">
                  <label>Show Grid Lines</label>
                  <button
                    className={`toggle-switch ${settings.showGridLines ? 'active' : ''}`}
                    onClick={() => handleToggle('showGridLines')}
                  >
                    <span className="toggle-circle" />
                  </button>
                </div>
                <div className="toggle-item">
                  <label>Show Crosshair</label>
                  <button
                    className={`toggle-switch ${settings.showCrosshair ? 'active' : ''}`}
                    onClick={() => handleToggle('showCrosshair')}
                  >
                    <span className="toggle-circle" />
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="setting-item">
                <label className="setting-label">Theme</label>
                <div className="button-group">
                  {themeOptions.map((option) => (
                    <button
                      key={option}
                      className={`button-option ${settings.theme === option ? 'active' : ''}`}
                      onClick={() => handleChange('theme', option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Alerts & Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="settings-card"
          >
            <div className="card-header">
              <Bell size={24} />
              <div>
                <h2 className="card-title">2. Alerts & Notifications</h2>
                <p className="card-description">Manage your alerts and notification preferences.</p>
              </div>
            </div>

            <div className="card-content">
              {/* Alert Toggles */}
              <div className="toggle-stack">
                <div className="toggle-item">
                  <label>Price Alerts</label>
                  <button
                    className={`toggle-switch ${settings.priceAlerts ? 'active' : ''}`}
                    onClick={() => handleToggle('priceAlerts')}
                  >
                    <span className="toggle-circle" />
                  </button>
                </div>

                <div className="toggle-item">
                  <label>Volume Spike Alerts</label>
                  <button
                    className={`toggle-switch ${settings.volumeSpikes ? 'active' : ''}`}
                    onClick={() => handleToggle('volumeSpikes')}
                  >
                    <span className="toggle-circle" />
                  </button>
                </div>

                <div className="toggle-item">
                  <label>Technical Signal Alerts (RSI, MACD)</label>
                  <button
                    className={`toggle-switch ${settings.technicalSignals ? 'active' : ''}`}
                    onClick={() => handleToggle('technicalSignals')}
                  >
                    <span className="toggle-circle" />
                  </button>
                </div>
              </div>

              {/* Notification Method */}
              <div className="setting-item">
                <label htmlFor="notificationMethod" className="setting-label">
                  Notification Method
                </label>
                <select
                  id="notificationMethod"
                  value={settings.notificationMethod}
                  onChange={(e) => handleChange('notificationMethod', e.target.value)}
                  className="select-input"
                >
                  {notificationMethods.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alert Sound */}
              <div className="toggle-item">
                <label>Alert Sound</label>
                <button
                  className={`toggle-switch ${settings.alertSound ? 'active' : ''}`}
                  onClick={() => handleToggle('alertSound')}
                >
                  <span className="toggle-circle" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 3. Risk Management Defaults */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="settings-card"
          >
            <div className="card-header">
              <Shield size={24} />
              <div>
                <h2 className="card-title">3. Risk Management Defaults</h2>
                <p className="card-description">Set your default risk parameters.</p>
              </div>
            </div>

            <div className="card-content">
              <div className="number-input-group">
                <div className="number-input-item">
                  <label htmlFor="stopLoss" className="setting-label">
                    Default Stop Loss (%)
                  </label>
                  <div className="number-input-wrapper">
                    <input
                      id="stopLoss"
                      type="number"
                      value={settings.defaultStopLoss}
                      onChange={(e) => handleChange('defaultStopLoss', parseFloat(e.target.value))}
                      className="number-input"
                      step="0.1"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>

                <div className="number-input-item">
                  <label htmlFor="takeProfit" className="setting-label">
                    Default Take Profit (%)
                  </label>
                  <div className="number-input-wrapper">
                    <input
                      id="takeProfit"
                      type="number"
                      value={settings.defaultTakeProfit}
                      onChange={(e) => handleChange('defaultTakeProfit', parseFloat(e.target.value))}
                      className="number-input"
                      step="0.1"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>

                <div className="number-input-item">
                  <label htmlFor="positionSize" className="setting-label">
                    Position Size Limit (%)
                  </label>
                  <div className="number-input-wrapper">
                    <input
                      id="positionSize"
                      type="number"
                      value={settings.positionSizeLimit}
                      onChange={(e) => handleChange('positionSizeLimit', parseFloat(e.target.value))}
                      className="number-input"
                      step="0.1"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>

                <div className="number-input-item">
                  <label htmlFor="maxDrawdown" className="setting-label">
                    Max Drawdown Tolerance (%)
                  </label>
                  <div className="number-input-wrapper">
                    <input
                      id="maxDrawdown"
                      type="number"
                      value={settings.maxDrawdownTolerance}
                      onChange={(e) => handleChange('maxDrawdownTolerance', parseFloat(e.target.value))}
                      className="number-input"
                      step="0.1"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Data & Refresh Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="settings-card"
          >
            <div className="card-header">
              <Database size={24} />
              <div>
                <h2 className="card-title">4. Data & Refresh Settings</h2>
                <p className="card-description">Control how often data is updated.</p>
              </div>
            </div>

            <div className="card-content">
              {/* Dropdowns */}
              <div className="select-group">
                <div className="select-item">
                  <label htmlFor="realtimeRefresh" className="setting-label">
                    Real-time Data Refresh Rate
                  </label>
                  <select
                    id="realtimeRefresh"
                    value={settings.realtimeRefreshRate}
                    onChange={(e) => handleChange('realtimeRefreshRate', e.target.value)}
                    className="select-input"
                  >
                    {refreshRateOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="select-item">
                  <label htmlFor="quoteUpdate" className="setting-label">
                    Quote Update Frequency
                  </label>
                  <select
                    id="quoteUpdate"
                    value={settings.quoteUpdateFrequency}
                    onChange={(e) => handleChange('quoteUpdateFrequency', e.target.value)}
                    className="select-input"
                  >
                    {updateFrequencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle */}
              <div className="toggle-item">
                <label>Auto-refresh Watchlist</label>
                <button
                  className={`toggle-switch ${settings.autoRefreshWatchlist ? 'active' : ''}`}
                  onClick={() => handleToggle('autoRefreshWatchlist')}
                >
                  <span className="toggle-circle" />
                </button>
              </div>

              {/* Refresh Interval */}
              <div className="select-item">
                <label htmlFor="refreshInterval" className="setting-label">
                  Refresh Interval
                </label>
                <select
                  id="refreshInterval"
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', e.target.value)}
                  className="select-input"
                >
                  {refreshIntervalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tip Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="tip-section"
        >
          <Info size={20} />
          <div>
            <p className="tip-text">
              Your settings are saved automatically and applied across the dashboard.
            </p>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="save-btn"
        >
          <Save size={18} />
          {saved ? 'Saved!' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
};

export default SettingsPage;

