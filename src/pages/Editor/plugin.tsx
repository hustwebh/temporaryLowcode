import type {
  ILowCodePluginContext} from '@alilc/lowcode-engine';
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
import Inject, { injectAssets } from '@alilc/lowcode-plugin-inject';
import { request } from '@umijs/max';

// 注册到引擎
import TitleSetter from '@alilc/lowcode-setter-title';
import BehaviorSetter from '@/components/LowCodeEditor/setters/behavior-setter';
import CustomSetter from '@/components/LowCodeEditor/setters/custom-setter';
import TestSetter from '@/components/LowCodeEditor/setters/test-setter';
import Logo from '@/components/LowCodeEditor/plugins/logo';
import PageManage from '@/components/LowCodeEditor/plugins/PageManage'

import {
  saveSchema,
  resetSchema,
  getProjectSchemaFromLocalStorage,
} from '@/services/lowcode';

import assets from '@/assets/assets';
import schema from '@/assets/schema';

export default async function registerPlugins() {
  await plugins.register(Inject);

  // plugin API 见 https://lowcode-engine.cn/docV2/ibh9fh
  SchemaPlugin.pluginName = 'SchemaPlugin';
  await plugins.register(SchemaPlugin);

  const editorInit = (ctx: ILowCodePluginContext) => {
    return {
      name: 'editor-init',
      async init() {
        // 修改面包屑组件的分隔符属性setter
        // const assets = await request('./assets.json');
        // const schema = await request('./schema.json');
        // 设置物料描述
        const { material, project } = ctx;

        material.setAssets(await injectAssets(assets));

        // 加载 schema
        project.openDocument(getProjectSchemaFromLocalStorage('antd').componentsTree?.[0] || schema);
      },
    };
  }
  editorInit.pluginName = 'editorInit';
  await plugins.register(editorInit);

  const builtinPluginRegistry = (ctx: ILowCodePluginContext) => {
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
          content: PageManage,
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
  const setterRegistry = (ctx: ILowCodePluginContext) => {
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
  const saveSample = (ctx: ILowCodePluginContext) => {
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
            <Button onClick={() => saveSchema('antd')}>
              保存到本地
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
          saveSchema('antd')
        });
      },
    };
  }
  
  saveSample.pluginName = 'saveSample';
  await plugins.register(saveSample);

  DataSourcePanePlugin.pluginName = 'DataSourcePane';
  await plugins.register(DataSourcePanePlugin);

  CodeEditor.pluginName = 'CodeEditor';
  await plugins.register(CodeEditor);

  CodeGenPlugin.pluginName = 'CodeGenPlugin'
  await plugins.register(CodeGenPlugin);

  const customSetter = (ctx: ILowCodePluginContext) => {
    return {
      name: '___registerCustomSetter___',
      async init() {
        const { setters } = ctx;

        setters.registerSetter('TitleSetter', TitleSetter);
        setters.registerSetter('BehaviorSetter', BehaviorSetter);
        setters.registerSetter('CustomSetter', CustomSetter);
        setters.registerSetter('TestSetter',TestSetter)
      },
    };
  }
  customSetter.pluginName = 'customSetter';
  await plugins.register(customSetter);
};
