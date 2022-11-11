

export function checkBoxCanSelect(item: any): boolean {
  const { pathname } = location;
  return item.id.toString() == pathname.split('/').pop()
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

export function fileToJson(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = res => {
      const { result }  = res.target // 得到字符串
      console.log("result",res);
      
      const data = JSON.parse(result) // 解析成json对象
      resolve(data)
    } // 成功回调
    reader.onerror = err => {
      reject(err)
    } // 失败回调
    reader.readAsText(new Blob([file]), 'utf-8') // 按照utf-8编码解析
  })
}
