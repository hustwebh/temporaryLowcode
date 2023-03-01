import type { IPublicModelPluginContext } from '@alilc/lowcode-types';
import {
  plugins,
  project,
} from '@alilc/lowcode-engine';
import AliLowCodeEngineExt from '@alilc/lowcode-engine-ext';
import { Button } from 'antd';
import CodeGenPlugin from '@alilc/lowcode-plugin-code-generator';
import ComponentsPane from '@alilc/lowcode-plugin-components-pane';
import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane';
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import CodeEditor from "@alilc/lowcode-plugin-code-editor";
import Inject, { injectAssets,filterPackages } from '@alilc/lowcode-plugin-inject';

// 注册到引擎
import TitleSetter from '@alilc/lowcode-setter-title';
import TestSetter from '@/components/LowCodeEditor/setters/test-setter';
import ControlledSetter from '@/components/LowCodeEditor/setters/controlled-setter';
import Logo from '@/components/LowCodeEditor/plugins/logo';
import PageManagePlugin from '@/components/LowCodeEditor/plugins/pageManage';
import CreateFormPlugin from '@/components/LowCodeEditor/plugins/createForm';
import PreviewPlugin from '@/components/LowCodeEditor/plugins/preview';

import {
  saveSchema,
  resetSchema,
} from '@/services/lowcode';
import {
  setPageSchemaToLocalStorage,
  setPackgesToLocalStorage
} from '@/services/lowcode/local';
import { getSchemaByPageObj } from '@/components/LowCodeEditor/plugins/pageManage/magageFunc';
import { pageMsgToMenu, findTargetInMenuData } from "@/utils";
import { getAllCategories } from '@/services/ant-design-pro/categroy';

import assets from '@/assets/assets.json';

const { pathname } = location;

export default async function registerPlugins() {
  await plugins.register(Inject)
  // plugin API 见 https://lowcode-engine.cn/docV2/ibh9fh
  SchemaPlugin.pluginName = 'SchemaPlugin';
  await plugins.register(SchemaPlugin);

  const editorInit = (ctx: IPublicModelPluginContext) => {
    return {
      name: 'editor-init',
      async init() {
        // 设置物料描述
        const { material, project } = ctx;
        material.setAssets(await injectAssets(assets));
        // 加载 schema
        const currentIndictorId = localStorage.getItem("indicator") || "";
        //选择从进入的指标模型作为默认页面:
        const defaultPage = findTargetInMenuData(pageMsgToMenu(await getAllCategories({ study_id: ~~pathname.split('/')[1] })), currentIndictorId)
        //接下来要设置获取对应Schema文件的逻辑
        const pageSchema = await getSchemaByPageObj(defaultPage, currentIndictorId)
        project.openDocument(pageSchema);
        setPageSchemaToLocalStorage(pageSchema);
        setPackgesToLocalStorage();
      },
    };
  }
  editorInit.pluginName = 'editorInit';
  await plugins.register(editorInit);

  const builtinPluginRegistry = (ctx: IPublicModelPluginContext) => {
    return {
      name: 'builtin-plugin-registry',
      async init() {
        const { skeleton } = ctx;
        // 注册 logo 面板
        skeleton.add({
          area: 'topArea',
          type: 'Widget',
          name: 'logo',
          content: Logo,
          contentProps: {
            logo: 'https://img.alicdn.com/imgextra/i4/O1CN013w2bmQ25WAIha4Hx9_!!6000000007533-55-tps-137-26.svg',
            href: 'https://lowcode-engine.cn',
          },
          props: {
            align: 'left',
          },
        });

        // 注册组件面板
        const componentsPane = skeleton.add({
          area: 'leftArea',
          type: 'PanelDock',
          name: 'componentsPane',
          content: ComponentsPane,
          contentProps: {},
          props: {
            align: 'top',
            icon: 'zujianku',
            description: '组件库',
          },
        });
        componentsPane?.disable?.();
        project.onSimulatorRendererReady(() => {
          componentsPane?.enable?.();
        })

        skeleton.add({
          index: -1,
          area: 'leftArea',
          type: 'PanelDock',
          name: 'pagesPane',
          content: PageManagePlugin,
          contentProps: {},
          props: {
            align: 'top',
            icon: 'kaiwenjianjia',
            description: '页面管理',
          },
        });

      },
    };
  }
  builtinPluginRegistry.pluginName = 'builtinPluginRegistry';
  await plugins.register(builtinPluginRegistry);

  // 设置内置 setter 和事件绑定、插件绑定面板
  const setterRegistry = (ctx: IPublicModelPluginContext) => {
    const { setterMap, pluginMap } = AliLowCodeEngineExt;
    return {
      name: 'ext-setters-registry',
      async init() {
        const { setters, skeleton } = ctx;
        // 注册setterMap
        setters.registerSetter(setterMap);
        // 注册插件
        // 注册事件绑定面板
        skeleton.add({
          area: 'centerArea',
          type: 'Widget',
          content: pluginMap.EventBindDialog,
          name: 'eventBindDialog',
          props: {},
        });

        // 注册变量绑定面板
        skeleton.add({
          area: 'centerArea',
          type: 'Widget',
          content: pluginMap.VariableBindDialog,
          name: 'variableBindDialog',
          props: {},
        });
      },
    };
  }
  setterRegistry.pluginName = 'setterRegistry';
  await plugins.register(setterRegistry);

  // 注册保存面板
  const saveSample = (ctx: IPublicModelPluginContext) => {
    return {
      name: 'saveSample',
      async init() {
        const { skeleton, hotkey } = ctx;

        skeleton.add({
          name: 'saveSample',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button onClick={() => saveSchema()}>
              保存
            </Button>
          ),
        });
        skeleton.add({
          name: 'resetSchema',
          area: 'topArea',
          type: 'Widget',
          props: {
            align: 'right',
          },
          content: (
            <Button onClick={() => resetSchema('antd')}>
              重置页面
            </Button>
          ),
        });
        hotkey.bind('command+s', (e) => {
          e.preventDefault();
          saveSchema()
        });
      },
    };
  }
  saveSample.pluginName = 'saveSample';
  await plugins.register(saveSample);

  // 注册预览
  await plugins.register(PreviewPlugin);

  // 注册生成表单面板
  await plugins.register(CreateFormPlugin);

  DataSourcePanePlugin.pluginName = 'DataSourcePane';
  await plugins.register(DataSourcePanePlugin);

  CodeEditor.pluginName = 'CodeEditor';
  await plugins.register(CodeEditor);

  CodeGenPlugin.pluginName = 'CodeGenPlugin'
  await plugins.register(CodeGenPlugin);

  // 设置自定义 setter 和事件绑定、插件绑定面板
  const customSetter = (ctx: IPublicModelPluginContext) => {
    return {
      name: '___registerCustomSetter___',
      async init() {
        const { setters } = ctx;

        setters.registerSetter('TitleSetter', TitleSetter);
        // setters.registerSetter('BehaviorSetter', BehaviorSetter);
        // setters.registerSetter('CustomSetter', CustomSetter);
        setters.registerSetter('TestSetter', TestSetter);
        setters.registerSetter('ControlledSetter', ControlledSetter)
      },
    };
  }
  customSetter.pluginName = 'customSetter';
  await plugins.register(customSetter);
};
