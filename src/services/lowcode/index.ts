import { request } from '@umijs/max';
import { material, project } from '@alilc/lowcode-engine';
import { message } from 'antd';
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { TransformStage } from '@alilc/lowcode-types';
import schema from '@/assets/schema';
import { PageSchema } from '@alilc/lowcode-types';
import { v4 as uuidv4 } from 'uuid';
import { modifyIndicatorData, getIndicatorData } from '@/services/ant-design-pro/tableData';
import { createFormSchemaByData } from '@/utils'

let defaultPageSchema: PageSchema = schema

const getLSName = (scenarioName: string, ns: string = 'projectSchema') => `${scenarioName}:${ns}`;

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName)) || '{}');
}

// const setProjectSchemaToLocalStorage = (scenarioName: string) => {
//   if (!scenarioName) {
//     console.error('scenarioName is required!');
//     return;
//   }
//   window.localStorage.setItem(
//     getLSName(scenarioName),
//     JSON.stringify(project.exportSchema(TransformStage.Save))
//   );
// }

const setPackgesToLocalStorage = async () => {
  const packages = await filterPackages(material.getAssets().packages);
  localStorage.setItem('packages', JSON.stringify(packages));
}

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '[]');
}

export const getSchemaByPageObj = async (defaultPage: any, currentPage: string) => {
  const { page_url, table_name } = defaultPage;
  let pageSchema;

  if (!page_url) {
    //页面page_url为null,此时需要先生成一个默认的Schema来填充低代码工作区
    const pageSchemaLink = await createSchema(table_name)
    //调用接口让后台存储指标模型的page_url属性发生更新
    await modifyIndicatorData(~~currentPage, { page_url: pageSchemaLink[0].url })
    pageSchema = await getSchemaByUrl(pageSchemaLink[0].url)
  }
  else pageSchema = await getSchemaByUrl(page_url)
  return pageSchema
}

export const saveSchema = async () => {
  const currentSchema = project.currentDocument?.exportSchema();
  localStorage.setItem("currentSchema", JSON.stringify(currentSchema));
  const currentPage = localStorage.getItem("indicator") || "";
  const result = await UpdateSchema(currentSchema)
  await modifyIndicatorData(~~currentPage, { page_url: result[0].url })
  message.success('成功保存');
};

export const resetSchema = async (scenarioName: string = 'antd') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '确定要重置吗？您所有的修改都将消失！',
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
  message.success('成功重置页面');
}

export const insertForm = async () => {
  const data = await getIndicatorData(~~(localStorage.getItem("indicator") || ""))
  const targetForm = createFormSchemaByData(data);
  let currentPageSchema = project.currentDocument?.exportSchema();
  if (currentPageSchema?.children) {
    currentPageSchema.children.push(targetForm)
  } else {
    currentPageSchema.children = targetForm
  }
  project.currentDocument && project.removeDocument(project.currentDocument);
  project.openDocument(currentPageSchema)
}

export const createSchema = async (pageName: string) => {
  //当文件路径为null的时候说明是新建的指标模型，直接使用默认Schema
  return await UpdateSchema({
    ...defaultPageSchema,
    id: uuidv4(),
    fileName: pageName
  })
}

export const getSchemaByUrl = async (schemaUrl: any) => {
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
  return request(`/api/cms/file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: schemaFile
  })
}