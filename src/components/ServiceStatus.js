import DnsmasqApi from 'dnsmasq-api';
import React, { useState, useEffect, useCallback } from 'react';

const ServiceStatus = () => {
  const [serviceStatus, setServiceStatus] = useState('Checking...');
  const [notification, setNotification] = useState(null);

  // Update buttons based on status
  const showButtons = useCallback(() => {
    if (serviceStatus === "active") {
      return { start: false, stop: true, restart: true, reload: true };
    } else if (serviceStatus === "Inactive/Error") {
      return { start: true, stop: false, restart: false, reload: false };
    }
    return { start: false, stop: false, restart: false, reload: false };
  }, [serviceStatus]);

  const checkStatus = useCallback(async () => {
    try {
      const data = await DnsmasqApi.checkStatus();
      setServiceStatus(data.trim());
    } catch (error) {
      setServiceStatus("Inactive/Error");
    }
  }, []);

  // Button event handlers
  const handleStart = async () => {
    try {
      await DnsmasqApi.startService();
      await checkStatus();
    } catch (error) {
      console.error("Failed to start dnsmasq:", error);
    }
  };

  const handleStop = async () => {
    try {
      await DnsmasqApi.stopService();
      await checkStatus();
    } catch (error) {
      console.error("Failed to stop dnsmasq:", error);
    }    
  };

  const handleRestart = async () => {
    try {
      await DnsmasqApi.restartService();
      await checkStatus();
    } catch (error) {
      console.error("Failed to restart dnsmasq:", error);
    }    
  };

  const handleReload = async () => {
    try {
      await DnsmasqApi.reloadService();
      await checkStatus();
    } catch (error) {
      console.error("Failed to reload dnsmasq:", error);
    }    
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Initialize
  useEffect(() => {
    checkStatus();
    // Refresh status every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus, loadConfig, loadLeases, loadLogs]);

  const buttons = showButtons();

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">Service Status</h3>
      </div>
      <div className="panel-body">
        <div id="status-container">
          <p>Status: <span className={serviceStatus === "active" ? "text-success" : "text-danger"}>
            {serviceStatus}
          </span></p>
          {buttons.start && (
            <button onClick={handleStart} className="btn btn-success">Start</button>
          )}
          {buttons.stop && (
            <button onClick={handleStop} className="btn btn-danger">Stop</button>
          )}
          {buttons.restart && (
            <button onClick={handleRestart} className="btn btn-warning">Restart</button>
          )}
          {buttons.reload && (
            <button onClick={handleReload} className="btn btn-info">Reload</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceStatus;