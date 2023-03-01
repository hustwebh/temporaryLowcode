import { SelectInfo } from 'rc-menu/lib/interface';
import { useEffect, useState } from 'react';
import { project } from '@alilc/lowcode-engine';
import {
  Menu,
  Divider,
  message
} from 'antd';

import { modifyIndicatorData } from '@/services/ant-design-pro/tableData';
import { getAllCategories } from '@/services/ant-design-pro/categroy';
import { UpdateSchema } from '@/services/lowcode';
import { setPageSchemaToLocalStorage } from '@/services/lowcode/local';
import { getSchemaByPageObj } from './magageFunc';
import { pageMsgToMenu, findTargetInMenuData, treeForeach, deepEquals } from "@/utils";

let { pathname } = location

export default () => {
  //获得页面信息
  const [pagesMenu, setPagesMenu] = useState<any[]>([]);
  // 当前页面
  const [currentPage, setCurrentPage] = useState<string>(localStorage.getItem("indicator") || "");
  const [openKeys, setOpenKeys] = useState<any>([]);
  const [rootSubmenuKeys, setRootSubmenuKeys] = useState<string[]>([]);
  useEffect(() => {
    awaitInitPagesMsg();//获取Menu菜单信息并且重置页面Schema为对应进入的指标模型的Schema
  }, []);

  const awaitInitPagesMsg = async () => {
    //将页面信息和对应schema.json文件分开获取,首先获取页面信息
    const MenuData = pageMsgToMenu(await getAllCategories({ study_id: ~~pathname.split('/')[1] }))
    const selectNode = treeForeach(MenuData, (item: any) => {
      if (item.id.toString() === currentPage) return item;
    })
    const targetSubMenu = treeForeach(MenuData, (item: any) => {
      if (item.id.toString() === selectNode.category_id.toString()) return item;
    })
    setPagesMenu(MenuData)
    setOpenKeys([targetSubMenu.key.toString()])
    setRootSubmenuKeys(MenuData.map((item: any) => item.key.toString()))
  }
  const onOpenChange = (keys: any) => {
    const latestOpenKey = keys.find((key: string) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  }

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
    const pageSchema = project.currentDocument?.exportSchema()
    const res = await UpdateSchema(pageSchema);
    if (res) {
      //将当前schema上传获取新的链接然后更新指标列表里面的对应page_url
      const copyData = [...pagesMenu].concat([]);
      const target = findTargetInMenuData(copyData, currentPage)
      if (target) {
        target.page_url = res[0].url;
      }
      await modifyIndicatorData(target.id, { page_url: res[0].url })
      setPagesMenu(copyData)
    }
  }

  const handleSelect = async ({ selectedKeys }: SelectInfo) => {
    const prevCurrentPage = currentPage
    const selectedKey = selectedKeys[0];
    setCurrentPage(selectedKey);
    // 在线保存,
    // if (deepEquals(pageSchema, JSON.parse(localStorage.getItem("currentPageSchema") || ""))) {
    savePage()
      .then(async () => {//确保在线保存成功后再切其他页面
        const newPageObj = findTargetInMenuData(pagesMenu, selectedKey);
        localStorage.setItem("indicator", selectedKey)
        //接下来做的是获取新页面的Schema并且渲染
        const pageSchema = await getSchemaByPageObj(newPageObj, selectedKey)
        project.currentDocument && project.removeDocument(project.currentDocument);
        project.openDocument(pageSchema);
        setPageSchemaToLocalStorage(pageSchema);
        // 为了更快地将所点击页面的 schema 渲染到画布上，重新获取所有页面的数据这一操作可以晚点再做
      })
      .catch(() => {
        // 如果在线保存失败，页面菜单高亮项切回前一个页面
        setCurrentPage(prevCurrentPage)
        message.error("页面保存失败，请重试")
      })
    // }
  };

  return (
    <>
      <Divider style={{ marginTop: 14, marginBottom: 0 }} />
      <Menu
        items={pagesMenu}
        mode="inline"
        selectedKeys={[currentPage]}
        onSelect={handleSelect}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
      />
    </>
  );
};