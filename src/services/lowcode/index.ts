import { request } from '@umijs/max';
import { material, project } from '@alilc/lowcode-engine';
import { message } from 'antd';
import schema from '@/assets/schema';
import { IPublicTypePageSchema } from '@alilc/lowcode-types';
import { v4 as uuidv4 } from 'uuid';
import { modifyIndicatorData } from '@/services/ant-design-pro/tableData';

let defaultPageSchema: IPublicTypePageSchema = schema

export const saveSchema = async () => {
  const currentPageSchema = project.currentDocument?.exportSchema();
  localStorage.setItem("currentPageSchema", JSON.stringify(currentPageSchema));
  const currentPage = localStorage.getItem("indicator") || "";
  const result = await UpdateSchema(currentPageSchema)
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

  localStorage.setItem(
    scenarioName,
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

export const createSchema = async (pageName: string) => {
  //当文件路径为null的时候说明是新建的指标模型，直接使用默认Schema
  return await UpdateSchema({
    ...defaultPageSchema,
    id: uuidv4(),
    fileName: pageName
  })
}

export const getSchemaByUrl = async (schemaUrl: any) => {
  console.log(schemaUrl);
  return request(`${schemaUrl}`, {
    method: "GET",
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