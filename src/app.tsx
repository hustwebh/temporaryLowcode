import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import {
  SmileOutlined,
  UnorderedListOutlined,
  CrownOutlined,
  SnippetsOutlined,
  PlusSquareOutlined,
  PieChartOutlined,
  CloseOutlined
} from '@ant-design/icons';
import {
  DrawerForm,
  ModalForm,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, useModel } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { DeleteResearch, getAllModels } from './services/ant-design-pro/layout';
import { getAllDiseaseResearchList } from './services/ant-design-pro/layout';
import { addNewResearch } from './services/ant-design-pro/layout';
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
  test: <PieChartOutlined />
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
      // history.push(loginPath);
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
  const { refreshSymbol, setRefreshSymbol, modalVisit, setModalVisit } = useModel('modelsMsg', res => ({
    refreshSymbol: res.refreshSymbol,
    setRefreshSymbol: res.setRefreshSymbol,
    modalVisit: res.modalVisit,
    setModalVisit: res.setModalVisit
  }));
  return {
    rightContentRender: () => <RightContent />,
    menu: {
      params: { initialState, refreshSymbol },
      request: async () => {
        const projectId = pathname.split('/')[1];
        const DiseaseResearchList = await getAllDiseaseResearchList()
        const routeData: {
          path: string;
          name: string;
        }[] = DiseaseResearchList.map((item: any) => {
          return {
            path: `/${projectId}/DiseaseIndexLibrary/${item.id}`,
            name: item.name
          }
        })
        const menuRoute: any = [
          {
            path: `/WorkPlace`,
            name: '工作台',
            icon: 'smile'
          },
          {
            path: `/${projectId}/DiseaseIndexLibrary`,
            name: '病症研究指标库',
            icon: 'models',
            routes: [
              {
                path: `/${projectId}/createNewResearch`,
                name: '新建研究项目',
                icon: 'addModel'
              },
              ...routeData]
          },
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
      if (itemProps.path?.includes('createNewResearch')) {
        return <div
          style={{
            display: 'flex',
            alignItems: 'start',
            gap: 8,
          }}
        >
          <Button
            icon={<PlusSquareOutlined />}
            style={{ outline: "none", border: 'none', padding: 0, background: 'inherit', color: "#1890ff" }}
            onClick={() => setModalVisit(true)}
          >
            创建研究项目
          </Button>
          <ModalForm
            title="新建研究项目"
            open={modalVisit}
            onFinish={async (value) => {
              const result = await addNewResearch(value)
              if (result) {
                setRefreshSymbol(!refreshSymbol)
                message.success('提交成功');
                return true;
              }
            }}
            onOpenChange={setModalVisit}
          >
            <ProForm.Group>
              <ProFormText
                width="lg"
                name="name"
                label="新建研究项目名称"
                placeholder="请输入名称"
              />
            </ProForm.Group>
          </ModalForm>
        </div>
      }
      if (itemProps.path?.includes('DiseaseIndexLibrary')) {
        return <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Link
            to={`${itemProps.path}`}
          >
            {defaultDom}
          </Link>
          <Popconfirm
            title="确认删除该研究项目吗?"
            onConfirm={async () => {
              const studyId = pathname.split('/')[3];
              const result = await DeleteResearch({ study_id: ~~studyId })
              if (result) {
                message.success("删除成功");
                setRefreshSymbol(!refreshSymbol)
              }
            }}
            onCancel={() => null}>
            <Button
              type="ghost"
              style={{ border: "none" }}
              icon={<CloseOutlined style={{ color: "red" }} />}
            />
          </Popconfirm>
          <ModalForm
            title="新建研究项目"
            open={modalVisit}
            onFinish={async (value) => {
              const result = await addNewResearch(value)
              if (result) {
                setRefreshSymbol(!refreshSymbol)
                message.success('提交成功');
                return true;
              }
            }}
            onOpenChange={setModalVisit}
          >
            <ProForm.Group>
              <ProFormText
                width="lg"
                name="name"
                label="新建研究项目名称"
                placeholder="请输入名称"
              />
            </ProForm.Group>
          </ModalForm>
        </div>
      }
      return <Link
        to={`${itemProps.path}`}
      >
        {defaultDom}
      </Link>
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 chlogin
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        // history.push(loginPath);
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
