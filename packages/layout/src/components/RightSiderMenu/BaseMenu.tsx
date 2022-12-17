import { createFromIconfontCN } from '@ant-design/icons';
import type { ProTokenType } from '@ant-design/pro-provider';
import { ProProvider } from '@ant-design/pro-provider';
import { isImg, isUrl, useMountMergeState } from '@ant-design/pro-utils';
import type { MenuProps } from 'antd';
import { Menu, Skeleton } from 'antd';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import type { PureSettings } from '../../defaultSettings';
import { defaultSettings } from '../../defaultSettings';
import type { MenuDataItem, MessageDescriptor, RouterTypes, WithFalse } from '../../typing';
import { getOpenKeysFromMenuData } from '../../utils/utils';
import type { RightPrivateSiderMenuProps } from './RightSiderMenu';
import { rightUseStyle } from './style/menu';

// todo
export type RightMenuMode =
  | 'vertical'
  | 'vertical-left'
  | 'vertical-right'
  | 'horizontal'
  | 'inline';

export type RightBaseMenuProps = {
  className?: string;
  /** 默认的是否展开，会受到 breakpoint 的影响 */
  defaultCollapsed?: boolean;
  rightCollapsed?: boolean;
  splitMenus?: boolean;
  isMobile?: boolean;
  menuData?: MenuDataItem[];
  mode?: RightMenuMode;
  onRightCollapse?: (collapsed: boolean) => void;
  openKeys?: WithFalse<string[]> | undefined;
  handleOpenChange?: (openKeys: string[]) => void;
  iconPrefixes?: string;
  /** 要给菜单的props, 参考antd-menu的属性。https://ant.design/components/menu-cn/ */
  menuProps?: MenuProps;
  style?: React.CSSProperties;
  formatMessage?: (message: MessageDescriptor) => string;

  /**
   * @name 处理父级菜单的 props，可以复写菜单的点击功能，一般用于埋点
   * @see 子级的菜单要使用 menuItemRender 来处理
   *
   * @example 使用 a 标签跳转到特殊的地址 subMenuItemRender={(item, defaultDom) => { return <a onClick={()=> history.push(item.path) }>{defaultDom}</a> }}
   * @example 增加埋点 subMenuItemRender={(item, defaultDom) => { return <a onClick={()=> log.click(item.name) }>{defaultDom}</a> }}
   */
  subMenuItemRender?: WithFalse<
    (
      item: MenuDataItem & {
        isUrl: boolean;
      },
      defaultDom: React.ReactNode,
      menuProps: RightBaseMenuProps,
    ) => React.ReactNode
  >;

  /**
   * @name 处理菜单的 props，可以复写菜单的点击功能，一般结合 Router 框架使用
   * @see 非子级的菜单要使用 subMenuItemRender 来处理
   *
   * @example 使用 a 标签 menuItemRender={(item, defaultDom) => { return <a onClick={()=> history.push(item.path) }>{defaultDom}</a> }}
   * @example 使用 Link 标签 menuItemRender={(item, defaultDom) => { return <Link to={item.path}>{defaultDom}</Link> }}
   */
  menuItemRender?: WithFalse<
    (
      item: MenuDataItem & {
        isUrl: boolean;
        onClick: () => void;
      },
      defaultDom: React.ReactNode,
      menuProps: RightBaseMenuProps & Partial<RightPrivateSiderMenuProps>,
    ) => React.ReactNode
  >;

  /**
   * @name 处理 menuData 的方法，与 menuDataRender 不同，postMenuData处理完成后会直接渲染，不再进行国际化和拼接处理
   *
   * @example 增加菜单图标 postMenuData={(menuData) => { return menuData.map(item => { return { ...item, icon: <Icon type={item.icon} /> } }) }}
   */
  postMenuData?: (menusData?: MenuDataItem[]) => MenuDataItem[];
} & Partial<RouterTypes> &
  Omit<MenuProps, 'openKeys' | 'onOpenChange' | 'title'> &
  Partial<PureSettings>;

let IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'icon-geren' #For Iconfont ,
//   icon: 'http://demo.com/icon.png',
//   icon: '/favicon.png',
//   icon: <Icon type="setting" />,
const getIcon = (
  icon: string | React.ReactNode,
  iconPrefixes: string = 'icon-',
  className: string,
): React.ReactNode => {
  if (typeof icon === 'string' && icon !== '') {
    if (isUrl(icon) || isImg(icon)) {
      return <img width={16} key={icon} src={icon} alt="icon" className={className} />;
    }
    if (icon.startsWith(iconPrefixes)) {
      return <IconFont type={icon} />;
    }
  }
  return icon;
};

