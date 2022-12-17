import { openVisibleCompatible } from '@ant-design/pro-utils';
import { Drawer } from 'antd';
import classNames from 'classnames';
import Omit from 'omit.js';
import React, { useState } from 'react';
import type { RightPrivateSiderMenuProps, RightSiderMenuProps } from './RightSiderMenu';
import { RightSiderMenu } from './RightSiderMenu';
import { rightUseStyle } from './style/index';
import { FileTextOutlined, CloseOutlined } from '@ant-design/icons';

const RightSiderMenuWrapper: React.FC<RightSiderMenuProps & RightPrivateSiderMenuProps> = (
  props,
) => {
  const {
    isMobile,
    siderWidth,
    rightCollapsed,
    onRightCollapse,
    style,
    className,
    hide,
    getContainer,
    prefixCls,
  } = props;

  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
    onRightCollapse?.(true);
  };

  const omitProps = Omit(props, ['className', 'style']);

  const { wrapSSR, hashId } = rightUseStyle(`${prefixCls}-sider`, {
    proLayoutCollapsedWidth: 64,
  });

  const siderClassName = classNames(`${prefixCls}-sider`, className, hashId);

  if (hide) {
    return null;
  }

  const drawerOpenProps = openVisibleCompatible(!rightCollapsed, () => {
    onRightCollapse?.(false);
    setOpen(true);
  });

  return wrapSSR(
    <>
      <div
        onClick={() => {
          setOpen(true);
          onRightCollapse?.(false);
        }}
        style={{
          position: 'fixed',
          insetBlockStart: '240px',
          insetInlineEnd: '0px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          fontSize: '16px',
          textAlign: 'center',
          backgroundColor: '#f7b703',
          borderEndStartRadius: '8px',
          borderStartStartRadius: '8px',
          backdropFilter: 'saturate(180%) blur(20px)',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        {open ? (
          <CloseOutlined
            style={{
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
            }}
          />
        ) : (
          <FileTextOutlined
            style={{
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
            }}
          />
        )}
      </div>
      <Drawer
        style={{
          padding: 0,
          height: '100vh',
          ...style,
        }}
        title="Course Menu Content"
        placement="right"
        className={classNames(`${prefixCls}-drawer-sider`, className)}
        {...drawerOpenProps}
        closable={false}
        maskClosable={true}
        onClose={onClose}
        open={open}
        getContainer={getContainer}
        width={siderWidth}
        bodyStyle={{ height: '100vh', padding: 0, display: 'flex', flexDirection: 'row' }}
      >
        {
          <RightSiderMenu
            {...omitProps}
            isMobile={true}
            className={siderClassName}
            rightCollapsed={isMobile ? false : false}
            splitMenus={false}
            originCollapsed={rightCollapsed}
          />
        }
      </Drawer>
    </>,
  );
};

export { RightSiderMenuWrapper as RightSiderMenu };
