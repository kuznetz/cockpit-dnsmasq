import DnsmasqApi from 'dnsmasq-api';
import ServiceStatus from './ServiceStatus.js';
import DhcpTable from './DhcpTable.js';
import ConfigEditor from './ConfigEditor.js';
import HostsTable from './HostsTable.js';
import DnsmasqConfigParser from '../config-parser-single.js'
import React, { useState, useEffect, useCallback } from 'react';
import {
  Panel, PanelMain, PanelMainBody, PanelHeader,
  Card, CardTitle, CardBody, Title, Button
} from '@patternfly/react-core';

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [configText, setConfigContent] = useState(null);
  const [parsedConf, setParsedConf] = useState(null);
  const [leases, setLeases] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadConfig = useCallback(async () => {
    try {
      const content = await DnsmasqApi.readConfig()
      const hosts = DnsmasqConfigParser.parse(content)
      setParsedConf(hosts)
      setConfigContent(content)
      console.log('loadConfig',hosts,content)
    } catch (error) {
      setConfigContent("Error reading configuration: " + error)
    }
  }, []);

  // Load DNS leases
  const loadLeases = useCallback(async () => {
    try {
      const content = await DnsmasqApi.readLeases()
      setLeases(content);
      console.log('loadLeases',content)
    } catch (error) {
      setLeases("Error reading leases: " + error);
    }
  }, []);

  useEffect(async () => {
      setLoaded(false);
      try {
        // Load both config and leases in parallel
        await Promise.all([
          loadConfig(),
          loadLeases()
        ]);
        setLoaded(true);
      } catch (error) {
        console.error("Failed to initialize application: " + error.message);
      }
  }, [loadConfig, loadLeases]);

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

  const handleNewHosts = useCallback( async (newHosts) => {
    console.log('newHosts', newHosts)
  });

  const handleSaveConfig = async () => {
    try {
      await DnsmasqApi.saveConfig(configText);
      showNotification("Configuration saved successfully");
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };  

  return (
    <Panel>
      <PanelHeader>
          <Title headingLevel="h1">Dnsmasq</Title>
      </PanelHeader>
      <PanelMain><PanelMainBody>

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
        
        { loaded? (
        <div>         
          {/* DNS Leases */}
          <div className="panel panel-default" style={{ marginBottom: "20px" }}>
            <div className="panel-heading">
              <Title headingLevel="h3">DHCP Leases</Title>
            </div>
            <div className="panel-body">
              { /*typeof leasesContent*/ null }
              { leases ? <DhcpTable data={leases} /> : null }
              <div style={{ textAlign: "center", padding:"10px" }}>
                <Button onClick={loadLeases} variant="secondary" size="md">Refresh Leases</Button>
              </div>
            </div>
          </div>

          <div className="panel panel-default" style={{ marginBottom: "20px" }}>
            <div className="panel-heading">
              <Title headingLevel="h3">DHCP Hosts</Title>
            </div>
            <div className="panel-body">
              <HostsTable hosts={parsedConf.dhcpHosts} leases={leases} onChange={handleNewHosts} />
            </div>
          </div>

          { parsedConf ? <ConfigEditor initialConfig={parsedConf} onSave={()=>{}} /> : null }

          {/* Configuration
              <button onClick={handleSaveConfig} className="btn btn-primary">Save Configuration</button>
              <button onClick={handleReloadConfig} className="btn btn-info">Reload Configuration</button>
          */}

        </div>
        ) : null }

        <ServiceStatus />

      </PanelMainBody></PanelMain>
    </Panel>
  );
};

export default App;