import React, { Key, useRef, useState, useEffect, useCallback } from 'react';
import { Tree, Modal, Form, Input, message, Button } from "antd";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTargetNodeByKey } from '@/utils';
import styles from './index.less';
import { AnyKindOfDictionary } from 'lodash';
const { DirectoryTree, TreeNode } = Tree;

const TreeList = ({ TreeData, defaultIndicatorId, setIndicator }: { TreeData: any, defaultIndicatorId: any, setIndicator: any }) => {
  const [treeData, setTreeData] = useState<any>(TreeData || []);
  // console.log("defaultIndicatorId", defaultIndicatorId);
  console.log("treeData", treeData);

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

  const titleRender = (nodeData: any) => {
    return (<>
      {nodeData.title}
      <Button
        onClick={(e: any) => {
          e.stopPropagation();
          const currentKeyPath = nodeData.key.slice(1)
          setTreeData((data: any) => {
            const copyData = data.concat([]);//将当前数组进行深度拷贝，对新数组进行修改并返回，否则视图不会更新
            const current = getTargetNodeByKey(data, currentKeyPath) // 拿到当前节点
              // 给children属性追加一个新节点
              ; (current.children || (current.children = [])).push({
                title: '新增的节点',
                key: `${current.key}.${current.children.length}`
              })
            return copyData
          })
        }}
        className={styles.TreeListButtonIcon}
        icon={<PlusCircleOutlined />}
        type='ghost'
      />
      <Button onClick={(e: any) => {
        e.stopPropagation();
        console.log("nodeData", nodeData);
        const parentKeyPath = nodeData.key.substring(0, nodeData.key.length - 2).slice(1)
        console.log("parentKeyPath", parentKeyPath);
        const currentKeyPath = nodeData.key.slice(1)
        console.log("currentKeyPath", currentKeyPath);
        setTreeData((data: any) => {
          const copyData = data.concat([]);
          const current = getTargetNodeByKey(data, currentKeyPath)
          console.log("current", current);
          if(parentKeyPath ==='') {//删除的是根部节点之一
            copyData.splice(~~currentKeyPath,1)
          }else {
            const parent = getTargetNodeByKey(data, parentKeyPath)
            parent.children.splice(~~currentKeyPath,1)
          }
          return copyData
        })
      }}
        className={styles.TreeListButtonIcon}
        icon={<DeleteOutlined />}
        type='ghost'
      />
      <Edit
        target={treeData}
        value={nodeData.value}
        currentKeyPath={nodeData.key.slice(1)}
        setState={setTreeData}
      />
    </>)
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
    <DirectoryTree
      defaultExpandAll={true}
      blockNode={true}
      selectable={true}
      // showLine
      onSelect={onSelect}
      onRightClick={() => console.log("RightClick")}
    // defaultSelectedKeys={[getDefaultSelectKey(defaultIndicatorId)]}
    >
      {TreeNodeRender(treeData)}
    </DirectoryTree>
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
      />)
  )
}

export default TreeList;