const getMenuTitleSymbol = (title: React.ReactNode) => {
  if (title && typeof title === 'string') {
    const symbol = title.substring(0, 1).toUpperCase();
    return symbol;
  }
  return null;
};

class MenuUtil {
  constructor(
    props: RightBaseMenuProps & {
      token?: ProTokenType;
      menuRenderType?: 'header' | 'sider';
      baseClassName: string;
      hashId: string;
    },
  ) {
    this.props = props;
  }

  props: RightBaseMenuProps & {
    token?: ProTokenType;
    menuRenderType?: 'header' | 'sider';
    baseClassName: string;
    hashId: string;
  };

  getNavMenuItems = (
    menusData: MenuDataItem[] = [],
    level: number,
    activeMenu: string,
  ): ItemType[] =>
    menusData
      .map((item) => this.getSubMenuOrItem(item, level, activeMenu))
      .filter((item) => item)
      .flat(1);

  /** Get SubMenu or Item */
  getSubMenuOrItem = (
    item: MenuDataItem,
    level: number,
    activeMenu: string,
  ): ItemType | ItemType[] => {
    const {
      subMenuItemRender,
      baseClassName,
      prefixCls,
      rightCollapsed,
      menu,
      iconPrefixes,
      layout,
    } = this.props;
    const isGroup = menu?.type === 'group' && layout !== 'top';
    const designToken = this.props.token;

    const name = this.getIntlName(item);
    const children = item?.children || item?.routes;

    const menuType = isGroup && level === 0 ? ('group' as const) : undefined;

    console.log('0. item.path: ' + item.path);
    console.log('0. activeMenu: ' + activeMenu);
    console.log('0. activeMenu bool: ' + (item.path == activeMenu));
    console.log('0. activeMenu index: ' + item.path?.indexOf(activeMenu));

    if (
      Array.isArray(children) &&
      children.length > 0 &&
      activeMenu != undefined &&
      item.path == activeMenu
    ) {
      /** Menu 第一级可以有icon，或者 isGroup 时第二级别也要有 */
      const shouldHasIcon = level === 0 || (isGroup && level === 1);

      //  get defaultTitle by menuItemRender
      const iconDom = getIcon(
        item.icon,
        iconPrefixes,
        `action ${baseClassName}-icon ${this.props?.hashId}`,
      );
      /**
       * 如果没有icon在收起的时候用首字母代替
       */
      const defaultIcon = rightCollapsed && shouldHasIcon ? getMenuTitleSymbol(name) : null;

      const defaultTitle = (
        <div
          title={name}
          className={classNames(`${baseClassName}-item-title`, this.props?.hashId, {
            [`${baseClassName}-item-title-collapsed`]: rightCollapsed,
            [`${baseClassName}-group-item-title`]: menuType === 'group',
            [`${baseClassName}-item-collapsed-show-title`]:
              menu?.collapsedShowTitle && rightCollapsed,
          })}
        >
          {/* 收起的时候group模式就不要展示icon了，放不下 */}
          {menuType === 'group' && rightCollapsed ? null : shouldHasIcon && iconDom ? (
            <span className={`anticon ${baseClassName}-item-icon ${this.props?.hashId}`}>
              {iconDom}
            </span>
          ) : (
            defaultIcon
          )}
          <span
            className={classNames(`${baseClassName}-item-text`, this.props?.hashId, {
              [`${baseClassName}-item-text-has-icon`]:
                menuType !== 'group' && shouldHasIcon && (iconDom || defaultIcon),
            })}
          >
            {name}
          </span>
        </div>
      );

      // subMenu only title render
      const title = subMenuItemRender
        ? subMenuItemRender({ ...item, isUrl: false }, defaultTitle, this.props)
        : defaultTitle;

      const childrenList = this.getNavMenuItems(children, level + 1, activeMenu);
      if (isGroup && level === 0 && this.props.rightCollapsed && !menu.collapsedShowGroupTitle) {
        return childrenList;
      }

      console.log('1. Menu Name : ' + item.tooltip || title);
      console.log('1. Item: ' + item);
      console.log(item);
      console.log('1. Level : ' + level);
      console.log('1. Selected Key : ' + activeMenu);
      console.log(
        [
          {
            type: menuType,
            key: item.key! || item.path!,
            title: item.tooltip || title,
            label: title,
            onClick: isGroup ? undefined : item.onTitleClick,
            children: childrenList,
            className: classNames({
              [`${baseClassName}-group`]: menuType === 'group',
              [`${baseClassName}-submenu`]: menuType !== 'group',
              [`${baseClassName}-submenu-has-icon`]:
                menuType !== 'group' && shouldHasIcon && iconDom,
            }),
          } as ItemType,
          isGroup && level === 0
            ? ({
                type: 'divider',
                prefixCls,
                className: `${baseClassName}-divider`,
                key: (item.key! || item.path!) + '-group-divider',
                style: {
                  padding: 0,
                  borderBlockEnd: 0,
                  margin: this.props.rightCollapsed ? '4px' : '6px 16px',
                  marginBlockStart: this.props.rightCollapsed ? 4 : 8,
                  borderColor: designToken?.layout?.sider?.colorMenuItemDivider,
                },
              } as ItemType)
            : undefined,
        ].filter(Boolean) as ItemType[],
      );

      return [
        {
          type: menuType,
          key: item.key! || item.path!,
          title: item.tooltip || title,
          label: title,
          onClick: isGroup ? undefined : item.onTitleClick,
          children: childrenList,
          className: classNames({
            [`${baseClassName}-group`]: menuType === 'group',
            [`${baseClassName}-submenu`]: menuType !== 'group',
            [`${baseClassName}-submenu-has-icon`]: menuType !== 'group' && shouldHasIcon && iconDom,
          }),
        } as ItemType,
        isGroup && level === 0
          ? ({
              type: 'divider',
              prefixCls,
              className: `${baseClassName}-divider`,
              key: (item.key! || item.path!) + '-group-divider',
              style: {
                padding: 0,
                borderBlockEnd: 0,
                margin: this.props.rightCollapsed ? '4px' : '6px 16px',
                marginBlockStart: this.props.rightCollapsed ? 4 : 8,
                borderColor: designToken?.layout?.sider?.colorMenuItemDivider,
              },
            } as ItemType)
          : undefined,
      ].filter(Boolean) as ItemType[];
    } else if (activeMenu != undefined && item.path?.indexOf(activeMenu) != -1) {
      console.log('2. Menu Name : ' + name);
      console.log('2. Item: ' + item);
      console.log(item);
      console.log('2. Level : ' + level);
      console.log('2. Selected Key : ' + activeMenu);
      console.log({
        className: `${baseClassName}-menu-item`,
        title: item.tooltip || name,
        disabled: item.disabled,
        key: item.key! || item.path!,
        onClick: item.onTitleClick,
        label: this.getMenuItemPath(item, level),
      });

      return {
        className: `${baseClassName}-menu-item`,
        title: item.tooltip || name,
        disabled: item.disabled,
        key: item.key! || item.path!,
        onClick: item.onTitleClick,
        label: this.getMenuItemPath(item, level),
      };
    }

    return null;
  };

