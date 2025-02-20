module.exports = {
    root: true,
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        node: true,
        es2021: true
    },
    rules: {
        'no-const-assign': 'off',
        'newline-before-return': 'error',
        semi: 'error',
        'no-unreachable': 'error',
        'no-extra-semi': 'error',
        'no-unexpected-multiline': 'error',
        'comma-dangle': [
            'error',
            {
                arrays: 'never',
                objects: 'never',
                imports: 'never',
                exports: 'never',
                functions: 'never'
            }
        ]
    }
};