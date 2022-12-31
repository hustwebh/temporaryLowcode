import React, { Key, useRef, useState, useEffect, useCallback } from 'react';
import { Tree, Modal, Form, Input, message, Button, Dropdown, Menu } from "antd";
import type { MenuProps } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTargetNodeByKey } from '@/utils';
import styles from './index.less';
const { DirectoryTree, TreeNode } = Tree;

const TreeList = ({ TreeData, defaultIndicatorId, setIndicator }: { TreeData: any, defaultIndicatorId: any, setIndicator: any }) => {
  const [treeData, setTreeData] = useState<any>(TreeData || []);
  const [rightClickNodeTreeItem, setRightClickNodeTreeItem] = useState<any>(null)
  // console.log("defaultIndicatorId", defaultIndicatorId);
  useEffect(() => {
    setTreeData(TreeData)
  }, [TreeData])
  // useEffect(() => {
  //   openRightClickMenu()
  // }, [rightClickNodeTreeItem])

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

  const onSelect = (keys: Key[], e: any) => {
    console.log("select", keys);
    // const targetNode = getTargetNodeByKey(treeData, keys.toString())
    // setIndicator(targetNode.id)
  }

  //右键菜单失去焦点时候关闭菜单
  const closeRightClickMenu = () => {
    setRightClickNodeTreeItem(null)
  }

  const RightClickTreeNode = ({ event, node }: any) => {
    console.log(event, node);
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
  const handleBlur = useCallback((e) => {
    e.stopPropagation();
    props.setState((data: any) => {
      const copyData = data.concat([]);
      const current = getTargetNodeByKey(props.target, props.currentKeyPath)
      current.title = value // 给当前节点的title赋值
      return copyData;
    })
    setIsEdit(false)
  }, [setValue, value])
  return (
    isEdit ?
      (<Input
        autoFocus={true}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />) : (<Button
        onClick={() => setIsEdit(true)}
        icon={<EditOutlined />}
        type='ghost'
        className={styles.TreeListButtonIcon}
      >修改标题</Button>)
  )
}

const RightClickMenu = (props: any) => {
  const { rightClickNodeTreeItem, closeRightClickMenu, treeData, setTreeData }: any = props
  const { pageX, pageY, id, categoryName, nodeType }: any = rightClickNodeTreeItem || {};

  const addChildrenNode = (e: any, type: string = "common") => {
    e.stopPropagation();
    const currentKeyPath = id.slice(1)
    setTreeData((data: any) => {
      const copyData = data.concat([]);//将当前数组进行深度拷贝，对新数组进行修改并返回，否则视图不会更新
      const current = getTargetNodeByKey(data, currentKeyPath) // 拿到当前节点
        // 给children属性追加一个新节点
        ; (current.children || (current.children = [])).push({
          title: '新增的节点',
          key: `${current.key}.${current.children.length}`,
          isLeaf: type === "leaf" ? true : false
        })
      return copyData
    })
  }
  const deleteFromThisNode = (e: any) => {
    e.stopPropagation();
    const parentKeyPath = id.substring(0, id.length - 2).slice(1)
    const currentKeyPath = id.slice(1)
    setTreeData((data: any) => {
      const copyData = data.concat([]);
      const current = getTargetNodeByKey(data, currentKeyPath)
      if (parentKeyPath === '') {//删除的是根部节点之一
        copyData.splice(~~currentKeyPath, 1)
      } else {
        const parent = getTargetNodeByKey(data, parentKeyPath)
        parent.children.splice(~~currentKeyPath, 1)
      }
      return copyData
    })
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
        onClick={deleteFromThisNode}
        className={styles.TreeListButtonIcon}
        icon={<DeleteOutlined />}
        type='default'
      >{`删除${nodeType ? "指标" : "目录"}`}</Button>
      <Edit
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
