import React, { useState, useEffect } from 'react';
import {
  Card, CardTitle, CardBody, Title, Button,
  Grid, GridItem, Form, FormGroup, TextInput,
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
          <Card isCompact isFlat style={{ marginBottom: "10px" }}>
            <CardTitle>DHCP Range</CardTitle>
            <CardBody>
              <Grid hasGutter>
                <GridItem span={6}>
                  <FormGroup
                    label="Start IP"
                    fieldId="dhcp-start-ip"
                    validated={errors.dhcpRangeStart ? 'error' : 'default'}
                    helperTextInvalid={errors.dhcpRangeStart}
                  >
                    <TextInput
                      id="dhcp-start-ip"
                      type="text"
                      value={config.dhcpRange.start}
                      onChange={(_event, value) => handleDhcpRangeChange('start', value)}
                      placeholder="192.168.10.100"
                      validated={errors.dhcpRangeStart ? 'error' : 'default'}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    label="End IP"
                    fieldId="dhcp-end-ip"
                    validated={errors.dhcpRangeEnd ? 'error' : 'default'}
                    helperTextInvalid={errors.dhcpRangeEnd}
                  >
                    <TextInput
                      id="dhcp-end-ip"
                      type="text"
                      value={config.dhcpRange.end}
                      onChange={(_event, value) => handleDhcpRangeChange('end', value)}
                      placeholder="192.168.10.200"
                      validated={errors.dhcpRangeEnd ? 'error' : 'default'}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    label="Netmask"
                    fieldId="dhcp-netmask"
                    validated={errors.dhcpRangeNetmask ? 'error' : 'default'}
                    helperTextInvalid={errors.dhcpRangeNetmask}
                  >
                    <TextInput
                      id="dhcp-netmask"
                      type="text"
                      value={config.dhcpRange.netmask}
                      onChange={(_event, value) => handleDhcpRangeChange('netmask', value)}
                      placeholder="255.255.255.0"
                      validated={errors.dhcpRangeNetmask ? 'error' : 'default'}
                    />
                  </FormGroup>
                </GridItem>
                <GridItem span={6}>
                  <FormGroup
                    label="Lease Time"
                    fieldId="dhcp-lease-time"
                    validated={errors.dhcpRangeLeaseTime ? 'error' : 'default'}
                    helperTextInvalid={errors.dhcpRangeLeaseTime}
                  >
                    <TextInput
                      id="dhcp-lease-time"
                      type="text"
                      value={config.dhcpRange.leaseTime}
                      onChange={(_event, value) => handleDhcpRangeChange('leaseTime', value)}
                      placeholder="24h"
                      validated={errors.dhcpRangeLeaseTime ? 'error' : 'default'}
                    />
                  </FormGroup>
                </GridItem>
              </Grid>
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
          <Card isCompact style={{ marginBottom: "10px" }}>
            <CardTitle>Other Settings</CardTitle>
            <CardBody>
                <FormGroup
                  label="Domain Name"
                  fieldId="domain-name"
                  style={{ marginBottom: "10px" }}
                >
                  <TextInput
                    type="text"
                    id="domain-name"
                    value={config.domainName}
                    onChange={(_event, value) => setConfig(prev => ({ ...prev, domainName: value }))}
                    placeholder="office.local"
                  />
                </FormGroup>
                
                <FormGroup
                  label="Broadcast Address"
                  fieldId="broadcast-address"
                  validated={errors.broadcast ? 'error' : 'default'}
                  helperTextInvalid={errors.broadcast}
                  style={{ marginBottom: "10px" }}
                >
                  <TextInput
                    type="text"
                    id="broadcast-address"
                    value={config.broadcast}
                    onChange={(_event, value) => setConfig(prev => ({ ...prev, broadcast: value }))}
                    placeholder="192.168.10.255"
                    validated={errors.broadcast ? 'error' : 'default'}
                  />
                </FormGroup>
                
                <FormGroup
                  label="DHCP Lease Max"
                  fieldId="dhcp-lease-max"
                  validated={errors.dhcpLeaseMax ? 'error' : 'default'}
                  helperTextInvalid={errors.dhcpLeaseMax}
                  style={{ marginBottom: "10px" }}
                >
                  <TextInput
                    type="number"
                    id="dhcp-lease-max"
                    value={config.dhcpLeaseMax}
                    onChange={(_event, value) => setConfig(prev => ({ ...prev, dhcpLeaseMax: parseInt(value) || 0 }))}
                    min="1"
                    max="10000"
                    validated={errors.dhcpLeaseMax ? 'error' : 'default'}
                  />
                </FormGroup>

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