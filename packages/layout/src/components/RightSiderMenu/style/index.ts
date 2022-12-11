﻿import type { GenerateStyle, ProAliasToken } from '@ant-design/pro-utils';
import { useStyle as rightUseAntdStyle } from '@ant-design/pro-provider';
import { Keyframes } from '@ant-design/cssinjs';
export interface RightSiderMenuToken extends ProAliasToken {
  componentCls: string;
  proLayoutCollapsedWidth: number;
}

export const rightProLayoutTitleHide = new Keyframes('antBadgeLoadingCircle', {
  '0%': { display: 'none', opacity: 0 },
  '80%': {
    display: 'none',
    opacity: 0,
  },
  '100%': {
    display: 'unset',
    opacity: 1,
  },
});

const rightGenSiderMenuStyle: GenerateStyle<RightSiderMenuToken> = (token) => {
  return {
    [token.proComponentsCls]: {
      [`${token.proComponentsCls}-layout`]: {
        [token.componentCls]: {
          position: 'relative',
          background: token.layout?.sider?.colorMenuBackground || 'transparent',
          boxSizing: 'border-box',
          '&-menu': {
            position: 'relative',
            zIndex: 10,
            minHeight: '100%',
          },
          '&-fixed': {
            position: 'fixed',
            insetBlockStart: 0,
            insetInlineStart: 0,
            zIndex: '100',
            height: '100%',
          },
          [`${token.antCls}-layout-sider-children`]: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingInline: token.layout?.sider?.paddingInlineLayoutMenu,
            paddingBlock: token.layout?.sider?.paddingBlockLayoutMenu,
            borderInlineEnd: `1px solid ${token.colorSplit}`,
          },
          [`${token.antCls}-menu`]: {
            [`${token.antCls}-menu-item-group-title`]: {
              fontSize: token.fontSizeSM,
              paddingBottom: 4,
            },
            [`${token.antCls}-menu-item:hover`]: {
              color: token?.layout?.sider?.colorTextMenuItemHover,
            },
          },
          '&-logo': {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: 12,
            paddingBlock: 16,
            color: token.layout?.sider?.colorTextMenu,
            cursor: 'pointer',
            borderBlockEnd: `1px solid ${token.layout?.sider?.colorMenuItemDivider}`,
            '> a': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 22,
              fontSize: 22,
              '> img': {
                display: 'inline-block',
                height: 22,
                verticalAlign: 'middle',
              },
              '> h1': {
                display: 'inline-block',
                height: 22,
                marginBlock: 0,
                marginInlineEnd: 0,
                marginInlineStart: 6,
                color: token.layout?.sider?.colorTextMenuTitle,
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '22px',
                verticalAlign: 'middle',
              },
            },
            '&-collapsed': {
              flexDirection: 'column-reverse',
              margin: 0,
              padding: 12,
              [`${token.proComponentsCls}-layout-apps-icon`]: {
                marginBlockEnd: 8,
                fontSize: 16,
                transition: 'font-size 0.2s ease-in-out,color 0.2s ease-in-out',
              },
            },
          },
          '&-actions': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBlock: 4,
            marginInline: 0,
            color: token.layout?.sider?.colorTextMenu,
            '&-collapsed': {
              flexDirection: 'column-reverse',
              paddingBlock: 0,
              paddingInline: 8,
              fontSize: 16,
              transition: 'font-size 0.3s ease-in-out',
            },
            '&-list': {
              color: token.layout?.sider?.colorTextMenuSecondary,
              '&-collapsed': {
                marginBlockEnd: 8,
                animationName: 'none',
              },
              '&-item': {
                paddingInline: 6,
                paddingBlock: 6,
                lineHeight: '16px',
                fontSize: 16,
                cursor: 'pointer',
                borderRadius: token.borderRadius,
                '&:hover': {
                  background: token.colorBgTextHover,
                },
              },
            },
            '&-avatar': {
              fontSize: 14,
              paddingInline: 8,
              paddingBlock: 8,
              borderRadius: token.borderRadius,
              '& *': {
                cursor: 'pointer',
              },
              '&:hover': {
                background: token.colorBgTextHover,
              },
            },
          },
          '&-hide-menu-collapsed': {
            insetInlineStart: `-${token.proLayoutCollapsedWidth - 12}px`,
            position: 'absolute',
          },
          '&-mix': {
            height: `calc(100% - ${token?.layout?.header?.heightLayoutHeader || 56}px)`,
            insetBlockStart: `${token?.layout?.header?.heightLayoutHeader || 56}px`,
          },
          '&-extra': {
            marginBlockEnd: 16,
            marginBlock: 0,
            marginInline: 16,
            '&-no-logo': {
              marginBlockStart: 16,
            },
          },
          '&-links': {
            width: '100%',
            ul: {
              height: 'auto',
            },
          },
          '&-link-menu': {
            border: 'none',
            boxShadow: 'none',
            background: 'transparent',
          },
          '&-footer': {
            color: token.layout?.sider?.colorTextMenuSecondary,
            paddingBlockEnd: 16,
            fontSize: token.fontSize,
            animationName: rightProLayoutTitleHide,
            animationDuration: '.3s',
            animationTimingFunction: 'ease',
          },
        },
      },
    },
  };
};

export function rightUseStyle(
  prefixCls: string,
  {
    proLayoutCollapsedWidth,
  }: {
    proLayoutCollapsedWidth: number;
  },
) {
  return rightUseAntdStyle('ProLayoutSiderMenu', (token) => {
    const rightSiderMenuToken: RightSiderMenuToken = {
      ...token,
      componentCls: `.${prefixCls}`,
      proLayoutCollapsedWidth,
    };

    return [rightGenSiderMenuStyle(rightSiderMenuToken)];
  });
}
