'use strict';

module.exports = {
    'env': {
        'browser'  : true,
        'commonjs' : true,
        'es6'      : true,
        'node'     : true,
    },

    'extends'       : 'eslint:recommended',

    'parserOptions' : {
        'sourceType'  : 'module',
        'ecmaVersion' : 8,
    },

    'rules': {

        // Coding Style
        'indent'                   : [2, 4, {'SwitchCase': 1, 'MemberExpression': 0}],
        'linebreak-style'          : [2, 'unix'],
        'quotes'                   : [2, 'single'],
        'semi'                     : [2, 'always'],
        'brace-style'              : [2, 'stroustrup'],
        'space-before-blocks'      : [2, 'always'],
        'keyword-spacing'          : 2,
        'space-infix-ops'          : 2,
        'newline-per-chained-call' : 2,
        'space-in-parens'          : [2, 'never'],
        'array-bracket-spacing'    : [2, 'never'],
        'max-len'                  : [2, {'code': 90}],
        'comma-style'              : [2, 'last'],
        'comma-dangle'             : [2, 'always-multiline'],
        'camelcase'                : 2,
        'spaced-comment'           : [2, 'always'],

        // Warn about console.* and debugger
        'no-alert'    : 1,
        'no-console'  : 0,
        'no-debugger' : 1,

        // References
        'prefer-const'    : 2,
        'no-const-assign' : 2,
        'no-var'          : 1,

        // Objects
        'no-new-object'        : 2,
        'object-shorthand'     : [2, 'always', {'avoidQuotes' : true}],
        'quote-props'          : [2, 'as-needed'],
        'object-curly-spacing' : [2, 'never'],

        // Arrays
        'array-callback-return' : 'error',
        'prefer-template'       : 2,
        'no-array-constructor'  : 1,

        // Strings
        'template-curly-spacing' : [2, 'never'],
        'no-useless-escape'      : 2,
        'no-control-regex'       : 0,

        // Functions
        'wrap-iife'             : 2,
        'no-loop-func'          : 2,
        'prefer-rest-params'    : 2,
        'no-param-reassign'     : [1, {'props': true}],
        'prefer-arrow-callback' : [2, {'allowNamedFunctions': true}],
        'arrow-parens'          : [2, 'as-needed'],
        // 'arrow-body-style'      : [2, 'as-needed'],

        // Classes
        'no-useless-constructor' : 2,
        'no-dupe-class-members'  : 2,

        // Modules
        'no-duplicate-imports': 2,

        // Properties
        'dot-notation': 2,

        // Other
        'eqeqeq'    : [2, 'always'],
        'radix'     : [2, 'always'],
        'no-case-declarations' : 2,
        'no-nested-ternary'    : 2,
        'no-unneeded-ternary'  : 2,

        // Complexity
        'max-statements': [2, 20],
        'max-params'    : [1, 3],
        'complexity'    : [2, 5],
        'max-depth'     : [2, 4],
        'max-nested-callbacks': [2, 3],
    },

    'globals': {
        $: false,
    },
};
