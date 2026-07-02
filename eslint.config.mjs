// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/html-self-closing': [
      'off',
      {
        html: {
          void: 'always', // Required: Prettier always self-closes void tags
          normal: 'never', // Required: Prettier never self-closes normal HTML tags
          component: 'always' // Required: Prettier always self-closes Vue components
        },
        svg: 'always',
        math: 'always'
      }
    ]
  }
})
