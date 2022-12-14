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
  // ?????????????????????????????????
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

// ProLayout ?????????api https://procomponents.ant.design/components/layout
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
            name: '?????????',
            icon: 'smile'
          },
          {
            path: `/${projectId}/DiseaseIndexLibrary`,
            name: '?????????????????????',
            icon: 'models',
            routes: [
              {
                path: `/${projectId}/createNewResearch`,
                name: '??????????????????',
                icon: 'addModel'
              },
              ...routeData]
          },
          {
            name: '????????????',
            icon: 'pages',
            path: `/${projectId}/PagesManagement`
          },
          {
            name: '????????????',
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
            ??????????????????
          </Button>
          <ModalForm
            title="??????????????????"
            open={modalVisit}
            onFinish={async (value) => {
              const result = await addNewResearch(value)
              if (result) {
                setRefreshSymbol(!refreshSymbol)
                message.success('????????????');
                return true;
              }
            }}
            onOpenChange={setModalVisit}
          >
            <ProForm.Group>
              <ProFormText
                width="lg"
                name="name"
                label="????????????????????????"
                placeholder="???????????????"
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
            title="???????????????????????????????"
            onConfirm={async () => {
              const studyId = itemProps?.path && itemProps?.path.split('/').pop();
              const result = await DeleteResearch({ study_id: ~~studyId })
              if (result) {
                message.success("????????????");
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
            title="??????????????????"
            open={modalVisit}
            onFinish={async (value) => {
              const result = await addNewResearch(value)
              if (result) {
                setRefreshSymbol(!refreshSymbol)
                message.success('????????????');
                return true;
              }
            }}
            onOpenChange={setModalVisit}
          >
            <ProForm.Group>
              <ProFormText
                width="lg"
                name="name"
                label="????????????????????????"
                placeholder="???????????????"
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
      // ????????????????????????????????? chlogin
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        // history.push(loginPath);
      }
    },
    // menuFooterRender: () => (
    //   <Button key='new'
    //     onClick={() => history.push(`/${pathname.split('/')[1]}/createNewModel`)}
    //     type='link'>
    //     <PlusSquareOutlined />
    //     <span>??????????????????</span>
    //   </Button>
    // ),
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI ??????</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    // ????????? 403 ??????
    // unAccessible: <div>unAccessible</div>,
    // ???????????? loading ?????????
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
 * @name request ?????????????????????????????????
 * ????????? axios ??? ahooks ??? useRequest ????????????????????????????????????????????????????????????
 * @doc https://umijs.org/docs/max/request#??????
 */
export const request = {
  ...errorConfig,
};
