<template>
  <select 
    :value="newValue" 
    @change="onSelect"
    :disabled="disabled"
  >
    <option 
      v-if="placeholder" 
      value="" 
      :disabled="placeholderDisabled"
    >
      {{ placeholder }}
    </option>
    <option
      v-for="(option, index) in options"
      :key="index"
      :disabled="option.disabled"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'PfSelect',
  
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    placeholderDisabled: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:value', 'change'],
  
  data() {
    return {
      newValue: this.value
    }
  },
  
  watch: {
    value(newVal) {
      this.newValue = newVal
    }
  },
  
  methods: {
    onSelect(event) {
      const value = event.target.value
      this.newValue = value
      
      // Emit update for v-model support
      this.$emit('update:value', value)
      this.$emit('change', value)
    }
  }
}
</script>