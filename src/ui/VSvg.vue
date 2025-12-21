<template>
  <div
    v-if="svgContent"
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
      // Если передан fill prop, заменяем fill атрибуты на currentColor
      if (this.fill !== null) {
        curSvg = this.replaceSvgAttributes(curSvg, 'fill', this.fill)
      }      
      // Если передан stroke prop, заменяем stroke атрибуты на currentColor
      if (this.stroke !== null) {
        curSvg = this.replaceSvgAttributes(curSvg, 'stroke', this.stroke)
      }      
      return curSvg
    },

    replaceSvgAttributes(svgString, attribute, value) {
      // Создаем временный DOM элемент для парсинга SVG
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgString, 'image/svg+xml')
      const svgElement = doc.documentElement
      
      if (!svgElement || svgElement.tagName !== 'svg') {
        return svgString
      }
      
      // Функция для рекурсивной замены атрибутов
      const replaceAttributes = (element) => {
        // Заменяем атрибут у текущего элемента
        if (value) {
          element.setAttribute(attribute, value)
        } else if (element.hasAttribute(attribute)) {
          element.removeAttribute(attribute)
        }
        // Рекурсивно обрабатываем дочерние элементы
        Array.from(element.children).forEach(child => {
          replaceAttributes(child)
        })
      }      
      // Запускаем замену
      replaceAttributes(svgElement)      
      // Возвращаем обработанный SVG как строку
      return new XMLSerializer().serializeToString(svgElement)
    }
  },  
}
</script>