import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'

export default [
    { ignores: ['dist', 'node_modules', 'npm'] },

    // Source files
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            // Template uses useUtils()/useConstants() at module top-level as plain utility accessors
            // (not actual React hooks). Downgrade to warn to avoid false positives on template files.
            'react-hooks/rules-of-hooks': 'warn',
            'react/react-in-jsx-scope': 'off',   // not needed with React 17+ JSX transform
            'react/prop-types': 'off',             // project doesn't use PropTypes
            'react/no-children-prop': 'off',       // template uses children-as-prop intentionally (Transitionable)
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
        settings: {
            react: { version: 'detect' },
        },
    },

    // Test files — add Vitest globals so lint doesn't flag describe/it/expect/vi
    {
        files: ['src/tests/**/*.{js,jsx}', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
    },
]
