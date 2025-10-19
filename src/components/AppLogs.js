import DnsmasqApi from 'dnsmasq-api';
import React, { useState, useEffect, useCallback } from 'react';

const AppLogs = () => {
  const [logsContent, setLogsContent] = useState('Loading logs...');

  // Load logs
  const loadLogs = useCallback(async () => {
    try {
      const data = await DnsmasqApi.readLogs()
      setLogsContent(data);
    } catch (error) {
      setLogsContent("Error reading logs: " + error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">Logs</h3>
      </div>
      <div className="panel-body">
        <div id="logs-container">
          <pre className="textblock">{logsContent}</pre>
        </div>
        <button onClick={loadLogs} className="btn btn-default">Refresh Logs</button>
      </div>
    </div>
  );
};

export default AppLogs;