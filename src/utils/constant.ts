// 在Mac下，滚动条是不占位的，所以宽度始终是为0的，在windows系统下，是占位的。所以取了个大约值16
export const BAR_WIDTH = 16;

export const BAR_THUMB_SIZE = 16;

export const SELECTION_EXPAND_COLUMN_WIDTH = 44;

export const PREFIXCLS = 'rv-table';

export const CLASS_ROW = `${PREFIXCLS}-row`;

export const CLASS_ROW_EXPAND = `${PREFIXCLS}-row-expand`;

export const CLASS_CELL_FIXED_LEFT = `${PREFIXCLS}-cell-fixed-left`;

export const CLASS_CELL_FIXED_RIGHT = `${PREFIXCLS}-cell-fixed-right`;

export const CLASS_CELL_FIXED_LAST = `${PREFIXCLS}-cell-fixed-last`;

export const CLASS_CELL_FIXED_FIRST = `${PREFIXCLS}-cell-fixed-first`;

export const CLASS_CELL_FIXED_LAST_LEFT = `${PREFIXCLS}-cell-fixed-last-left`;

export const CLASS_CELL_FIXED_FIRST_RIGHT = `${PREFIXCLS}-cell-fixed-first-right`;

export const CLASS_CELL_EMPTY = `${PREFIXCLS}-cell-empty`;

export const CLASS_EMPTY_CONTENT = `${PREFIXCLS}-empty-placeholder-content`;

export const CLASS_SCROLLBAR_TRACK = `${PREFIXCLS}-scrollbar-track`;

export const CLASS_SCROLLBAR_TRACK_SCROLLING = `${PREFIXCLS}-scrollbar-track-scrolling`;

export const CLASS_SCROLLBAR_TRACK_ACTIVE = `${PREFIXCLS}-scrollbar-track-active`;

export const omitColumnProps = [
  '_width',
  '_columnKey',
  '_lastLeftFixed',
  '_firstRightFixed',
  '_ignoreRightBorder',
];
