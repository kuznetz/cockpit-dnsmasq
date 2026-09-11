<template>
  <div>
    <div v-for="(option, idx) in newItems" :key="idx" class="flex-row">
      <div class="flex-grow form-static">
        {{ option }}
      </div>
      <pf-button variant="link" @click="del(idx)">
        <VSvg :src="DeleteSvg" fill="currentColor" class="icon"  style="height: 16px" />
      </pf-button>
    </div>
    <div class="flex-row">
      <input ref="addInp" @keydown.enter="add()" type="text" v-model="newValue" :placeholder="placeholder" class="flex-grow">
      <div>
        <pf-button variant="link" @click="add()">
          <VSvg :src="AddSvg" fill="currentColor" style="height: 16px" />
        </pf-button>
      </div>
    </div>    
  </div>
</template>

<script>
  import VSvg from './VSvg.vue';
  import DeleteSvg from '@/svg/trash-solid-full.svg'
  import AddSvg from '@/svg/plus-solid-full.svg'

  export default {
    name: 'EditList',
    components: { VSvg },
    
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
        newValue: '',
        DeleteSvg,
        AddSvg
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
      save() {
        this.add()
      },
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