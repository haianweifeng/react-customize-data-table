import React, {
  isValidElement,
  cloneElement,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import classnames from 'classnames';
import { debounce } from 'lodash';
import './index.less';
import { getParent } from '../utils/util';

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

interface TooltipProps {
  /** 卡片类名 */
  className?: string;
  /** 卡片样式 */
  style?: React.CSSProperties;
  /** 触发行为 */
  trigger?: 'hover' | 'click';
  /** 显示的文字 */
  tip: string | React.ReactNode | (() => React.ReactNode);
  /** Tooltip 出现位置 */
  placement: TooltipPlacement;
  /** 子元素 */
  children: React.ReactElement;
  /** 主题 */
  theme?: 'dark' | 'light';
  /** 延迟显示，单位毫秒 */
  delay?: number;
  /** 浮层渲染父节点，默认渲染到 body 上 */
  getPopupContainer?: () => HTMLElement;
  /** 用于手动控制浮层显隐 */
  visible?: boolean;
  /** 显示隐藏的回调 */
  onVisibleChange?: (visible: boolean) => void;
  /** 气泡被遮挡时自动调整位置 */
  autoAdjustPlacement?: boolean;
}
const Tooltip = (props: TooltipProps) => {
  const {
    tip,
    className = '',
    style = {},
    trigger = 'hover',
    theme = 'dark',
    delay = 0,
    placement = 'top',
    children,
    getPopupContainer = () => document.querySelector('body'),
    visible,
    onVisibleChange,
    autoAdjustPlacement = true,
  } = props;

  const timer = useRef<number>();
  const mountedRef = useRef<boolean>(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isEnter = useRef<boolean>(false);

  const [showPopper, setShowPopper] = useState<boolean>(!!visible);

  const [tooltipMounted, setTooltipMounted] = useState<boolean>(false);

  const [finalPlacement, setFinalPlacement] = useState<TooltipPlacement>(placement);

  const [pos, setPos] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 });

  if (!isValidElement(children)) {
    console.error(new Error('Tooltip expect a single ReactElement as children.'));
    return null;
  }

  const popupContainer = getPopupContainer();

  const isManual = trigger === 'click';

  const reversePosition = useCallback((position: string) => {
    if (/top/.test(position)) {
      return position.replace('top', 'bottom') as TooltipPlacement;
    }
    if (/bottom/.test(position)) {
      return position.replace('bottom', 'top') as TooltipPlacement;
    }
    if (/left/.test(position)) {
      return position.replace('left', 'right') as TooltipPlacement;
    }
    if (/right/.test(position)) {
      return position.replace('right', 'left') as TooltipPlacement;
    }
    return position as TooltipPlacement;
  }, []);

  const removeLastPosition = useCallback((position: string) => {
    const item = ['Top', 'Bottom', 'Left', 'Right'].find((p) => position.endsWith(p));
    return (item ? position.replace(item, '') : position) as TooltipPlacement;
  }, []);

  // 判断原空间以及反向空间是否都不足
  const isOverLimit = useCallback((space: number, reverseSpace: number, size: number) => {
    return space < size && reverseSpace < size;
  }, []);

  // 判断正半空间和负半空间是否都足够容纳 假如半边空间都足够容纳 topLeft 直接变成top
  const isHalfAllEnough = useCallback((space: number, reverseSpace: number, size: number) => {
    return space >= size && reverseSpace >= size;
  }, []);

  const isNeedReverse = useCallback(
    (
      viewOverLimit: boolean,
      popupOverLimit: boolean,
      needReverseView: boolean,
      needReversePopup: boolean,
    ) => {
      // 1.视口上下空间不足且容器中有一侧空间充足
      // 2.视口上下空间中有一侧空间充足且容器上下空间不足
      // 3.视口上下空间中有一侧空间充足且容器上下空间中有一侧充足
      return (
        (viewOverLimit && needReversePopup) ||
        (needReverseView && popupOverLimit) ||
        (needReverseView && needReversePopup)
      );
    },
    [],
  );

  // const isNeedReverse = useCallback((viewOverLimit: boolean, needReverseView: boolean) => {
  //   return viewOverLimit && needReverseView;
  // }, []);

  const getPlacement = useCallback(() => {
    if (!autoAdjustPlacement) return placement;

    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;

    if (triggerEl && tooltipEl && popupContainer) {
      let position = placement;
      const { innerWidth, innerHeight } = window;
      const triggerRect = triggerEl.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const popupRect = popupContainer.getBoundingClientRect();

      const isBody =
        popupContainer === document.body || popupContainer === document.documentElement;

      const restLeft = innerWidth - triggerRect.left;
      const restTop = innerHeight - triggerRect.top;
      const restRight = innerWidth - triggerRect.right;
      const restBottom = innerHeight - triggerRect.bottom;

      // 基于视口判断是否需要调整
      const needViewReverseTop =
        triggerRect.top < tooltipRect.height && restBottom > tooltipRect.height;

      const needViewReverseBottom =
        restBottom < tooltipRect.height && triggerRect.top > tooltipRect.height;

      const needViewReverseLeft =
        triggerRect.left < tooltipRect.width && restRight > tooltipRect.width;

      const needViewReverseRight =
        restRight < tooltipRect.width && triggerRect.left > tooltipRect.width;

      // 纵向显示弹出层时候 topRight -> topLeft bottomRight -> bottomLeft
      const changeViewRightToLeft =
        triggerRect.right > tooltipRect.width && restLeft < tooltipRect.width;

      // 纵向显示弹出层时候 topLeft -> topRight bottomLeft -> bottomRight
      const changeViewLeftToRight =
        triggerRect.right < tooltipRect.width && restLeft > tooltipRect.width;

      // 横向显示弹出层时候 leftTop -> leftBottom  rightTop -> rightBottom
      const changeViewTopToBottom =
        restTop > tooltipRect.height && triggerRect.top < tooltipRect.height;

      // 横向显示弹出层时候 leftBottom -> leftTop  rightBottom -> rightTop
      const changeViewBottomToTop =
        restTop < tooltipRect.height && triggerRect.top > tooltipRect.height;

      // 基于容器判断是否需要调整
      const offsetTop = triggerRect.top - (isBody ? 0 : popupRect.top);
      const offsetLeft = triggerRect.left - (isBody ? 0 : popupRect.left);
      const offsetBottom = (isBody ? innerHeight : popupRect.bottom) - triggerRect.bottom;
      const offsetRight = (isBody ? innerWidth : popupRect.right) - triggerRect.right;

      const restBottomInPopup = offsetTop + triggerRect.height;
      const restRightInPopup = offsetLeft + triggerRect.width;
      const restLeftInPopup = offsetRight + triggerRect.width;
      const restTopInPopup = offsetBottom + triggerRect.height;

      // 容器中原空间不足,反向空间充足可以反转
      const needPopupReverseTop =
        offsetTop < tooltipRect.height && offsetBottom > tooltipRect.height;

      const needPopupReverseBottom =
        offsetTop > tooltipRect.height && offsetBottom < tooltipRect.height;

      const needPopupReverseLeft =
        offsetLeft < tooltipRect.width && offsetRight > tooltipRect.width;

      const needPopupReverseRight =
        offsetLeft > tooltipRect.width && offsetRight < tooltipRect.width;

      // 纵向显示弹出层时候 topRight -> topLeft bottomRight -> bottomLeft
      const changePopupRightToLeft =
        restRightInPopup > tooltipRect.width && restLeftInPopup < tooltipRect.width;

      // 纵向显示弹出层时候 topLeft -> topRight bottomLeft -> bottomRight
      const changePopupLeftToRight =
        restRightInPopup < tooltipRect.width && restLeftInPopup > tooltipRect.width;

      // 横向显示弹出层时候 leftTop -> leftBottom  rightTop -> rightBottom
      const changePopupTopToBottom =
        restBottomInPopup < tooltipRect.height && restTopInPopup > tooltipRect.height;

      // 横向显示弹出层时候 leftBottom -> leftTop  rightBottom -> rightTop
      const changePopupBottomToTop =
        restBottomInPopup > tooltipRect.height && restTopInPopup < tooltipRect.height;

      const halfWidth = triggerRect.width / 2;
      const halfHeight = triggerRect.height / 2;

      // 判断视口中原空间以及反向空间是否都不足
      const isViewYOverLimit = isOverLimit(triggerRect.top, restBottom, tooltipRect.height);

      const isViewXOverLimit = isOverLimit(triggerRect.left, restRight, tooltipRect.width);

      const isViewYOverLimitWithTriggerHeight = isOverLimit(
        triggerRect.bottom,
        restTop,
        tooltipRect.height,
      );

      const isViewXOverLimitWithTriggerWidth = isOverLimit(
        triggerRect.right,
        restLeft,
        tooltipRect.width,
      );

      // 如果placement: 'top' | 'bottom' | 'left' | 'right' 假如是top 判断是否需要转换成topLeft topRight
      // 箭头居中但是会超出视图
      const isViewYOverLimitWithSideHalf = isOverLimit(
        triggerRect.bottom - halfHeight,
        restTop - halfHeight,
        tooltipRect.height / 2,
      );

      const isViewXOverLimitWithSideHalf = isOverLimit(
        triggerRect.right - halfWidth,
        restLeft - halfWidth,
        tooltipRect.width / 2,
      );

      // 判断正负半边两侧空间是否都能容纳
      const isViewYEnoughWithHalfSide = isHalfAllEnough(
        triggerRect.bottom - halfHeight,
        restTop - halfHeight,
        tooltipRect.height / 2,
      );

      const isViewXEnoughWithHalfSide = isHalfAllEnough(
        triggerRect.right - halfWidth,
        restLeft - halfWidth,
        tooltipRect.width / 2,
      );

      // 判断容器中原空间以及反向空间是否都不足
      const isPopupYOverLimit = isOverLimit(offsetTop, offsetBottom, tooltipRect.height);

      const isPopupXOverLimit = isOverLimit(offsetLeft, offsetRight, tooltipRect.width);

      const isPopupYOverLimitWithTriggerHeight = isOverLimit(
        restBottomInPopup,
        restTopInPopup,
        tooltipRect.height,
      );

      const isPopupXOverLimitWithTriggerWidth = isOverLimit(
        restRightInPopup,
        restLeftInPopup,
        tooltipRect.width,
      );

      const isPopupYOverLimitWithSideHalf = isOverLimit(
        restBottomInPopup - halfHeight,
        restTopInPopup - halfHeight,
        tooltipRect.height / 2,
      );

      const isPopupXOverLimitWithSideHalf = isOverLimit(
        restRightInPopup - halfWidth,
        restLeftInPopup - halfWidth,
        tooltipRect.width / 2,
      );

      const isPopupYEnoughWithHalfSide = isHalfAllEnough(
        restBottomInPopup - halfHeight,
        restTopInPopup - halfHeight,
        tooltipRect.height / 2,
      );

      const isPopupXEnoughWithHalfSide = isHalfAllEnough(
        restRightInPopup - halfWidth,
        restLeftInPopup - halfWidth,
        tooltipRect.width / 2,
      );

      // 判断是否满足视口和容器都放不下才能调整弹出位置
      // 调整位置的前提是弹出容器的大小超出能能容纳它的容器大小，只有满足了条件才会调整位置
      // console.log(`isViewYOverLimit: ${isViewYOverLimit}`);
      // console.log(`isPopupYOverLimit: ${isPopupYOverLimit}`);
      // console.log(`needViewReverseTop: ${needViewReverseTop}`);
      // console.log(`needPopupReverseTop: ${needPopupReverseTop}`);
      // console.log(`needViewReverseBottom: ${needViewReverseBottom}`);
      // console.log(`needPopupReverseBottom: ${needPopupReverseBottom}`);

      // console.log(`isViewXOverLimit: ${isViewXOverLimit}`);
      // console.log(`isPopupXOverLimit: ${isPopupXOverLimit}`);
      console.log(`needPopupReverseLeft: ${needPopupReverseLeft}`);
      const shouldReverseTop = isNeedReverse(
        isViewYOverLimit,
        isPopupYOverLimit,
        needViewReverseTop,
        needPopupReverseTop,
      );
      const shouldReverseBottom = isNeedReverse(
        isViewYOverLimit,
        isPopupYOverLimit,
        needViewReverseBottom,
        needPopupReverseBottom,
      );
      const shouldReverseLeft = isNeedReverse(
        isViewXOverLimit,
        isPopupXOverLimit,
        needViewReverseLeft,
        needPopupReverseLeft,
      );
      const shouldReverseRight = isNeedReverse(
        isViewXOverLimit,
        isPopupXOverLimit,
        needViewReverseRight,
        needPopupReverseRight,
      );

      // 判断leftTop leftBottom rightTop rightBottom topLeft topBottom bottomLeft bottomRight 这种不是居中的是否需要调整位置
      const shouldChangeRightToLeft = isNeedReverse(
        isViewXOverLimitWithTriggerWidth,
        isPopupXOverLimitWithTriggerWidth,
        changeViewRightToLeft,
        changePopupRightToLeft,
      );
      const shouldChangeLeftToRight = isNeedReverse(
        isViewXOverLimitWithTriggerWidth,
        isPopupXOverLimitWithTriggerWidth,
        changeViewLeftToRight,
        changePopupLeftToRight,
      );
      const shouldChangeTopToBottom = isNeedReverse(
        isViewYOverLimitWithTriggerHeight,
        isPopupYOverLimitWithTriggerHeight,
        changeViewTopToBottom,
        changePopupTopToBottom,
      );
      const shouldChangeBottomToTop = isNeedReverse(
        isViewYOverLimitWithTriggerHeight,
        isPopupYOverLimitWithTriggerHeight,
        changeViewBottomToTop,
        changePopupBottomToTop,
      );

      const isWidthGreater = tooltipRect.width > triggerRect.width;
      const isHeightGreater = tooltipRect.height > triggerRect.height;

      const isXOverLimitSideHalf = isViewXOverLimitWithSideHalf && isPopupXOverLimitWithSideHalf;
      const isYOverLimitSideHalf = isViewYOverLimitWithSideHalf && isPopupYOverLimitWithSideHalf;

      const isXOverLimit = isViewXOverLimit && isPopupXOverLimit;
      const isYOverLimit = isViewYOverLimit && isPopupYOverLimit;

      switch (placement) {
        case 'top': {
          if (shouldReverseTop) {
            position = 'bottom';
            if (isXOverLimitSideHalf && (shouldChangeRightToLeft || shouldChangeLeftToRight)) {
              position += shouldChangeRightToLeft ? 'Left' : 'Right';
            }
          }
          break;
        }
        case 'bottom': {
          console.log(`shouldReverseBottom: ${shouldReverseBottom}`);
          if (shouldReverseBottom) {
            position = 'top';
            if (isXOverLimitSideHalf && (shouldChangeRightToLeft || shouldChangeLeftToRight)) {
              position += shouldChangeRightToLeft ? 'Left' : 'Right';
            }
          }
          break;
        }
        case 'left': {
          if (shouldReverseLeft) {
            position = 'right';
            if (isYOverLimitSideHalf && (shouldChangeTopToBottom || shouldChangeBottomToTop)) {
              position += shouldChangeTopToBottom ? 'bottom' : 'top';
            }
          }
          break;
        }
        case 'right': {
          if (shouldReverseRight) {
            position = 'left';
            if (isYOverLimitSideHalf && (shouldChangeTopToBottom || shouldChangeBottomToTop)) {
              position += shouldChangeTopToBottom ? 'bottom' : 'top';
            }
          }
          break;
        }
        case 'topLeft': {
          // console.log(`shouldReverseTop: ${shouldReverseTop}`);
          if (shouldReverseTop) {
            position = reversePosition(position);
            // position = 'bottomLeft';
          }
          // shouldReverseLeftSide 从左转到右
          if (shouldChangeLeftToRight && isWidthGreater) {
            position = reversePosition(position);
            // position = 'bottomRight';
          }

          if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'topRight': {
          if (shouldReverseTop) {
            position = reversePosition(position);
          }
          if (shouldChangeRightToLeft && isWidthGreater) {
            position = reversePosition(position);
          }
          if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'bottomLeft': {
          if (shouldReverseBottom) {
            position = reversePosition(position);
          }
          if (shouldChangeLeftToRight && isWidthGreater) {
            position = reversePosition(position);
          }
          if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'bottomRight': {
          if (shouldReverseBottom) {
            position = reversePosition(position);
          }
          if (shouldChangeRightToLeft && isWidthGreater) {
            position = reversePosition(position);
          }
          if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'leftTop': {
          if (shouldReverseLeft) {
            position = reversePosition(position);
          }
          if (shouldChangeTopToBottom && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'leftBottom': {
          if (shouldReverseLeft) {
            position = reversePosition(position);
          }
          if (shouldChangeBottomToTop && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'rightTop': {
          if (shouldReverseRight) {
            position = reversePosition(position);
          }
          if (shouldChangeTopToBottom && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'rightBottom': {
          if (shouldReverseRight) {
            position = reversePosition(position);
          }
          if (shouldChangeBottomToTop && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
            position = removeLastPosition(position);
          }
          break;
        }
      }

      // const isTopPlacement = placement === 'top' || placement === 'topLeft' || placement === 'topRight';
      // const isBottomPlacement = placement === 'bottom' || placement === 'bottomLeft' || placement === 'bottomRight';

      return position;
    }
    return placement;
  }, [
    autoAdjustPlacement,
    placement,
    popupContainer,
    isOverLimit,
    isHalfAllEnough,
    isNeedReverse,
    reversePosition,
    removeLastPosition,
  ]);

  const getPlacement1 = useCallback(() => {
    if (!autoAdjustPlacement) return placement;

    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;

    if (triggerEl && tooltipEl && popupContainer) {
      let position = placement;
      const { innerWidth, innerHeight } = window;
      const triggerRect = triggerEl.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const popupRect = popupContainer.getBoundingClientRect();

      // document.documentElement.scrollTop+document.body.scrollTop

      const isBody =
        popupContainer === document.body || popupContainer === document.documentElement;

      const restLeft = innerWidth - triggerRect.left;
      const restTop = innerHeight - triggerRect.top;
      const restRight = innerWidth - triggerRect.right;
      const restBottom = innerHeight - triggerRect.bottom;

      // 基于视口判断是否需要调整
      const needViewReverseTop =
        triggerRect.top < tooltipRect.height && restBottom > tooltipRect.height;

      const needViewReverseBottom =
        restBottom < tooltipRect.height && triggerRect.top > tooltipRect.height;

      const needViewReverseLeft =
        triggerRect.left < tooltipRect.width && restRight > tooltipRect.width;

      const needViewReverseRight =
        restRight < tooltipRect.width && triggerRect.left > tooltipRect.width;

      // 纵向显示弹出层时候 topRight -> topLeft bottomRight -> bottomLeft
      const changeViewRightToLeft =
        triggerRect.right > tooltipRect.width && restLeft < tooltipRect.width;

      // 纵向显示弹出层时候 topLeft -> topRight bottomLeft -> bottomRight
      const changeViewLeftToRight =
        triggerRect.right < tooltipRect.width && restLeft > tooltipRect.width;

      // 横向显示弹出层时候 leftTop -> leftBottom  rightTop -> rightBottom
      const changeViewTopToBottom =
        restTop > tooltipRect.height && triggerRect.top < tooltipRect.height;

      // 横向显示弹出层时候 leftBottom -> leftTop  rightBottom -> rightTop
      const changeViewBottomToTop =
        restTop < tooltipRect.height && triggerRect.top > tooltipRect.height;

      // 基于容器判断是否需要调整
      // const offsetTop = triggerRect.top - popupRect.top;
      // const offsetLeft = triggerRect.left - popupRect.left;
      // const offsetBottom = popupRect.bottom - triggerRect.bottom;
      // const offsetRight = popupRect.right - triggerRect.right;
      //
      // const restBottomInPopup = offsetTop + triggerRect.height;
      // const restRightInPopup = offsetLeft + triggerRect.width;
      // const restLeftInPopup = offsetRight + triggerRect.width;
      // const restTopInPopup = offsetBottom + triggerRect.height;

      // 容器中原空间不足,反向空间充足可以反转
      // const needPopupReverseTop = offsetTop < triggerRect.height && offsetBottom > triggerRect.height;
      //
      // const needPopupReverseBottom = offsetTop > triggerRect.height && offsetBottom < triggerRect.height;
      //
      // const needPopupReverseLeft = offsetLeft < triggerRect.width && offsetRight > triggerRect.width;
      //
      // const needPopupReverseRight = offsetLeft > triggerRect.width && offsetRight < triggerRect.width;

      // // 纵向显示弹出层时候 topRight -> topLeft bottomRight -> bottomLeft
      // const changePopupRightToLeft = restRightInPopup > tooltipRect.width && restLeftInPopup < tooltipRect.width;
      //
      // // 纵向显示弹出层时候 topLeft -> topRight bottomLeft -> bottomRight
      // const changePopupLeftToRight = restRightInPopup < tooltipRect.width && restLeftInPopup > tooltipRect.width;
      //
      // // 横向显示弹出层时候 leftTop -> leftBottom  rightTop -> rightBottom
      // const changePopupTopToBottom = restBottomInPopup < tooltipRect.height && restTopInPopup > tooltipRect.height;
      //
      // // 横向显示弹出层时候 leftBottom -> leftTop  rightBottom -> rightTop
      // const changePopupBottomToTop = restBottomInPopup > tooltipRect.height && restTopInPopup < tooltipRect.height;

      const halfWidth = triggerRect.width / 2;
      const halfHeight = triggerRect.height / 2;

      // 判断视口中原空间是否不足以显示弹层
      const isViewYBottomOverLimit = restBottom < tooltipRect.height;

      const isViewYTopOverLimit = triggerRect.top < tooltipRect.height;

      const isViewXLeftOverLimit = triggerRect.left < tooltipRect.width;

      const isViewXRightOverLimit = restRight < tooltipRect.width;

      const isViewXLeftOverLimitWithTriggerWidth = triggerRect.right < tooltipRect.width;

      const isViewXRightOverLimitWithTriggerWidth = restLeft < tooltipRect.width;

      const isViewYTopOverLimitWithTriggerHeight = triggerRect.bottom < tooltipRect.width;

      const isViewYBottomOverLimitWithTriggerHeight = restTop < tooltipRect.width;

      // 视口中原空间以及反向空间是否都不足以显示弹层
      const isViewYOverLimit = isOverLimit(triggerRect.top, restBottom, tooltipRect.height);

      const isViewXOverLimit = isOverLimit(triggerRect.left, restRight, tooltipRect.width);

      const isViewYOverLimitWithTriggerHeight = isOverLimit(
        triggerRect.bottom,
        restTop,
        tooltipRect.height,
      );

      const isViewXOverLimitWithTriggerWidth = isOverLimit(
        triggerRect.right,
        restLeft,
        tooltipRect.width,
      );

      // 如果placement: 'top' | 'bottom' | 'left' | 'right' 假如是top 判断是否需要转换成topLeft topRight
      // 箭头居中但是会超出视图
      const isViewYOverLimitWithSideHalf = isOverLimit(
        triggerRect.bottom - halfHeight,
        restTop - halfHeight,
        tooltipRect.height / 2,
      );

      const isViewXOverLimitWithSideHalf = isOverLimit(
        triggerRect.right - halfWidth,
        restLeft - halfWidth,
        tooltipRect.width / 2,
      );

      // 判断正负半边两侧空间是否都能容纳
      const isViewYEnoughWithHalfSide = isHalfAllEnough(
        triggerRect.bottom - halfHeight,
        restTop - halfHeight,
        tooltipRect.height / 2,
      );

      const isViewXEnoughWithHalfSide = isHalfAllEnough(
        triggerRect.right - halfWidth,
        restLeft - halfWidth,
        tooltipRect.width / 2,
      );

      // 判断容器中原空间以及反向空间是否都不足
      // const isPopupYOverLimit = isOverLimit(offsetTop, offsetBottom, tooltipRect.height);
      //
      // const isPopupXOverLimit = isOverLimit(offsetLeft, offsetRight, tooltipRect.width);
      //
      // const isPopupYOverLimitWithTriggerHeight = isOverLimit(restBottomInPopup, restTopInPopup, tooltipRect.height);
      //
      // const isPopupXOverLimitWithTriggerWidth = isOverLimit(restRightInPopup, restLeftInPopup, tooltipRect.width);
      //
      // const isPopupYOverLimitWithSideHalf = isOverLimit(restBottomInPopup - halfHeight, restTopInPopup - halfHeight, tooltipRect.height / 2);
      //
      // const isPopupXOverLimitWithSideHalf = isOverLimit(restRightInPopup - halfWidth, restLeftInPopup - halfWidth, tooltipRect.width / 2);
      //
      // const isPopupYEnoughWithHalfSide = isHalfAllEnough(restBottomInPopup - halfHeight, restTopInPopup - halfHeight, tooltipRect.height / 2);
      //
      // const isPopupXEnoughWithHalfSide = isHalfAllEnough(restRightInPopup - halfWidth, restLeftInPopup - halfWidth, tooltipRect.width / 2);

      // 判断是否满足视口和容器都放不下才能调整弹出位置
      // 调整位置的前提是弹出容器的大小超出能能容纳它的容器大小，只有满足了条件才会调整位置
      // console.log(`isViewYOverLimit: ${isViewYOverLimit}`);
      // console.log(`isPopupYOverLimit: ${isPopupYOverLimit}`);
      // console.log(`needViewReverseBottom: ${needViewReverseBottom}`);
      // console.log(`needPopupReverseBottom: ${needPopupReverseBottom}`);
      // const shouldReverseTop = isNeedReverse(isViewYOverLimit, isPopupYOverLimit, needViewReverseTop, needPopupReverseTop);
      // const shouldReverseBottom = isNeedReverse(isViewYOverLimit, isPopupYOverLimit, needViewReverseBottom, needPopupReverseBottom);
      // const shouldReverseLeft = isNeedReverse(isViewXOverLimit, isPopupXOverLimit, needViewReverseLeft, needPopupReverseLeft);
      // const shouldReverseRight = isNeedReverse(isViewXOverLimit, isPopupXOverLimit, needViewReverseRight, needPopupReverseRight);

      const shouldReverseTop = isNeedReverse(isViewYTopOverLimit, needViewReverseTop);
      const shouldReverseBottom = isNeedReverse(isViewYBottomOverLimit, needViewReverseBottom);
      const shouldReverseLeft = isNeedReverse(isViewXLeftOverLimit, needViewReverseLeft);
      const shouldReverseRight = isNeedReverse(isViewXRightOverLimit, needViewReverseRight);

      // 判断leftTop leftBottom rightTop rightBottom topLeft topBottom bottomLeft bottomRight 这种不是居中的是否需要调整位置
      // const shouldChangeRightToLeft = isNeedReverse(isViewXOverLimitWithTriggerWidth, isPopupXOverLimitWithTriggerWidth, changeViewRightToLeft, changePopupRightToLeft);
      // const shouldChangeLeftToRight = isNeedReverse(isViewXOverLimitWithTriggerWidth, isPopupXOverLimitWithTriggerWidth, changeViewLeftToRight, changePopupLeftToRight);
      // const shouldChangeTopToBottom = isNeedReverse(isViewYOverLimitWithTriggerHeight, isPopupYOverLimitWithTriggerHeight, changeViewTopToBottom, changePopupTopToBottom);
      // const shouldChangeBottomToTop = isNeedReverse(isViewYOverLimitWithTriggerHeight, isPopupYOverLimitWithTriggerHeight, changeViewBottomToTop, changePopupBottomToTop);

      const shouldChangeRightToLeft = isNeedReverse(
        isViewXLeftOverLimitWithTriggerWidth,
        changeViewRightToLeft,
      );
      const shouldChangeLeftToRight = isNeedReverse(
        isViewXRightOverLimitWithTriggerWidth,
        changeViewLeftToRight,
      );
      const shouldChangeTopToBottom = isNeedReverse(
        isViewYBottomOverLimitWithTriggerHeight,
        changeViewTopToBottom,
      );
      const shouldChangeBottomToTop = isNeedReverse(
        isViewYTopOverLimitWithTriggerHeight,
        changeViewBottomToTop,
      );

      const isWidthGreater = tooltipRect.width > triggerRect.width;
      const isHeightGreater = tooltipRect.height > triggerRect.height;

      // const isXOverLimitSideHalf = isViewXOverLimitWithSideHalf && isPopupXOverLimitWithSideHalf;
      // const isYOverLimitSideHalf = isViewYOverLimitWithSideHalf && isPopupYOverLimitWithSideHalf;

      const isXOverLimitSideHalf = isViewXOverLimitWithSideHalf;
      const isYOverLimitSideHalf = isViewYOverLimitWithSideHalf;

      // const isXOverLimit = isViewXOverLimit && isPopupXOverLimit;
      // const isYOverLimit = isViewYOverLimit && isPopupYOverLimit;

      const isXOverLimit = isViewXOverLimit;
      const isYOverLimit = isViewYOverLimit;

      switch (placement) {
        case 'top': {
          if (shouldReverseTop) {
            position = 'bottom';
            if (isXOverLimitSideHalf && (shouldChangeRightToLeft || shouldChangeLeftToRight)) {
              position += shouldChangeRightToLeft ? 'Left' : 'Right';
            }
          }
          break;
        }
        case 'bottom': {
          if (shouldReverseBottom) {
            position = 'top';
            if (isXOverLimitSideHalf && (shouldChangeRightToLeft || shouldChangeLeftToRight)) {
              position += shouldChangeRightToLeft ? 'Left' : 'Right';
            }
          }
          break;
        }
        case 'left': {
          if (shouldReverseLeft) {
            position = 'right';
            if (isYOverLimitSideHalf && (shouldChangeTopToBottom || shouldChangeBottomToTop)) {
              position += shouldChangeTopToBottom ? 'bottom' : 'top';
            }
          }
          break;
        }
        case 'right': {
          if (shouldReverseRight) {
            position = 'left';
            if (isYOverLimitSideHalf && (shouldChangeTopToBottom || shouldChangeBottomToTop)) {
              position += shouldChangeTopToBottom ? 'bottom' : 'top';
            }
          }
          break;
        }
        case 'topLeft': {
          if (shouldReverseTop) {
            position = reversePosition(position);
            // position = 'bottomLeft';
          }
          // shouldReverseLeftSide 从左转到右
          if (shouldChangeLeftToRight && isWidthGreater) {
            position = reversePosition(position);
            // position = 'bottomRight';
          }

          // if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }

          if (isXOverLimit && isViewXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }

          break;
        }
        case 'topRight': {
          if (shouldReverseTop) {
            position = reversePosition(position);
          }
          if (shouldChangeRightToLeft && isWidthGreater) {
            position = reversePosition(position);
          }
          // if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }

          if (isXOverLimit && isViewXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }

          break;
        }
        case 'bottomLeft': {
          if (shouldReverseBottom) {
            position = reversePosition(position);
          }
          if (shouldChangeLeftToRight && isWidthGreater) {
            position = reversePosition(position);
          }
          // if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }
          if (isXOverLimit && isViewXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'bottomRight': {
          if (shouldReverseBottom) {
            position = reversePosition(position);
          }
          if (shouldChangeRightToLeft && isWidthGreater) {
            position = reversePosition(position);
          }
          // if (isXOverLimit && (isViewXEnoughWithHalfSide || isPopupXEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }
          if (isXOverLimit && isViewXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'leftTop': {
          if (shouldReverseLeft) {
            position = reversePosition(position);
          }
          if (shouldChangeTopToBottom && isHeightGreater) {
            position = reversePosition(position);
          }
          // if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }
          if (isYOverLimit && isViewYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'leftBottom': {
          if (shouldReverseLeft) {
            position = reversePosition(position);
          }
          if (shouldChangeBottomToTop && isHeightGreater) {
            position = reversePosition(position);
          }
          // if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }
          if (isYOverLimit && isViewYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'rightTop': {
          if (shouldReverseRight) {
            position = reversePosition(position);
          }
          if (shouldChangeTopToBottom && isHeightGreater) {
            position = reversePosition(position);
          }
          // if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }
          if (isYOverLimit && isViewYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'rightBottom': {
          if (shouldReverseRight) {
            position = reversePosition(position);
          }
          if (shouldChangeBottomToTop && isHeightGreater) {
            position = reversePosition(position);
          }
          // if (isYOverLimit && (isViewYEnoughWithHalfSide || isPopupYEnoughWithHalfSide)) {
          //   position = removeLastPosition(position);
          // }
          if (isYOverLimit && isViewYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
      }

      // const isTopPlacement = placement === 'top' || placement === 'topLeft' || placement === 'topRight';
      // const isBottomPlacement = placement === 'bottom' || placement === 'bottomLeft' || placement === 'bottomRight';

      return position;
    }
    return placement;
  }, [
    autoAdjustPlacement,
    placement,
    isOverLimit,
    isHalfAllEnough,
    isNeedReverse,
    reversePosition,
    removeLastPosition,
    popupContainer,
  ]);

  const getPosition = useCallback(
    (finalPlace: TooltipPlacement) => {
      const el = triggerRef.current;
      if (popupContainer && el) {
        const elRect = el.getBoundingClientRect();
        const popupContainerRect = popupContainer.getBoundingClientRect();

        switch (finalPlace) {
          case 'top':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width / 2,
              top: elRect.top - popupContainerRect.top,
            };
          case 'left':
            return {
              left: elRect.left - popupContainerRect.left,
              top: elRect.top - popupContainerRect.top + elRect.height / 2,
            };
          case 'right':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width,
              top: elRect.top - popupContainerRect.top + elRect.height / 2,
            };
          case 'bottom':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width / 2,
              top: elRect.top - popupContainerRect.top + elRect.height,
            };
          case 'topLeft':
            return {
              left: elRect.left - popupContainerRect.left,
              top: elRect.top - popupContainerRect.top,
            };
          case 'topRight':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width,
              top: elRect.top - popupContainerRect.top,
            };
          case 'bottomLeft':
            return {
              left: elRect.left - popupContainerRect.left,
              top: elRect.top - popupContainerRect.top + elRect.height,
            };
          case 'bottomRight':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width,
              top: elRect.top - popupContainerRect.top + elRect.height,
            };
          case 'leftTop':
            return {
              left: elRect.left - popupContainerRect.left,
              top: elRect.top - popupContainerRect.top,
            };
          case 'leftBottom':
            return {
              left: elRect.left - popupContainerRect.left,
              top: elRect.top - popupContainerRect.top + elRect.height,
            };
          case 'rightTop':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width,
              top: elRect.top - popupContainerRect.top,
            };
          case 'rightBottom':
            return {
              left: elRect.left - popupContainerRect.left + elRect.width,
              top: elRect.top - popupContainerRect.top + elRect.height,
            };
          default: {
            return {
              left: -9999,
              top: -9999,
            };
          }
        }
      }
      return { left: -9999, top: -9999 };
    },
    [popupContainer],
  );

  const handleHide = () => {
    if (isEnter.current || !mountedRef.current) return;
    if (timer.current) {
      clearTimeout(timer.current);
      if (!('visible' in props)) {
        setShowPopper(false);
      }
      setTooltipMounted(false);
      onVisibleChange && onVisibleChange(false);
      if (isManual) {
        document.removeEventListener('click', debounceHide);
      }
    }
  };

  const debounceHide = debounce(handleHide, 100);

  const handleShow = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!('visible' in props)) {
        setShowPopper(true);
      }
      onVisibleChange && onVisibleChange(true);
    }, delay);
  };

  const handleMouseEnter = () => {
    if (isManual) return;
    isEnter.current = true;
    handleShow();
  };

  const handleMouseLeave = () => {
    if (isManual) return;
    isEnter.current = false;
    debounceHide();
  };

  const handleClick = (e: any) => {
    if (!isManual) return;
    handleShow();
    document.addEventListener('click', debounceHide);
    e.stopPropagation();
  };

  // todo body 绑定滚动
  const handleScroll = useCallback(
    (e: any) => {
      if (triggerRef.current) {
        // console.log(e.target);
        const isContain = e.target.contains(triggerRef.current);
        // console.log(`isContain: ${isContain}`);
        // console.log(`isContain: ${getParent(triggerRef.current, e.target)}`);
        if (isContain) {
          // console.log(`scrollTop: ${e.target.scrollTop}`);
          const finalPlace = getPlacement() as TooltipPlacement;
          // console.log(`finalPlace: ${finalPlace}`);
          const position = getPosition(finalPlace);
          if (!(pos.left === position.left && pos.top === position.top)) {
            // console.log('hhah');
            setPos(position);
            setFinalPlacement(finalPlace);
          }
        }
      }
    },
    [getPlacement, getPosition],
  );

  const handleResize = useCallback(() => {
    // console.log('进来')
    // console.log(`showPopper: ${showPopper}`)
    // console.log(`tooltipMounted: ${tooltipMounted}`)
    if (showPopper && tooltipMounted) {
      const finalPlace = getPlacement() as TooltipPlacement;
      const position = getPosition(finalPlace);
      if (!(pos.left === position.left && pos.top === position.top)) {
        setPos(position);
        setFinalPlacement(finalPlace);
      }
    }
  }, [showPopper, tooltipMounted, getPosition, getPlacement, pos]);

  const debounceResize = debounce(handleResize, 100);

  const debounceScroll = debounce(handleScroll, 10);

  useEffect(() => {
    if ('visible' in props) {
      setShowPopper(!!visible);
    }
  }, [visible]);

  useEffect(() => {
    if (showPopper && tooltipRef.current) {
      setTooltipMounted(true);
    }
  }, [showPopper]);

  useEffect(() => {
    debounceResize();
  }, [debounceResize]);

  useEffect(() => {
    window.addEventListener('resize', debounceResize);
    return () => {
      window.removeEventListener('resize', debounceResize);
    };
  }, [debounceResize]);

  useEffect(() => {
    window.addEventListener('scroll', debounceScroll, true);
    return () => {
      window.removeEventListener('scroll', debounceScroll);
    };
  }, [debounceScroll]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      document.removeEventListener('click', debounceHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderToolTip = () => {
    // const position = getPosition();
    const popperContainer = (
      <div className="tooltip-popper-placeholder">
        <div
          ref={tooltipRef}
          className={classnames({
            'tooltip-popper': true,
            'tooltip-popper-show': showPopper,
            [`tooltip-popper-${theme}`]: !!theme,
            [`tooltip-popper-placement-${finalPlacement}`]: !!finalPlacement,
            [className]: !!className,
          })}
          style={{
            ...style,
            // left: tooltipMounted ? position.left : -9999,
            // top: tooltipMounted ? position.top : -9999
            left: pos.left,
            top: pos.top,
          }}
          onMouseEnter={() => {
            if (!isManual) {
              isEnter.current = true;
            }
          }}
          onMouseLeave={() => {
            if (!isManual) {
              isEnter.current = false;
              debounceHide();
            }
          }}
        >
          <div className="tooltip-popper-content">
            <div className="tooltip-popper-arrow" />
            <div className="tooltip-popper-inner">{typeof tip === 'function' ? tip() : tip}</div>
          </div>
        </div>
      </div>
    );
    return popupContainer ? createPortal(popperContainer, popupContainer) : null;
  };

  const newProps: any = { ref: triggerRef };
  newProps.onMouseEnter = handleMouseEnter;
  newProps.onMouseLeave = handleMouseLeave;
  newProps.onClick = handleClick;

  return (
    <>
      {cloneElement(children, newProps)}
      {/*<div*/}
      {/*  onMouseEnter={handleMouseEnter}*/}
      {/*  onMouseLeave={handleMouseLeave}*/}
      {/*  onClick={handleClick}*/}
      {/*  ref={containerRef}*/}
      {/*  className='tooltip-rel'*/}
      {/*>*/}
      {/*  {children}*/}
      {/*</div>*/}
      {showPopper ? renderToolTip() : null}
    </>
  );
};
export default Tooltip;
