import type { ProAliasToken } from '@ant-design/pro-utils';
import type { GenerateStyle } from '@ant-design/pro-provider';
import { useStyle as rightUseAntdStyle } from '@ant-design/pro-provider';
export interface RightSiderMenuToken extends ProAliasToken {
  componentCls: string;
  proLayoutCollapsedWidth: number;
}

export function rightUseStylish(
  prefixCls: string,
  {
    stylish,
    proLayoutCollapsedWidth,
  }: {
    stylish?: GenerateStyle<RightSiderMenuToken>;
    proLayoutCollapsedWidth: number;
  },
) {
  return rightUseAntdStyle('ProLayoutSiderMenuStylish', (token) => {
    const rightSiderMenuToken: RightSiderMenuToken = {
      ...token,
      componentCls: `.${prefixCls}`,
      proLayoutCollapsedWidth,
    };
    if (!stylish) return [];
    return [
      {
        [token.proComponentsCls]: {
          [`${token.proComponentsCls}-layout`]: {
            [`${rightSiderMenuToken.componentCls}`]: stylish?.(rightSiderMenuToken),
          },
        },
      },
    ];
  });
}
