<template>
  <div>
    <div v-for="(option, idx) in newItems" :key="idx" class="flex-row">
      <div class="flex-grow form-static">
        {{ option }}
      </div>
      <div>
        <button @click="del(idx)">X</button>
      </div>
    </div>
    <div class="flex-row">
      <div class="flex-grow">
        <input ref="addInp" @keydown.enter="add()" type="text" v-model="newValue" :placeholder="placeholder">
      </div>
      <div>
        <button @click="add()">+</button>
      </div>
    </div>    
  </div>
</template>

<script>
export default {
  name: 'EditList',  
  props: {
    items: {
      type: Array
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  
  emits: ['changed'],
  
  data() {
    return {
      newItems: [],
      newValue: ''
    }
  },
  
  watch: {
    items(items) {
      this.newItems = [...this.items]
    }
  },

  mounted() {
    if (this.items) {
      this.newItems = [...this.items]
    }
  },
  
  methods: {
    add() {
      if (this.newValue) {
        this.newItems.push(this.newValue)
        this.newValue = ''
        this.$emit('changed', this.newItems)
        this.$refs.addInp.focus()
      }
    },
    del (idx) {
      if (idx >= 0) {
        this.newItems.splice(idx, 1)
        this.$emit('changed', this.newItems)
      }
    }
  }
}
</script>