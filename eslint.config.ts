import noViewSpacingUtils from './eslint-rules/no-view-spacing-utils.ts'
import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-plugin-prettier/recommended'
import configPrettier from 'eslint-config-prettier'
import * as vueI18nPlugin from '@intlify/eslint-plugin-vue-i18n'

export default [
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      vue: pluginVue,
      '@intlify/vue-i18n': vueI18nPlugin,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@intlify/vue-i18n/no-raw-text': [
        'error',
        {
          ignorePattern: '^(?:°C|ppt|mg/L|pH|-?[0-9]+(?:\\.[0-9]+)?)$',
          ignoreNodes: ['v-icon', 'Transition', 'Teleport', 'Suspense'],
        },
      ],
      '@intlify/vue-i18n/no-missing-keys': 'error',
    },
    settings: {
      'vue-i18n': {
        localeDir: './src/shared/locales/*.json',
        messageSyntaxVersion: '9',
      },
    },
  },
  {
    files: ['src/**/views/**/*.vue', 'src/**/views/*.vue'],
    plugins: {
      'hatchery-layout': {
        rules: {
          'no-view-spacing-utils': noViewSpacingUtils,
        },
      },
    },
    rules: {
      'hatchery-layout/no-view-spacing-utils': 'error',
    },
  },
  prettier,
  configPrettier,
  {
    rules: {
      'prettier/prettier': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]
