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
import { debounce, throttle } from 'lodash';
import './index.less';

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
  placement?: TooltipPlacement;
  /** 子元素 */
  children: React.ReactNode;
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

  const [finalPlacement, setFinalPlacement] = useState<TooltipPlacement>(placement);

  const [pos, setPos] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 });

  if (!isValidElement(children)) {
    console.error(new Error('Tooltip expect a valid ReactElement as children.'));
    return null;
  }

  const popupContainer = getPopupContainer();

  const isManual = trigger === 'click';

  const reversePosition = useCallback((position: string, isHorizontal = false) => {
    if (isHorizontal) {
      if (/left/i.test(position)) {
        return position.replace('left', 'right').replace('Left', 'Right') as TooltipPlacement;
      }
      if (/right/i.test(position)) {
        return position.replace('right', 'left').replace('Right', 'Left') as TooltipPlacement;
      }
    } else if (/top/i.test(position)) {
      return position.replace('top', 'bottom').replace('Top', 'Bottom') as TooltipPlacement;
    } else if (/bottom/i.test(position)) {
      return position.replace('bottom', 'top').replace('Bottom', 'Top') as TooltipPlacement;
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

  // 需要翻转的前提是已经超出了原空间同时反向空间足够
  const isNeedReverse = useCallback((viewOverLimit: boolean, needReverseView: boolean) => {
    return viewOverLimit && needReverseView;
  }, []);

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

      // 基于挂载容器判断是否需要调整
      const offsetTop = triggerRect.top - (isBody ? 0 : popupRect.top);
      const offsetLeft = triggerRect.left - (isBody ? 0 : popupRect.left);
      const offsetBottom = (isBody ? innerHeight : popupRect.bottom) - triggerRect.bottom;
      const offsetRight = (isBody ? innerWidth : popupRect.right) - triggerRect.right;

      const restBottomInPopup = offsetTop + triggerRect.height;
      const restRightInPopup = offsetLeft + triggerRect.width;
      const restLeftInPopup = offsetRight + triggerRect.width;
      const restTopInPopup = offsetBottom + triggerRect.height;

      // 挂载容器中原空间不足,反向空间充足可以反转
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
        restRightInPopup < tooltipRect.width && restLeftInPopup > tooltipRect.width;

      // 纵向显示弹出层时候 topLeft -> topRight bottomLeft -> bottomRight
      const changePopupLeftToRight =
        restRightInPopup > tooltipRect.width && restLeftInPopup < tooltipRect.width;

      // 横向显示弹出层时候 leftTop -> leftBottom  rightTop -> rightBottom
      const changePopupTopToBottom =
        restBottomInPopup > tooltipRect.height && restTopInPopup < tooltipRect.height;

      // 横向显示弹出层时候 leftBottom -> leftTop  rightBottom -> rightTop
      const changePopupBottomToTop =
        restBottomInPopup < tooltipRect.height && restTopInPopup > tooltipRect.height;

      const halfWidth = triggerRect.width / 2;
      const halfHeight = triggerRect.height / 2;

      // 判断挂载容器中提示框的大小是否超出原空间
      const isPopupYTopOverLimit = offsetTop < tooltipRect.height;
      const isPopupYBottomOverLimit = offsetBottom < tooltipRect.height;
      const isPopupXLeftOverLimit = offsetLeft < tooltipRect.width;
      const isPopupXRightOverLimit = offsetRight < tooltipRect.width;

      const isPopupXLeftOverLimitWithTriggerWidth = restRightInPopup < tooltipRect.width;
      const isPopupXRightOverLimitWithTriggerWidth = restLeftInPopup < tooltipRect.width;
      const isPopupYTopOverLimitWithTriggerHeight = restBottomInPopup < tooltipRect.height;
      const isPopupYBottomOverLimitWithTriggerHeight = restTopInPopup < tooltipRect.height;

      const isPopupXOverLimitWithSideHalf = isOverLimit(
        restRightInPopup - halfWidth,
        restLeftInPopup - halfWidth,
        tooltipRect.width / 2,
      );
      const isPopupYOverLimitWithSideHalf = isOverLimit(
        restBottomInPopup - halfHeight,
        restTopInPopup - halfHeight,
        tooltipRect.height / 2,
      );

      const isPopupYOverLimit = isOverLimit(offsetTop, offsetBottom, tooltipRect.height);

      const isPopupXOverLimit = isOverLimit(offsetLeft, offsetRight, tooltipRect.width);

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

      const shouldReverseTop = isNeedReverse(isPopupYTopOverLimit, needPopupReverseTop);
      const shouldReverseBottom = isNeedReverse(isPopupYBottomOverLimit, needPopupReverseBottom);
      const shouldReverseLeft = isNeedReverse(isPopupXLeftOverLimit, needPopupReverseLeft);
      const shouldReverseRight = isNeedReverse(isPopupXRightOverLimit, needPopupReverseRight);

      const shouldChangeRightToLeft = isNeedReverse(
        isPopupXLeftOverLimitWithTriggerWidth,
        changePopupRightToLeft,
      );

      const shouldChangeLeftToRight = isNeedReverse(
        isPopupXRightOverLimitWithTriggerWidth,
        changePopupLeftToRight,
      );

      const shouldChangeTopToBottom = isNeedReverse(
        isPopupYBottomOverLimitWithTriggerHeight,
        changePopupTopToBottom,
      );

      const shouldChangeBottomToTop = isNeedReverse(
        isPopupYTopOverLimitWithTriggerHeight,
        changePopupBottomToTop,
      );

      const isWidthGreater = tooltipRect.width > triggerRect.width;
      const isHeightGreater = tooltipRect.height > triggerRect.height;

      switch (placement) {
        case 'top': {
          if (shouldReverseTop) {
            position = 'bottom';
            if (
              isPopupXOverLimitWithSideHalf &&
              (shouldChangeRightToLeft || shouldChangeLeftToRight)
            ) {
              position += shouldChangeRightToLeft ? 'Left' : 'Right';
            }
          }
          break;
        }
        case 'bottom': {
          if (shouldReverseBottom) {
            position = 'top';
            if (
              isPopupXOverLimitWithSideHalf &&
              (shouldChangeRightToLeft || shouldChangeLeftToRight)
            ) {
              position += shouldChangeRightToLeft ? 'Left' : 'Right';
            }
          }
          break;
        }
        case 'left': {
          if (shouldReverseLeft) {
            position = 'right';
            if (
              isPopupYOverLimitWithSideHalf &&
              (shouldChangeTopToBottom || shouldChangeBottomToTop)
            ) {
              position += shouldChangeTopToBottom ? 'bottom' : 'top';
            }
          }
          break;
        }
        case 'right': {
          if (shouldReverseRight) {
            position = 'left';
            if (
              isPopupYOverLimitWithSideHalf &&
              (shouldChangeTopToBottom || shouldChangeBottomToTop)
            ) {
              position += shouldChangeTopToBottom ? 'bottom' : 'top';
            }
          }
          break;
        }
        case 'topLeft': {
          if (shouldReverseTop) {
            position = reversePosition(position);
          }
          if (shouldChangeLeftToRight && isWidthGreater) {
            position = reversePosition(position, true);
          }
          if (isPopupXOverLimit && isPopupXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'topRight': {
          if (shouldReverseTop) {
            position = reversePosition(position);
          }
          if (shouldChangeRightToLeft && isWidthGreater) {
            position = reversePosition(position, true);
          }
          if (isPopupXOverLimit && isPopupXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }

          break;
        }
        case 'bottomLeft': {
          if (shouldReverseBottom) {
            position = reversePosition(position);
          }
          if (shouldChangeLeftToRight && isWidthGreater) {
            position = reversePosition(position, true);
          }
          if (isPopupXOverLimit && isPopupXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'bottomRight': {
          if (shouldReverseBottom) {
            position = reversePosition(position);
          }
          if (shouldChangeRightToLeft && isWidthGreater) {
            position = reversePosition(position, true);
          }
          if (isPopupXOverLimit && isPopupXEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'leftTop': {
          if (shouldReverseLeft) {
            position = reversePosition(position, true);
          }
          if (shouldChangeTopToBottom && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isPopupYOverLimit && isPopupYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'leftBottom': {
          if (shouldReverseLeft) {
            position = reversePosition(position, true);
          }
          if (shouldChangeBottomToTop && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isPopupYOverLimit && isPopupYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'rightTop': {
          if (shouldReverseRight) {
            position = reversePosition(position, true);
          }

          if (shouldChangeTopToBottom && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isPopupYOverLimit && isPopupYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
        case 'rightBottom': {
          if (shouldReverseRight) {
            position = reversePosition(position, true);
          }
          if (shouldChangeBottomToTop && isHeightGreater) {
            position = reversePosition(position);
          }
          if (isPopupYOverLimit && isPopupYEnoughWithHalfSide) {
            position = removeLastPosition(position);
          }
          break;
        }
      }
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

  const calcPosition = useCallback(() => {
    const finalPlace = getPlacement() as TooltipPlacement;
    const position = getPosition(finalPlace);
    if (!(pos.left === position.left && pos.top === position.top)) {
      setPos(position);
      setFinalPlacement(finalPlace);
    }
  }, [getPlacement, getPosition, pos]);

  const handleScroll = useCallback(
    (e: any) => {
      if (triggerRef.current) {
        const isContain = e.target.contains(triggerRef.current);
        if (isContain) calcPosition();
      }
    },
    [calcPosition],
  );

  const handleResize = useCallback(() => {
    calcPosition();
  }, [calcPosition]);

  const handleHide = () => {
    if (isEnter.current || !mountedRef.current) return;
    if (timer.current) clearTimeout(timer.current);
    if (!('visible' in props)) {
      setShowPopper(false);
    }
    onVisibleChange && onVisibleChange(false);
    if (isManual) {
      document.removeEventListener('click', debounceHide);
    }
  };

  const debounceScroll = throttle(handleScroll, 100);
  const debounceResize = debounce(handleResize, 50);
  const debounceHide = debounce(handleHide, 100);

  const handleShow = () => {
    if (timer.current) clearTimeout(timer.current);
    if (delay) {
      timer.current = setTimeout(() => {
        if (!('visible' in props)) {
          setShowPopper(true);
        }
        onVisibleChange && onVisibleChange(true);
      }, delay);
    } else {
      if (!('visible' in props)) {
        setShowPopper(true);
      }
      onVisibleChange && onVisibleChange(true);
    }
    window.addEventListener('scroll', debounceScroll, true);
    window.addEventListener('resize', debounceResize);
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

  useEffect(() => {
    if ('visible' in props) {
      setShowPopper(!!visible);
    }
  }, [visible]);

  useEffect(() => {
    if (showPopper && tooltipRef.current) {
      calcPosition();
    }
  }, [showPopper, calcPosition]);

  useEffect(() => {
    return () => {
      window.removeEventListener('scroll', debounceScroll);
    };
  }, [debounceScroll]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      document.removeEventListener('click', debounceHide);
      window.removeEventListener('resize', debounceResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderToolTip = () => {
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
      {showPopper ? renderToolTip() : null}
    </>
  );
};
export default Tooltip;
