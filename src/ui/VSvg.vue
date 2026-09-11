<template>
  <div
    v-if="svgContent"
    class="icon"
    v-html="svgContent"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'VSvg',
  props: {
    src: {
      type: String,
      required: true
    },
    fill: {
      type: String,
      default: null
    },
    stroke: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      svgContent: null
    }
  },

  async mounted() {
    await this.reload(this.src)
  },

  watch: {
    src: {
      immediate: true,
      async handler(newSrc) {
        await this.reload(newSrc)
      }
    }
  },

  methods: {
    async reload(newSrc) {
        if (!newSrc) return        
        try {
          const response = await fetch(newSrc)          
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`)
          }          
          const svgText = await response.text()
          this.svgContent = this.processSvg(svgText)
        } catch (error) {
          console.error(`Failed to load SVG from ${newSrc}`, error)
        }
    },

    processSvg(curSvg) {
      // If the fill prop is passed, replace fill attributes with currentColor
      if (this.fill !== null) {
        curSvg = this.replaceSvgAttributes(curSvg, 'fill', this.fill)
      }      
      // If the stroke prop is passed, replace stroke attributes with currentColor
      if (this.stroke !== null) {
        curSvg = this.replaceSvgAttributes(curSvg, 'stroke', this.stroke)
      }      
      return curSvg
    },

    replaceSvgAttributes(svgString, attribute, value) {
      // Create a temporary DOM element for parsing the SVG
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgString, 'image/svg+xml')
      const svgElement = doc.documentElement
      
      if (!svgElement || svgElement.tagName !== 'svg') {
        return svgString
      }
      
      // Function for recursively replacing attributes
      const replaceAttributes = (element) => {
        // Replace the attribute on the current element
        if (value) {
          element.setAttribute(attribute, value)
        } else if (element.hasAttribute(attribute)) {
          element.removeAttribute(attribute)
        }
        // Recursively process child elements
        Array.from(element.children).forEach(child => {
          replaceAttributes(child)
        })
      }      
      // Start the replacement
      replaceAttributes(svgElement)      
      // Return the processed SVG as a string
      return new XMLSerializer().serializeToString(svgElement)
    }
  },  
}
</script>