  getIntlName = (item: MenuDataItem) => {
    const { name, locale } = item;
    const { menu, formatMessage } = this.props;
    if (locale && menu?.locale !== false) {
      return formatMessage?.({
        id: locale,
        defaultMessage: name,
      });
    }
    return name;
  };

  /**
   * 判断是否是http链接.返回 Link 或 a Judge whether it is http link.return a or Link
   *
   * @memberof SiderMenu
   */
  getMenuItemPath = (item: MenuDataItem, level: number) => {
    const itemPath = this.conversionPath(item.path || '/');
    const {
      location = { pathname: '/' },
      isMobile,
      onRightCollapse,
      menuItemRender,
      iconPrefixes,
    } = this.props;

    // if local is true formatMessage all name。
    const name = this.getIntlName(item);
    const { baseClassName, menu, rightCollapsed } = this.props;
    const isGroup = menu?.type === 'group';
    /** Menu 第一级可以有icon，或者 isGroup 时第二级别也要有 */
    const hasIcon = level === 0 || (isGroup && level === 1);
    const icon = !hasIcon
      ? null
      : getIcon(item.icon, iconPrefixes, `${baseClassName}-icon ${this.props?.hashId}`);
    const defaultIcon = rightCollapsed && hasIcon ? getMenuTitleSymbol(name) : null;
    let defaultItem = (
      <div
        key={itemPath}
        className={classNames(`${baseClassName}-item-title`, this.props?.hashId, {
          [`${baseClassName}-item-title-collapsed`]: rightCollapsed,
          [`${baseClassName}-item-collapsed-show-title`]:
            menu?.collapsedShowTitle && rightCollapsed,
        })}
      >
        {icon ? (
          <span className={`anticon ${baseClassName}-item-icon ${this.props?.hashId}`}>{icon}</span>
        ) : (
          defaultIcon
        )}
        <span
          className={classNames(`${baseClassName}-item-text`, this.props?.hashId, {
            [`${baseClassName}-item-text-has-icon`]: hasIcon && (icon || defaultIcon),
          })}
        >
          {name}
        </span>
      </div>
    );
    const isHttpUrl = isUrl(itemPath);

    // Is it a http link
    if (isHttpUrl) {
      defaultItem = (
        <span
          key={itemPath}
          title={name}
          onClick={() => {
            window?.open?.(itemPath, '_blank');
          }}
          className={classNames(`${baseClassName}-item-title`, this.props?.hashId, {
            [`${baseClassName}-item-title-collapsed`]: rightCollapsed,
            [`${baseClassName}-item-link`]: true,
            [`${baseClassName}-item-collapsed-show-title`]:
              menu?.collapsedShowTitle && rightCollapsed,
          })}
        >
          {icon ? (
            <span className={`anticon ${baseClassName}-item-icon ${this.props?.hashId}`}>
              {icon}
            </span>
          ) : (
            defaultIcon
          )}
          <span
            className={classNames(`${baseClassName}-item-text`, this.props?.hashId, {
              [`${baseClassName}-item-text-has-icon`]: hasIcon && (icon || defaultIcon),
            })}
          >
            {name}
          </span>
        </span>
      );
    }
    if (menuItemRender) {
      const renderItemProps = {
        ...item,
        isUrl: isHttpUrl,
        itemPath,
        isMobile,
        replace: itemPath === location.pathname,
        onClick: () => onRightCollapse && onRightCollapse(true),
        children: undefined,
      };
      return menuItemRender(renderItemProps, defaultItem, this.props);
    }
    return defaultItem;
  };

