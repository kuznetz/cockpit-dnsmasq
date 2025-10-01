import React, { useState, useEffect, useMemo } from 'react';
import { FormSelect, FormSelectOption } from '@patternfly/react-core';

const PfSelect = ({ options, value='', onChange, placeholder }) => {
  const [newValue, setNewValue] = useState('');
  
  useEffect(() => {
    setNewValue(value);
  }, [value]);

  const onSelect = (_event, value) => {
    setNewValue(value)
    if (onChange) onChange(value)
  };

  return (
    <FormSelect value={newValue} onChange={onSelect}>
      <FormSelectOption isDisabled={true} value="" label={placeholder} />
      {options.map((option, index) => 
        <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
      )}
    </FormSelect>
  );
};

export default PfSelect;