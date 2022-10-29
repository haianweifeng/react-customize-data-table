// const base = require('@umijs/fabric/dist/eslint');
// module.exports = {
//   ...base,
//   rules: {
//     ...base.rules,
//     // 'arrow-parens': 0,
//     'react/no-array-index-key': 'off',
//     'no-param-reassign': 'off',
//     '@typescript-eslint/no-loop-func': 'off',
//     // 'react/sort-comp': 0,
//     // '@typescript-eslint/no-explicit-any': 1,
//     // '@typescript-eslint/no-empty-interface': 1,
//     // '@typescript-eslint/no-inferrable-types': 0,
//     // 'react/no-find-dom-node': 1,
//     // 'react/require-default-props': 0,
//     // 'no-confusing-arrow': 0,
//     // 'import/no-extraneous-dependencies': 0,
//     // 'import/no-named-as-default-member': 0,
//     // 'import/no-unresolved': 0,
//     // 'jsx-a11y/label-has-for': 0,
//     // 'jsx-a11y/label-has-associated-control': 0,
//     // 'jsx-a11y/control-has-associated-label': 0,
//   },
// };

module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'react/no-array-index-key': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/no-loop-func': 'off',
  },
};
