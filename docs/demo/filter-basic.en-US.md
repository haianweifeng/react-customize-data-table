---
title: Filter & Sort
order: 9
toc: content
---

<code src='../examples/FilterSortBasic.tsx' description="Use filters to generate filter menu in columns, onFilter to determine filtered result, and filterMultiple to indicate whether it's multiple or single selection.<br/>Uses defaultFilteredValue to make a column filtered by default.<br/>Use sorter to make a column sortable. sorter can be a function of the type function(a, b) { ... } for sorting data locally.<br/>Uses defaultSortOrder to make a column sorted by default.<br/>If a sortOrder or defaultSortOrder is specified with the value ascend or descend, you can access this value from within the function passed to the sorter as explained above. Such a function can take the form: function(a, b, sortOrder) { ... }.">Basic usage</code>
