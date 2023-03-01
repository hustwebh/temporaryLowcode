import { createSchema,getSchemaByUrl } from "@/services/lowcode";
import { modifyIndicatorData } from '@/services/ant-design-pro/tableData';

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