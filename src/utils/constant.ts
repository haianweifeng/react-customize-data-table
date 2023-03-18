// 在Mac下，滚动条是不占位的，所以宽度始终是为0的，在windows系统下，是占位的。所以取了个大约值16
export const BAR_WIDTH = 16;

export const BAR_THUMB_SIZE = 16;

export const SELECTION_EXPAND_COLUMN_WIDTH = 44;

export const omitColumnProps = [
  '_width',
  '_columnKey',
  '_lastLeftFixed',
  '_firstRightFixed',
  '_ignoreRightBorder',
];
