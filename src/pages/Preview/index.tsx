import { useState, useEffect } from 'react';
import { buildComponents, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import { getPageSchemaFromLocalStorage, getPackagesFromLocalStorage } from '@/services/lowcode/local';
import { project } from '@alilc/lowcode-engine';

export default () => {
  const [data, setData] = useState<{ schema: any, components: any }>();

  async function init() {
    const packages = getPackagesFromLocalStorage();
    const projectSchema = getPageSchemaFromLocalStorage();
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
    setData({
      schema,
      components,
    });
  }

  useEffect(() => {
    init();
    console.log(123);
  }, []);

  return (data?.schema && (<ReactRenderer
    className="lowcode-plugin-sample-preview-content"
    schema={data.schema}
    components={data.components}
  />));
};

