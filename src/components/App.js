import DnsmasqApi from 'dnsmasq-api';
import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  const [configContent, setConfigContent] = useState('');
  const [leasesContent, setLeasesContent] = useState('Loading leases...');
  const [notification, setNotification] = useState(null);

  // Load configuration
  const loadConfig = useCallback(async () => {
    try {
      const content = await DnsmasqApi.readConfig();
      setConfigContent(content);
    } catch (error) {
      setConfigContent("Error reading configuration: " + error);
    }
  }, []);

  // Load DNS leases
  const loadLeases = useCallback(async () => {
    try {
      const content = await DnsmasqApi.readLeases()
      setLeasesContent(content);
    } catch (error) {
      setLeasesContent("Error reading leases: " + error);
    }
  }, []);

  const handleReloadConfig = async () => {
    try {
      await DnsmasqApi.reloadService()
      showNotification("Configuration reloaded successfully");
    } catch (error) {
      console.error("Failed to reload configuration:", error);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSaveConfig = async () => {
    try {
      await DnsmasqApi.saveConfig(configContent);
      showNotification("Configuration saved successfully");
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };  

  // Initialize
  useEffect(() => {
    loadConfig();
    loadLeases();
  }, [loadConfig, loadLeases]);

  return (
    <div className="container-fluid">
      {notification && (
        <div 
          className="alert alert-success alert-dismissible"
          style={{ position: "fixed", top: "20px", right: "20px", zIndex: "1000" }}
        >
          <button 
            type="button" 
            className="close" 
            onClick={() => setNotification(null)}
          >
            &times;
          </button>
          {notification}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-12">
          <h2>Dnsmasq</h2>
          
          {/* DNS Leases */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">DNS Leases</h3>
            </div>
            <div className="panel-body">
              <div id="leases-container">
                <pre className="textblock">{leasesContent}</pre>
              </div>
              <button onClick={loadLeases} className="btn btn-default">Refresh Leases</button>
            </div>
          </div>

          {/* Configuration */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Configuration</h3>
            </div>
            <div className="panel-body">
              <div style={{ height: "300px", display: "flex", flexDirection: "column" }}>
                <textarea 
                  value={configContent} 
                  onChange={(e) => setConfigContent(e.target.value)}
                  className="textblock" 
                  style={{ flex: 1 }}
                />
              </div>
              <button onClick={handleSaveConfig} className="btn btn-primary">Save Configuration</button>
              <button onClick={handleReloadConfig} className="btn btn-info">Reload Configuration</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;