import { useState, useEffect } from 'react';
import { buildComponents, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import { getProjectSchemaFromLocalStorage, getPackagesFromLocalStorage } from '@/services/lowcode';

// import * as CodeGenerator from '@alilc/lowcode-code-generator/standalone-loader';

export default () => {
  const [data, setData] = useState<{ schema: any, components: any }>();

  async function init() {
    const scenarioName = 'antd';
    const packages = getPackagesFromLocalStorage(scenarioName);
    const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);
    const { componentsMap: componentsMapArray = [], componentsTree = [] } = projectSchema;
    const componentsMap: any = {};
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component;
    });
    const schema = componentsTree[0];

    const libraryMap = {};
    const libraryAsset = [];
    packages.forEach(({ package: _package, library, urls, renderUrls }) => {
      libraryMap[_package] = library;
      if (renderUrls) {
        libraryAsset.push(renderUrls);
      } else if (urls) {
        libraryAsset.push(urls);
      }
    });

    const assetLoader = new AssetLoader();
    await assetLoader.load(libraryAsset);
    const components = await injectComponents(buildComponents(libraryMap, componentsMap));

    console.log("schema", schema);


    // await CodeGenerator.init();

    // const result = await CodeGenerator.generateCode({
    //   solution: 'icejs', // 出码方案 (目前内置有 icejs 和 rax )
    //   schema, // 编排搭建出来的 schema
    // });
    // console.log("出码方案:",result);


    setData({
      schema,
      components,
    });
  }

  useEffect(() => {
    init();

  }, []);

  return (data?.schema && (<ReactRenderer
    className="lowcode-plugin-sample-preview-content"
    schema={data.schema}
    components={data.components}
  />));
};

