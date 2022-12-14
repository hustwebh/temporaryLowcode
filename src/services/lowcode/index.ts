import { request } from '@umijs/max';
import { material, project } from '@alilc/lowcode-engine';
import { message } from 'antd';
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { TransformStage } from '@alilc/lowcode-types';
import schema from '@/assets/schema';
import { PageSchema } from '@alilc/lowcode-types';
import { v4 as uuidv4 } from 'uuid';

let defaultPageSchema: PageSchema = schema

const getLSName = (scenarioName: string, ns: string = 'projectSchema') => `${scenarioName}:${ns}`;

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName)) || '{}');
}

const setProjectSchemaToLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  window.localStorage.setItem(
    getLSName(scenarioName),
    JSON.stringify(project.exportSchema(TransformStage.Save))
  );
}

const setPackgesToLocalStorage = async (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  const packages = await filterPackages(material.getAssets().packages);
  window.localStorage.setItem(
    getLSName(scenarioName, 'packages'),
    JSON.stringify(packages),
  );
}

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '[]');
}

export const saveSchema = async (scenarioName: string = 'index') => {
  setProjectSchemaToLocalStorage(scenarioName);

  await setPackgesToLocalStorage(scenarioName);
  // window.localStorage.setItem(
  //   'projectSchema',
  //   JSON.stringify(project.exportSchema(TransformStage.Save))
  // );
  // const packages = await filterPackages(material.getAssets().packages);
  // window.localStorage.setItem(
  //   'packages',
  //   JSON.stringify(packages)
  // );
  message.success('?????????????????????');
};

export const resetSchema = async (scenarioName: string = 'index') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '??????????????????????????????????????????????????????',
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject()
        },
      })
    })
  } catch (err) {
    return
  }

  window.localStorage.setItem(
    getLSName(scenarioName),
    JSON.stringify({
      componentsTree: [{ componentName: 'Page', fileName: 'sample' }],
      componentsMap: material.componentsMap,
      version: '1.0.0',
      i18n: {},
    })
  );
  project.getCurrentDocument()?.importSchema({ componentName: 'Page', fileName: 'sample' });
  project.simulatorHost?.rerender();
  message.success('??????????????????');
}

export const createSchema = async (pageName:string) => {
  //??????????????????null????????????????????????????????????????????????????????????Schema
  return await UpdateSchema({
    ...defaultPageSchema,
    id: uuidv4(),
    fileName: pageName
  })
}
export const getSchema = async (schemaUrl: any) => {
  return request(`${schemaUrl}`, {
    method: "GET",
    // responseType:'blob',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  })
}
export const UpdateSchema = async (schemaString: any) => {
  const blob = new Blob([JSON.stringify(schemaString)], {
    type: 'application/json;charset=UTF-8'
  })
  const schemaFile = new FormData();
  schemaFile.append('file', blob, 'schema.json');
  console.log("schemaFile", schemaFile);
  return request(`/api/cms/file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: schemaFile
  })
}