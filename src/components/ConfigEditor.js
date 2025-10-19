import React, { useState, useEffect } from 'react';
import {
  Panel, PanelMain, PanelMainBody, PanelHeader,
  Card, CardTitle, CardBody, Title, Button
} from '@patternfly/react-core';

const DhcpConfigEditor = ({ initialConfig, onSave }) => {
  const [config, setConfig] = useState(initialConfig);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const validateIpAddress = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const validateLeaseTime = (leaseTime) => {
    const leaseRegex = /^(\d+)([hmd])$/;
    return leaseRegex.test(leaseTime);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate interfaces
    if (!config.interfaces || config.interfaces.length === 0) {
      newErrors.interfaces = 'At least one interface is required';
    }

    // Validate DHCP range
    if (!config.dhcpRange.start || !validateIpAddress(config.dhcpRange.start)) {
      newErrors.dhcpRangeStart = 'Valid start IP address is required';
    }
    if (!config.dhcpRange.end || !validateIpAddress(config.dhcpRange.end)) {
      newErrors.dhcpRangeEnd = 'Valid end IP address is required';
    }
    if (!config.dhcpRange.netmask || !validateIpAddress(config.dhcpRange.netmask)) {
      newErrors.dhcpRangeNetmask = 'Valid netmask is required';
    }
    if (!config.dhcpRange.leaseTime || !validateLeaseTime(config.dhcpRange.leaseTime)) {
      newErrors.dhcpRangeLeaseTime = 'Valid lease time required (e.g., 24h, 7d)';
    }

    // Validate routers
    if (config.routers && config.routers.length > 0) {
      config.routers.forEach((router, index) => {
        if (!validateIpAddress(router)) {
          newErrors[`router-${index}`] = 'Valid router IP address is required';
        }
      });
    }

    // Validate DNS servers
    if (config.dnsServers && config.dnsServers.length > 0) {
      config.dnsServers.forEach((dns, index) => {
        if (!validateIpAddress(dns)) {
          newErrors[`dns-${index}`] = 'Valid DNS server IP address is required';
        }
      });
    }

    // Validate broadcast
    if (config.broadcast && !validateIpAddress(config.broadcast)) {
      newErrors.broadcast = 'Valid broadcast address is required';
    }

    // Validate DHCP lease max
    if (config.dhcpLeaseMax < 1 || config.dhcpLeaseMax > 10000) {
      newErrors.dhcpLeaseMax = 'DHCP lease max must be between 1 and 10000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(config);
    }
  };

  const handleArrayChange = (arrayName, index, value) => {
    const newArray = [...config[arrayName]];
    newArray[index] = value;
    setConfig(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const handleAddArrayItem = (arrayName, defaultValue = '') => {
    setConfig(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultValue]
    }));
  };

  const handleRemoveArrayItem = (arrayName, index) => {
    setConfig(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleDhcpRangeChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      dhcpRange: {
        ...prev.dhcpRange,
        [field]: value
      }
    }));
  };

  return (
    <div className="panel panel-default dhcp-config-editor" style={{ marginBottom: "20px" }}>
      <div className="panel-heading">
        <Title headingLevel="h3">DHCP Configuration Editor</Title>
      </div>
      
      <div className="panel-body">

        <div className="config-editor-grid">

          {/* Interfaces */}
        <Card isCompact={true} style={{ marginBottom: "10px" }}>
            <CardTitle>Interfaces</CardTitle>
            <CardBody >
                {config.interfaces.map((interfaceName, index) => (
                  <div key={index} className="array-item">
                    <input
                      type="text"
                      value={interfaceName}
                      onChange={(e) => handleArrayChange('interfaces', index, e.target.value)}
                      placeholder="Interface name (e.g., eth0)"
                    />
                    {config.interfaces.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveArrayItem('interfaces', index)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    )}
                    {errors.interfaces && index === 0 && (
                      <span className="error">{errors.interfaces}</span>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => handleAddArrayItem('interfaces', '')}
                  className="add-btn"
                >
                  Add Interface
                </button>
            </CardBody>
          </Card>

          {/* DHCP Range */}
          <Card isCompact={true} style={{ marginBottom: "10px" }}>
            <CardTitle>DHCP Range</CardTitle>
            <CardBody>
              <div className="form-row">
                <div className="form-group">
                  <label>Start IP:</label>
                  <input
                    type="text"
                    value={config.dhcpRange.start}
                    onChange={(e) => handleDhcpRangeChange('start', e.target.value)}
                    placeholder="192.168.10.100"
                  />
                  {errors.dhcpRangeStart && (
                    <span className="error">{errors.dhcpRangeStart}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>End IP:</label>
                  <input
                    type="text"
                    value={config.dhcpRange.end}
                    onChange={(e) => handleDhcpRangeChange('end', e.target.value)}
                    placeholder="192.168.10.200"
                  />
                  {errors.dhcpRangeEnd && (
                    <span className="error">{errors.dhcpRangeEnd}</span>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Netmask:</label>
                  <input
                    type="text"
                    value={config.dhcpRange.netmask}
                    onChange={(e) => handleDhcpRangeChange('netmask', e.target.value)}
                    placeholder="255.255.255.0"
                  />
                  {errors.dhcpRangeNetmask && (
                    <span className="error">{errors.dhcpRangeNetmask}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Lease Time:</label>
                  <input
                    type="text"
                    value={config.dhcpRange.leaseTime}
                    onChange={(e) => handleDhcpRangeChange('leaseTime', e.target.value)}
                    placeholder="24h"
                  />
                  {errors.dhcpRangeLeaseTime && (
                    <span className="error">{errors.dhcpRangeLeaseTime}</span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Routers */}
          <Card isCompact={true} style={{ marginBottom: "10px" }}>
            <CardTitle>Routers</CardTitle>
            <CardBody>
              {config.routers.map((router, index) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={router}
                    onChange={(e) => handleArrayChange('routers', index, e.target.value)}
                    placeholder="Router IP address"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveArrayItem('routers', index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                  {errors[`router-${index}`] && (
                    <span className="error">{errors[`router-${index}`]}</span>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => handleAddArrayItem('routers', '')}
                className="add-btn"
              >
                Add Router
              </button>
            </CardBody>
          </Card>

          {/* DNS Servers */}
          <Card isCompact={true} style={{ marginBottom: "10px" }}>
            <CardTitle>DNS Servers</CardTitle>
            <CardBody>
              {config.dnsServers.map((dns, index) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={dns}
                    onChange={(e) => handleArrayChange('dnsServers', index, e.target.value)}
                    placeholder="DNS server IP address"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveArrayItem('dnsServers', index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                  {errors[`dns-${index}`] && (
                    <span className="error">{errors[`dns-${index}`]}</span>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => handleAddArrayItem('dnsServers', '')}
                className="add-btn"
              >
                Add DNS Server
              </button>
            </CardBody>
          </Card>

          {/* Other Settings */}
          <Card isCompact={true} style={{ marginBottom: "10px" }}>
            <CardTitle>Other Settings</CardTitle>
            <CardBody>
              <div className="form-row">
                <div className="form-group">
                  <label>Domain Name:</label>
                  <input
                    type="text"
                    value={config.domainName}
                    onChange={(e) => setConfig(prev => ({ ...prev, domainName: e.target.value }))}
                    placeholder="office.local"
                  />
                </div>
                <div className="form-group">
                  <label>Broadcast Address:</label>
                  <input
                    type="text"
                    value={config.broadcast}
                    onChange={(e) => setConfig(prev => ({ ...prev, broadcast: e.target.value }))}
                    placeholder="192.168.10.255"
                  />
                  {errors.broadcast && (
                    <span className="error">{errors.broadcast}</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>DHCP Lease Max:</label>
                <input
                  type="number"
                  value={config.dhcpLeaseMax}
                  onChange={(e) => setConfig(prev => ({ ...prev, dhcpLeaseMax: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="10000"
                />
                {errors.dhcpLeaseMax && (
                  <span className="error">{errors.dhcpLeaseMax}</span>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: "center", padding:"10px" }}>
          <Button onClick={handleSave} variant="primary" size="md">
            Save Configuration
          </Button>
        </div>        

      </div>
    </div>
  );
};

// Default props
/*
DhcpConfigEditor.defaultProps = {
  initialConfig: {
    interfaces: ['eth0'],
    dhcpRange: {
      start: '192.168.10.100',
      end: '192.168.10.200',
      netmask: '255.255.255.0',
      leaseTime: '24h'
    },
    routers: ['192.168.10.1'],
    dnsServers: ['192.168.10.1'],
    domainName: 'office.local',
    broadcast: '192.168.10.255',
    dhcpLeaseMax: 150
  },
  onSave: (config) => console.log('Saving config:', config),
  onCancel: () => console.log('Cancelled')
};
*/

export default DhcpConfigEditor;