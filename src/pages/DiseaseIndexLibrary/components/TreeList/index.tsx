import React, { Key, useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from '@umijs/max';
import { Tree, Modal, Form, Input, message, Button, Dropdown, Menu } from "antd";
import type { MenuProps } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  addCategory,
  deleteCategory,
  modifyCategory,
  addIndicator,
  deleteIndicator,
  modifyIndicator
} from '@/services/ant-design-pro/categroy'
import { getTargetNodeByKey } from '@/utils';
import styles from './index.less';
const { DirectoryTree, TreeNode } = Tree;

const TreeList = ({ TreeData, defaultKey, setIndicator }: { TreeData: any, defaultKey: string, setIndicator: any }) => {
  const [treeData, setTreeData] = useState<any>(TreeData || []);
  const [rightClickNodeTreeItem, setRightClickNodeTreeItem] = useState<any>(null)
  useEffect(() => {
    setTreeData(TreeData)
  }, [TreeData])

  // const getDefaultSelectKey = (defaultSelectNodeId: number) => {
  //   const quene = [...treeData]
  //   do {
  //     const current = quene.pop() // 改成pop，取最后一个，后入先出
  //     current.isTravel = true
  //     if (current.children) {
  //       quene.push(...[...current.children].reverse()) // 保证从左到右遍历
  //     }
  //     if (current.id === defaultSelectNodeId) {
  //       console.log("current.key", current);
  //       return current.key
  //     }
  //   } while (quene.length)
  //   return null;
  // }

  const onSelect = async (keys: Key[], e: any) => {
    const targetNode = getTargetNodeByKey(treeData, keys[0].toString().slice(1))
    await setIndicator(targetNode.id)
  }

  //右键菜单失去焦点时候关闭菜单
  const closeRightClickMenu = () => {
    setRightClickNodeTreeItem(null)
  }

  const RightClickTreeNode = ({ event, node }: any) => {
    event.stopPropagation();
    setRightClickNodeTreeItem({
      pageX: event.pageX,
      pageY: event.pageY,
      id: node.props.data["key"],
      categoryName: node.title.props["children"],
      nodeType: node.isLeaf
    })
  }

  const titleRender = (nodeData: any) => {
    return (
      <>
        {nodeData.title}
      </>

    )
  }

  const TreeNodeRender = (treeData = []) => {
    return treeData.map((item: any) => (
      <TreeNode
        title={titleRender(item)}
        isLeaf={item.isLeaf || false}
        key={item.key}
        selectable={item.isLeaf || false}
      >
        {TreeNodeRender(item.children)}
      </TreeNode>
    ))
  }

  return (
    <>
      <DirectoryTree
        defaultExpandAll={true}
        blockNode={true}
        selectable={true}
        onSelect={onSelect}
        onRightClick={RightClickTreeNode}
        selectedKeys={[defaultKey]}
      // defaultSelectedKeys={[getDefaultSelectKey(defaultIndicatorId)]}
      >
        {TreeNodeRender(treeData)}
      </DirectoryTree>
      <RightClickMenu
        rightClickNodeTreeItem={rightClickNodeTreeItem}
        closeRightClickMenu={closeRightClickMenu}
        treeData={treeData}
        setTreeData={setTreeData}
      />
    </>
  )
}

const Edit = (props: any) => {
  const [value, setValue] = useState(props.value)
  const [isEdit, setIsEdit] = useState(false)
  const handleChange = useCallback((e) => {
    setValue(e.target.value)
  }, [setValue])
  const handlePressEnter = useCallback(async (e) => {
    e.stopPropagation();
    const target = getTargetNodeByKey(props.target, props.currentKeyPath);
    if (props.nodeType) {
      const result = await modifyIndicator(target.id, {
        name: value,
        category_id: target.parent_id,
      })
      console.log(result);
      
      if (result) {
        props.setState((data: any) => {
          const copyData = data.concat([]);
          const current = target
          current.title = value // 给当前节点的title赋值
          return copyData;
        })
        setIsEdit(false)
      } else {
        message.error("修改失败请重试")
      }
    } else {
      const result = await modifyCategory(target.id, {
        name: value,
        parent_id: target.parent_id,
      });
      if (result) {
        props.setState((data: any) => {
          const copyData = data.concat([]);
          const current = target
          current.title = value // 给当前节点的title赋值
          return copyData;
        })
        setIsEdit(false)
      } else {
        message.error("修改失败请重试")
      }
    }
  }, [setValue, value])
  return (
    isEdit ?
      (<Input
        autoFocus={true}
        value={value}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
      />) : (<Button
        onClick={() => setIsEdit(true)}
        icon={<EditOutlined />}
        type='ghost'
        className={styles.TreeListButtonIcon}
      >修改标题</Button>)
  )
}

