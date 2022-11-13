import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import {
  SmileOutlined,
  UnorderedListOutlined,
  CrownOutlined,
  SnippetsOutlined,
  PlusSquareOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Button } from 'antd'
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, useModel } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { getAllModels } from './services/ant-design-pro/layout';
import { useState, useEffect } from 'react';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const { pathname } = location;


const IconMap = {
  smile: <SmileOutlined />,
  crown: <CrownOutlined />,
  pages: <SnippetsOutlined />,
  models: <UnorderedListOutlined />,
  addModel: <PlusSquareOutlined />,
  test:<PieChartOutlined />
};

const loopMenuItem = (menus: any[]): any[] =>
  menus.map(({ icon, routes, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon as string],
    routes: routes && loopMenuItem(routes),
  }));

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      history.push(loginPath);
      // history.push('/WorkPlace')
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (window.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const { refreshSymbol } = useModel('modelsMsg', res => ({
    refreshSymbol: res.refreshSymbol
  }));
  return {
    rightContentRender: () => <RightContent />,
    menu: {
      params: { initialState, refreshSymbol },
      request: async () => {
        const projectId = pathname.split('/')[1];
        const ListMsg = await getAllModels();
        const routeData: {
          path: string;
          name: string;
        }[] = ListMsg.map((item: any) => {
          const ListData = {
            path: `/${projectId}/models/${item.id}`,
            name: item.table_name,
          };
          return ListData
        });
        const menuRoute: any = [
          {
            path: `/WorkPlace`,
            name: '工作台',
            icon: 'smile'
          },
          {
            path: `/${projectId}/models`,
            name: '数据模型',
            icon: 'models',
            routes: [
              {
                path: `/${projectId}/createNewModel`,
                name: '新建数据模型',
                icon: 'addModel'
              },
              ...routeData]
          },
          // {
          //   path: `/${projectId}/createNewModel`,
          //   name: '新建数据模型',
          //   icon: 'addModel'
          // },
          {
            name: '页面管理',
            icon: 'pages',
            path: `/${projectId}/PagesManagement`
          },
          {
            name: '项目发布',
            icon: 'test',
            path: `/WorkPlace`
          },
        ]
        return loopMenuItem(menuRoute);
      },
    },
    menuItemRender: (itemProps, defaultDom) => {
      if (itemProps.path?.includes('createNewModel')) {
        console.log('itemProps', itemProps);
        console.log('defaultDom', defaultDom);
        return <div
          style={{
            display: 'flex',
            alignItems: 'start',
            gap: 8,
          }}
        >
          <Link
            to={`${pathname.split('/')[1]}/createNewModel`}
            style={{
              color:'#1890ff'
            }}
          >
            <PlusSquareOutlined />
            创建新模型
          </Link>
        </div>
      }
      return <Link
      to={`${itemProps.path}`}
    >
      {defaultDom}
    </Link>
    },
    // subMenuItemRender: (_, defaultDom) => {
    //   console.log('defaultDom', defaultDom);
    //   return <div
    //     style={{
    //       display: 'flex',
    //       alignItems: 'center',
    //       gap: 8,
    //     }}
    //   >
    //     pre {defaultDom}
    //   </div>
    // },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 chlogin
      console.log(initialState?.currentUser);
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    // menuFooterRender: () => (
    //   <Button key='new'
    //     onClick={() => history.push(`/${pathname.split('/')[1]}/createNewModel`)}
    //     type='link'>
    //     <PlusSquareOutlined />
    //     <span>新建数据模型</span>
    //   </Button>
    // ),
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
