import { Link } from 'umi';
import { EditOutlined,CloseOutlined } from '@ant-design/icons';
import { Button, Tooltip, Space } from 'antd';

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
export function _MenuItemRender(name: string,categoryId:number) {
  return (
    <div
      style={{
        display: 'flex',
        // alignItems: 'center',
        justifyContent:'space-between',
        gap: 8,
      }}
    >
      <div>{name}</div>
      <div>
      <Tooltip title="编辑">
        <Button 
        type="ghost"
        style={{border:"none"}}
        icon={<EditOutlined style={{color:"#1890ff"}}/>} 
        onClick={()=>{console.log(123)}}/>
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
