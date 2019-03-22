<template lang="html">
  
  <input
    type="text"
    class="input-number"
    :tabindex="tabindex"
    v-model="displayValue"
    @blur="handleInputState"
    @focus="handleInputState" 
  />
    
</template>

<script>

const masks = {
  currency: {
    mask (value) {
      return value.toLocaleString()
    },
    unmask (value) {
      value = parseFloat(value.replace(/[^\d\.]/g, ""))
      return isNaN(value)
      	? 0
        : value
    },
  },
}

module.exports = {
  props: {
  	value: null,
    maskType: String,
    tabindex: Number
  },
  data: function() {
    return {
      inputFocused: false
    }
  },
  methods: {
  	handleInputState (event) {
    	this.inputFocused = event.type === 'focus'
    },
    unmask (value) {
    	return masks[this.maskType].unmask(value)
    },
    mask (value) {
    	return masks[this.maskType].mask(value)
    },
  },
  computed: {
    displayValue: {
      get: function() {
        if (this.inputFocused) {
          return this.value !== undefined ? this.value.toString() : '';
        } else {
          return this.value !== undefined ? this.mask(this.value) : '';
        }
      },
      set: function(modifiedValue) {        
        this.$emit('input', this.unmask(modifiedValue))
      }
    }
  }
};
</script>

<style></style>