const RightClickMenu = (props: any) => {
  const { pathname } = useLocation();
  const { rightClickNodeTreeItem, closeRightClickMenu, treeData, setTreeData }: any = props
  const { pageX, pageY, id, categoryName, nodeType }: any = rightClickNodeTreeItem || {};

  const addChildrenNode = async (e: any, type: string = "common") => {
    e.stopPropagation();
    // const currentKeyPath = id.slice(1)
    const target = getTargetNodeByKey(treeData, id.slice(1));//(data,currentPath)
    console.log("target", target);
    if (type === "common") {  //添加分类
      const result = await addCategory({
        name: "新建分类",
        parent_id: target.id,
        study_id: ~~pathname.split("/")[3]
      })
      if (result.data) {
        const { name, parent_id, id } = result.data
        setTreeData((data: any) => {
          const copyData = data.concat([]);//将当前数组进行深度拷贝，对新数组进行修改并返回，否则视图不会更新
          const current = target // 拿到当前节点
            // 给children属性追加一个新节点
            ; (current.children || (current.children = [])).push({
              title: name,
              parent_id,
              id,
              key: `${current.key}.${current.children.length}`,
              isLeaf: false
            })
          return copyData
        })
      }
    } else if (type === "leaf") {   //添加指标模型
      const result = await addIndicator({
        table_name: "defaultName",
        name: "新建指标",
        study_id: ~~pathname.split('/')[3],
        category_id: target.id
      })
      if (result.data) {
        const { name, parent_id, id } = result.data
        setTreeData((data: any) => {
          const copyData = data.concat([]);//将当前数组进行深度拷贝，对新数组进行修改并返回，否则视图不会更新
          const current = target // 拿到当前节点
            // 给children属性追加一个新节点
            ; (current.children || (current.children = [])).push({
              title: name,
              parent_id,
              id,
              key: `${current.key}.${current.children.length}`,
              isLeaf: true
            })
          return copyData
        })
      }
    }
  }
  const deleteFromThisNode = async (e: any, nodeType: boolean) => {
    e.stopPropagation();
    const parentKeyPath = id.substring(0, id.length - 2).slice(1)
    const currentKeyPath = id.slice(1)
    const target = getTargetNodeByKey(treeData, id.slice(1));
    if (nodeType) {
      const result1 = await deleteIndicator({ target_id: target.id })
      if (result1) {
        setTreeData((data: any) => {
          const copyData = data.concat([]);
          if (parentKeyPath === '') {//删除的是根部节点之一
            copyData.splice(~~currentKeyPath, 1)
          } else {
            const parent = getTargetNodeByKey(data, parentKeyPath)
            parent.children.splice(~~currentKeyPath.charAt(currentKeyPath.length - 1), 1)
            // copyData.splice(~~currentKeyPath, 1)
          }
          return copyData
        })
      }
    } else {
      const result2 = await deleteCategory({ target_id: target.id })
      if (result2) {
        setTreeData((data: any) => {
          const copyData = data.concat([]);
          if (parentKeyPath === '') {//删除的是根部节点之一
            copyData.splice(~~currentKeyPath, 1)
          } else {
            const parent = getTargetNodeByKey(data, parentKeyPath)
            parent.children.splice(~~currentKeyPath.charAt(currentKeyPath.length - 1), 1)
          }
          return copyData
        })
      }
    }
  }

  const menu = (
    <div
      style={{
        position: "absolute",
        left: `${pageX - 270}px`,
        top: `${pageY - 60}px`
      }}
      className={styles.RightClickMenu}
      onMouseLeave={closeRightClickMenu}>
      <Button
        disabled={nodeType}
        onClick={(e) => addChildrenNode(e)}
        className={styles.TreeListButtonIcon}
        icon={<PlusCircleOutlined />}
        type='default'
      >添加分类</Button>
      <Button
        disabled={nodeType}
        onClick={(e) => addChildrenNode(e, "leaf")}
        className={styles.TreeListButtonIcon}
        icon={<PlusCircleOutlined />}
        type='default'
      >添加指标模型</Button>
      <Button
        onClick={(e) => deleteFromThisNode(e, nodeType)}
        className={styles.TreeListButtonIcon}
        icon={<DeleteOutlined />}
        type='default'
      >{`删除${nodeType ? "指标" : "目录"}`}</Button>
      <Edit
        nodeType={nodeType}
        target={treeData}
        value={categoryName || ""}
        currentKeyPath={id?.slice(1)}
        setState={setTreeData}
      />
    </div>
  )
  return rightClickNodeTreeItem ? menu : null;
}

export default TreeList;
