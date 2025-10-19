import DnsmasqApi from 'dnsmasq-api';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Panel, PanelMain, PanelMainBody, PanelHeader,
  Card, CardTitle, CardBody, Title, Button,
  Flex, FlexItem
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

const ServiceStatus = () => {
  const [serviceStatus, setServiceStatus] = useState('Checking...');

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

  // Initialize
  useEffect(() => {
    checkStatus();
    // Refresh status every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const buttons = showButtons();
  const isActive = serviceStatus === "active";

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <Title headingLevel="h3">Service Status</Title>
      </div>
      <div className="panel-body">
        
        <Card component="div">
          <CardBody>
            <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    {isActive ? (
                      <CheckCircleIcon className="pf-v6-u-color-100" />
                    ) : (
                      <ExclamationCircleIcon className="pf-v6-u-color-200" />
                    )}
                  </FlexItem>
                  <FlexItem>
                    Status: <span className={isActive ? "pf-v6-u-color-100" : "pf-v6-u-color-200"}>
                      {serviceStatus}
                    </span>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }}>
                  {buttons.start && (
                    <Button variant="primary" onClick={handleStart}>
                      Start
                    </Button>
                  )}
                  {buttons.stop && (
                    <Button variant="danger" onClick={handleStop}>
                      Stop
                    </Button>
                  )}
                  {buttons.restart && (
                    <Button variant="warning" onClick={handleRestart}>
                      Restart
                    </Button>
                  )}
                  {buttons.reload && (
                    <Button variant="secondary" onClick={handleReload}>
                      Reload
                    </Button>
                  )}
                </Flex>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>

      </div>    
    </div>        
  );
};

export default ServiceStatus;