  conversionPath = (path: string) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };
}

/**
 * 生成openKeys 的对象，因为设置了openKeys 就会变成受控，所以需要一个空对象
 *
 * @param BaseMenuProps
 */
const getOpenKeysProps = (
  openKeys: React.ReactText[] | false,
  { layout, rightCollapsed }: RightBaseMenuProps,
): {
  openKeys?: undefined | string[];
} => {
  let openKeysProps = {};

  if (openKeys && !rightCollapsed && ['side', 'mix'].includes(layout || 'mix')) {
    openKeysProps = {
      openKeys,
    };
  }
  return openKeysProps;
};

const RightBaseMenu: React.FC<RightBaseMenuProps & RightPrivateSiderMenuProps> = (props) => {
  const {
    mode,
    className,
    handleOpenChange,
    isMobile,
    style,
    menuData,
    prefixCls,
    menu,
    matchMenuKeys,
    iconfontUrl,
    selectedKeys: propsSelectedKeys,
    onSelect,
    menuRenderType,
    openKeys: propsOpenKeys,
  } = props;

  const { token: designToken } = useContext(ProProvider);

  const baseClassName = `${prefixCls}-base-menu`;
  // 用于减少 defaultOpenKeys 计算的组件
  const defaultOpenKeysRef = useRef<string[]>([]);

  const [defaultOpenAll, setDefaultOpenAll] = useMountMergeState(menu?.defaultOpenAll);

  const [openKeys, setOpenKeys] = useMountMergeState<WithFalse<React.Key[]>>(
    () => {
      if (menu?.defaultOpenAll) {
        return getOpenKeysFromMenuData(menuData) || [];
      }
      if (propsOpenKeys === false) {
        return false;
      }
      return [];
    },
    {
      value: propsOpenKeys === false ? undefined : propsOpenKeys,
      onChange: handleOpenChange as any,
    },
  );

  const [selectedKeys, setSelectedKeys] = useMountMergeState<string[] | undefined>([], {
    value: propsSelectedKeys,
    onChange: onSelect
      ? (keys) => {
          if (onSelect && keys) {
            onSelect(keys as any);
          }
        }
      : undefined,
  });
  useEffect(() => {
    if (menu?.defaultOpenAll || propsOpenKeys === false) {
      return;
    }
    if (matchMenuKeys) {
      setOpenKeys(matchMenuKeys);
      setSelectedKeys(matchMenuKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchMenuKeys.join('-')]);

  useEffect(() => {
    // reset IconFont
    if (iconfontUrl) {
      IconFont = createFromIconfontCN({
        scriptUrl: iconfontUrl,
      });
    }
  }, [iconfontUrl]);

  useEffect(
    () => {
      // if pathname can't match, use the nearest parent's key
      if (matchMenuKeys.join('-') !== (selectedKeys || []).join('-')) {
        setSelectedKeys(matchMenuKeys);
      }
      if (
        !defaultOpenAll &&
        propsOpenKeys !== false &&
        matchMenuKeys.join('-') !== (openKeys || []).join('-')
      ) {
        let newKeys: React.Key[] = matchMenuKeys;
        // 如果不自动关闭，我需要把 openKeys 放进去
        if (menu?.autoClose === false) {
          newKeys = Array.from(new Set([...matchMenuKeys, ...(openKeys || [])]));
        }
        setOpenKeys(newKeys);
      } else if (menu?.ignoreFlatMenu && defaultOpenAll) {
        // 忽略用户手动折叠过的菜单状态，折叠按钮切换之后也可实现默认展开所有菜单
        setOpenKeys(getOpenKeysFromMenuData(menuData));
      } else setDefaultOpenAll(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchMenuKeys.join('-')],
  );

  const openKeysProps = useMemo(
    () => getOpenKeysProps(openKeys, props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openKeys && openKeys.join(','), props.layout, props.rightCollapsed],
  );
  const { wrapSSR, hashId } = rightUseStyle(baseClassName);

  const menuUtils = useMemo(() => {
    return new MenuUtil({
      ...props,
      token: designToken,
      menuRenderType,
      baseClassName,
      hashId,
    });
  }, [props, designToken, menuRenderType, baseClassName, hashId]);

  if (menu?.loading) {
    return (
      <div
        style={
          mode?.includes('inline')
            ? { padding: 24 }
            : {
                marginBlockStart: 16,
              }
        }
      >
        <Skeleton
          active
          title={false}
          paragraph={{
            rows: mode?.includes('inline') ? 6 : 1,
          }}
        />
      </div>
    );
  }

  // 这次 openKeys === false 的时候的情况，这种情况下帮用户选中一次
  // 第二此不会使用，所以用了 defaultOpenKeys
  // 这里返回 null，是为了让 defaultOpenKeys 生效
  if (props.openKeys === false && !props.handleOpenChange) {
    defaultOpenKeysRef.current = matchMenuKeys;
  }

  const finallyData = props.postMenuData ? props.postMenuData(menuData) : menuData;

  console.log('selectedKeys : ');
  console.log(selectedKeys);
  console.log('finallyData : ');
  console.log(finallyData);
  console.log('isMobile : ' + isMobile);

  let activeMenu = 'home';
  let finallyData2 = finallyData;

  if (selectedKeys && selectedKeys.length > 0 && finallyData && finallyData[0].path == '/home') {
    activeMenu = selectedKeys ? selectedKeys[0] : 'home';
    finallyData2 = finallyData?.filter((path) => path.path == activeMenu);
    console.log('--finallyData2 : ');
    console.log(finallyData2);
    try {
      finallyData2 = finallyData2 ? finallyData2[0].children : finallyData2;
    } catch (error) {
      finallyData2 = finallyData;
    }

    activeMenu = selectedKeys ? selectedKeys[1] : 'home';
    finallyData2 = finallyData2?.filter((path) => path.path == activeMenu);
  } else {
    activeMenu = selectedKeys ? selectedKeys[1] : 'home';
    finallyData2 = finallyData?.filter((path) => path.path == activeMenu);
  }

  console.log('finallyData2 : ');
  console.log(finallyData2);

  if (finallyData && finallyData?.length < 1) {
    return null;
  }

  return wrapSSR(
    <Menu
      {...openKeysProps}
      key="Menu"
      mode={mode}
      inlineIndent={16}
      defaultOpenKeys={defaultOpenKeysRef.current}
      theme="light"
      selectedKeys={selectedKeys}
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        ...style,
      }}
      className={classNames(className, hashId, baseClassName, {
        [`${baseClassName}-horizontal`]: mode === 'horizontal',
        [`${baseClassName}-collapsed`]: props.rightCollapsed,
      })}
      items={menuUtils.getNavMenuItems(finallyData2, 0, activeMenu)}
      onOpenChange={setOpenKeys}
      {...props.menuProps}
    />,
  );
};

export { RightBaseMenu };
