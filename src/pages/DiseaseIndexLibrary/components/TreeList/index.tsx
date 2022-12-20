import React, { Key, useRef, useState, useEffect, useCallback } from 'react';
import { Tree, Modal, Form, Input, message, Button } from "antd";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTargetNode } from '@/utils';
import styles from './index.less';
const { DirectoryTree, TreeNode } = Tree;

const TreeList = ({ TreeData, selectKey }: { TreeData: any, selectKey: any }) => {
  const [treeData, setTreeData] = useState<any>(TreeData || []);
  console.log("selectKey", selectKey);

  const onSelect = (keys: Key[]) => {
    console.log("select", keys);
  }

  const titleRender = (nodeData: any, index: number, info: any) => {
    return (<>
      {nodeData.title}
      <Button
        onClick={(e: any) => {
          e.stopPropagation();
          const currentKeyPath = `${info.key}.${index}`.slice(1)
          setTreeData((data: any) => {
            const copyData = data.concat([]);//将当前数组进行深度拷贝，对新数组进行修改并返回，否则视图不会更新
            const current = getTargetNode(data, currentKeyPath) // 拿到当前节点
              // 给children属性追加一个新节点
              ; (current.children || (current.children = [])).push({ title: '新增的节点' })
            return copyData
          })
        }}
        className={styles.TreeListButtonIcon}
        icon={<PlusCircleOutlined />}
        type='ghost'
      />
      <Button onClick={(e: any) => {
        e.stopPropagation();
        const currentKeyPath = `${info.key}`.slice(1)
        setTreeData((data: any) => {
          const copyData = data.concat([]);
          const current = getTargetNode(data, currentKeyPath)
          current.children.splice(index, 1)
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
        currentKeyPath={`${info.key}.${index}`.slice(1)}
        setState={setTreeData}
      />
    </>)
  }

  const TreeNodeRender = (treeData = [], info = { path: '', key: '' }) => {
    return treeData.map((item: any, index: number) => (
      <TreeNode
        title={titleRender(item, index, info)}
        isLeaf={item.isLeaf || false}
        selectable={item.isLeaf || false}
        // selected={item.id === selectKey}
      >
        {TreeNodeRender(item.children, { path: `${info.path}/${item.title}`, key: `${info.key}.${index}` })}
      </TreeNode>
    ))
  }

  return (
    <DirectoryTree
      defaultExpandAll={true}
      blockNode={true}
      selectable={true}
      showLine
      onSelect={onSelect}
      onRightClick={()=>console.log("RightClick")}
      defaultSelectedKeys={[selectKey]}
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
    props.setState((data:any)=>{
      const copyData = data.concat([]);
      const current = getTargetNode(props.target, props.currentKeyPath)
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
        onClick={()=>setIsEdit(true)}
        icon={<EditOutlined />} 
        type='ghost' 
        className={styles.TreeListButtonIcon}
        />)
  )
}

export default TreeList;
