import { EditOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

export function checkBoxCanSelect(item: any, indicatorsId: number | null): boolean {
  if (indicatorsId) {
    return item.id.toString() == indicatorsId.toString()
  }
  return false
}

export function pageMsgToMenu(flatDataArr: any[], parentId: number | null) {
  let newArr: any[] = []
  flatDataArr.forEach(item => {
    if (item.parent_id === parentId) {
      item.key = item.id.toString()
      item.label = item.name
      let child = pageMsgToMenu(flatDataArr, item.id)
      if (child.length > 0) {
        item.children = child
      }
      newArr.push(item)
    }
  })
  return newArr;
}

export function getFirstNodeFromTree(TreeData: any): any {
  if (!TreeData[0].children) return TreeData[0];
  else return getFirstNodeFromTree(TreeData[0].children)
}

//把文件解析为JSON对象
export function fileToJson(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = res => {
      const { result } = res.target // 得到字符串
      console.log("result", res);

      const data = JSON.parse(result) // 解析成json对象
      resolve(data)
    } // 成功回调
    reader.onerror = err => {
      reject(err)
    } // 失败回调
    reader.readAsText(new Blob([file]), 'utf-8') // 按照utf-8编码解析
  })
}

/** 自定义实现对Menu组件内容的自定义渲染*/
export function _MenuItemRender(name: string, categoryId: number) {
  return (
    <div
      style={{
        display: 'flex',
        // alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <div>{name}</div>
      <div>
        <Tooltip title="编辑">
          <Button
            type="ghost"
            style={{ border: "none" }}
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => { console.log(123) }} />
        </Tooltip>
        {/* <Tooltip title="删除">
        <Button 
        type="ghost"
        style={{border:"none"}}
        icon={<CloseOutlined style={{color:"red"}}/>} 
        onClick={()=>{console.log(123)}}/>
      </Tooltip> */}
      </div>
    </div>
  )
}

/* 专门处理树列表中的指标模型项，使其符合属性antd Tree组件的数据格式 */
function indicatorsDataToTree(indicatorsData: any) {
  return indicatorsData.map((item: any) => ({
    title: item.name,
    id: item.id,
    parent_id: item.category_id,
    isLeaf: true
  }))
}

/* 将接口获得的不规范格式数据转化成符合属性组件规范的格式 */
export function categoriesAndIndicatorsDataToTreeWithoutKey(originalData: any) {
  return originalData.map((item: any) => {
    if (!item.children || !item.children.length) {
      return {
        title: item.name,
        id: item.id,
        parent_id: item.parent_id,
        children: indicatorsDataToTree(item.model_list || [])
      }
    }
    return {
      title: item.name,
      id: item.id,
      parent_id: item.parent_id,
      children: [...categoriesAndIndicatorsDataToTreeWithoutKey(item.children), ...indicatorsDataToTree(item.model_list)]
    }
  })
}

/* 将树形数据添加key便于后续增删改查操作 */
export function TreeDataWithoutKeyToTreeData(treeDataWithoutKey: any, key: string = '') {
  return treeDataWithoutKey.map((item: any, index: number) => {
    if (!item.children || !item.children.length) {
      return {
        ...item,
        key: `${key}.${index}`
      }
    }
    return {
      ...item,
      key: `${key}.${index}`,
      children: TreeDataWithoutKeyToTreeData(item.children, `${key}.${index}`)
    }
  })
}

/* 寻找Tree组件的初始选中项 */
export function findFirstSelectKey(TreeData: any) {
  for (let i = 0; i < TreeData.length; i++) {
    if (TreeData[i].children.length > 1) {
      return TreeData[i].children[1].id;
    }
    if (TreeData[i].children && !TreeData[i].isLeaf) {
      continue;
    }
  }
}

/* 从属性结构中获取到操作的节点对象 */
export function getTargetNodeByKey(target: any, keysStr: string) {
  const keys = keysStr.split('.');
  let res = target[keys.shift()]
  while (res && keys.length) {
    res = res.children[keys.shift()]
  }
  return res
}
