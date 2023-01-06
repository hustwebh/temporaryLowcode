import { PageSchema, TransformStage } from '@alilc/lowcode-types';
import { SelectInfo } from 'rc-menu/lib/interface';
import { useEffect, useState } from 'react';
import { project } from '@alilc/lowcode-engine';
import {
  Row,
  Col,
  Form,
  Menu,
  Input,
  Modal,
  Space,
  Button,
  Upload,
  Divider,
  message
} from 'antd';

import { modifyIndicatorData } from '@/services/ant-design-pro/tableData';
import { getAllCategories } from '@/services/ant-design-pro/categroy';
import { getSchema, createSchema, UpdateSchema } from '@/services/lowcode';
import { pageMsgToMenu, findTargetInMenuData, deepEquals, getFirstNodeFromTree } from "@/utils"
import { FileAddOutlined, ExportOutlined, ImportOutlined, DeleteTwoTone } from '@ant-design/icons'

import schema from '@/assets/schema'
import { compact } from '@umijs/deps/compiled/lodash';

// let defaultPageSchema: PageSchema = require('../schema.json')
// let defaultPageSchema: PageSchema = schema
let { pathname } = location

export default () => {
  //获得页面信息
  const [pagesMenu, setPagesMenu] = useState<any[]>([]);
  // 当前页面
  const [currentPage, setCurrentPage] = useState(localStorage.getItem("indicator") || "");
  // 新建页面弹窗是否可见
  // const [createPageModalVisible, setPageModalVisible] = useState(false);

  useEffect(() => {
    awaitInitPagesMsg();//获取Menu菜单信息并且重置页面Schema为对应进入的指标模型的Schema
  }, []);

  const awaitInitPagesMsg = async () => {
    //将页面信息和对应schema.json文件分开获取,首先获取页面信息
    const MenuData = pageMsgToMenu(await getAllCategories({ study_id: ~~pathname.split('/')[1] }))
    console.log("MenuData", MenuData);
    setPagesMenu(MenuData)
    //由于信息分开获取,选择从进入的指标模型作为默认页面:
    const defaultPage = findTargetInMenuData(MenuData, currentPage)
    //接下来要设置获取对应Schema文件的逻辑
    if (defaultPage && !defaultPage.page_url) { //页面page_url为null
      const pageSchemaLink = await createSchema(defaultPage.table_name)
      const pageSchemaJSON = await getSchema(pageSchemaLink[0].url)
      //将获取的Schema渲染到页面中
      project.currentDocument && project.removeDocument(project.currentDocument);
      project.openDocument(pageSchemaJSON);
      //调用接口让后台存储指标模型的page_url属性发生更新
      await modifyIndicatorData(~~currentPage, { page_url: pageSchemaLink[0].url })
      //将当前Schema对象存储到本地，便于切换时对比
      localStorage.setItem("currentSchema", JSON.stringify(pageSchemaJSON))
      return;
    }
    const pageSchema = await getSchema(defaultPage?.page_url)
    project.currentDocument && project.removeDocument(project.currentDocument);
    project.openDocument(pageSchema);
    localStorage.setItem("currentSchema", JSON.stringify(pageSchema))
  }

  // /** 开启/关闭新建页面弹窗 */
  // const openCreatePageModal = () => setPageModalVisible(true);
  // const closeCreatePageModal = () => setPageModalVisible(false);

  // /** 新建页面 */
  // const createPage = (values: ICreateFormFieldsValue) => {
  //   const { fileName } = values
  //   defaultPageSchema.fileName = fileName
  //   fetch(`${baseUrl}/page/${fileName}`, {
  //     method: 'POST',
  //     body: JSON.stringify({ pageSchema: defaultPageSchema }),
  //     headers: { 'content-type': 'application/json;charset=UTF-8' }
  //   })
  //     .then((res) => res.json())
  //     .then((resJson: { code: 0 | -1, msg: string }) => {
  //       if (resJson.code === 0) {
  //         message.success(resJson.msg)
  //         getPages();
  //         createPageForm.resetFields();
  //         setPageModalVisible(false);
  //       } else {
  //         message.error(resJson.msg)
  //       }
  //     })
  // };

  // /** 导出 */
  // const exportAllPageSchema = () => {
  //   const blob = new window.Blob([JSON.stringify(pages)], {
  //     type: 'application/json;charset=UTF-8',
  //   });
  //   const downloadUrl = URL.createObjectURL(blob);
  //   const downloadLinkDOM = document.createElement('a');
  //   downloadLinkDOM.href = downloadUrl;
  //   downloadLinkDOM.download = 'schema.json';
  //   downloadLinkDOM.click();
  //   URL.revokeObjectURL(downloadUrl);
  // };

  // /** 导入 */
  // const importAllPageSchema = (info: UploadChangeParam) => {
  //   if (info.file.status === 'done') {
  //     const file = info.file.originFileObj;
  //     const fileReader = new FileReader();
  //     fileReader.readAsText(file!);
  //     fileReader.onload = () => {
  //       // 具体逻辑待补充
  //       // const allPageSchema = JSON.parse(fileReader.result as string);
  //       // let pageId;
  //       // allPageSchema.forEach((item: string[], index: number) => {
  //       //   if (index === 0) pageId = item[0].split(':')[0];
  //       //   localStorage.setItem(item[0], item[1]);
  //       // });
  //       // message.success('导入成功');
  //       // getPages();
  //       // setCurrentPage(pageId);
  //       // saveSchema();
  //     };
  //   }
  // };

  /** 保存页面 */
  const savePage = async () => {
    //获取当前页面Schema对象
    const pageSchema = project.currentDocument?.exportSchema(TransformStage.Save)
    localStorage.setItem("currentSchema",JSON.stringify(pageSchema))
    const res = await UpdateSchema(pageSchema);
    if (res) {
      const copyData = [...pagesMenu].concat([]);
      const target = findTargetInMenuData(pagesMenu, currentPage)
      // const target = findTargetInMenuData(pagesMenu, localStorage.getItem("indicator"))
      if (target) {
        target.page_url = res[0].url;
      }
      await modifyIndicatorData(~~currentPage, { page_url: res[0].url })
      setPagesMenu(copyData)
    }
  }

  const handleSelect = async ({ selectedKeys }: SelectInfo) => {
    console.log("selectedKeys", selectedKeys[0]);
    const prevCurrentPage = currentPage
    const selectedKey = selectedKeys[0];
    setCurrentPage(selectedKey);
    const pageSchema = project.currentDocument?.exportSchema(TransformStage.Save)//切换前的Schema
    console.log(pageSchema);
    // 在线保存,
    if (deepEquals(pageSchema, JSON.parse(localStorage.getItem("currentSchema") || ""))) {
      console.log(123);
      savePage()
        .then(async () => {//确保在线保存成功后再切其他页面
          const newPageObj = findTargetInMenuData(pagesMenu, selectedKey);
          console.log("newPageObj", newPageObj);
          //接下来做的是获取新页面的Schema并且渲染
          if (newPageObj && !newPageObj.page_url) {
            const pageSchemaLink = await createSchema(newPageObj.table_name)
            const pageSchemaJSON = await getSchema(pageSchemaLink[0].url)
            project.currentDocument && project.removeDocument(project.currentDocument);
            project.openDocument(pageSchemaJSON);
            await modifyIndicatorData(~~selectedKey, { page_url: pageSchemaLink[0].url })
            localStorage.setItem("currentSchema", JSON.stringify(pageSchemaJSON))
            return;
          }
          const pageSchema = await getSchema(newPageObj?.page_url)
          project.currentDocument && project.removeDocument(project.currentDocument);
          project.openDocument(pageSchema);
          localStorage.setItem("currentSchema", JSON.stringify(pageSchema))
          // 为了更快地将所点击页面的 schema 渲染到画布上，重新获取所有页面的数据这一操作可以晚点再做
        })
        .catch(() => {
          // 如果在线保存失败，页面菜单高亮项切回前一个页面
          setCurrentPage(prevCurrentPage)
          message.error("页面保存失败，请重试")
        })
    }
  };

  return (
    <>
      {/* <Row gutter={8} style={{ paddingLeft: 14 }}>
        <Col>
          <Button
            size="small"
            icon={<FileAddOutlined />}
            onClick={openCreatePageModal}
          >
            新建
          </Button>
        </Col>
        <Col>
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={exportAllPageSchema}

          >
            导出
          </Button>
        </Col>
        <Col>
          <Upload
            showUploadList={false}
            onChange={importAllPageSchema}
          >
            <Button
              size="small"
              icon={<ImportOutlined />}
              disabled
            >
              导入
            </Button>
          </Upload>
        </Col>
      </Row> */}
      <Divider style={{ marginTop: 14, marginBottom: 0 }} />
      <Menu
        items={pagesMenu}
        mode="inline"
        selectedKeys={[currentPage]}
        onSelect={handleSelect}
      />
    </>
  );
};