import { v4 as uuidv4 } from 'uuid';

export function checkBoxCanSelect(item: any, indicatorsId: number | null): boolean {
  if (indicatorsId) {
    return item.id.toString() == indicatorsId.toString()
  }
  return false
}

export function createFormSchemaByData(data: any) {
  const { field_list } = data;
  let formSchema = createFormSchema();
  let formChildren = field_list.map((item: any) => {
    const { name, field_name, dict_values } = item;
    let formItemSchema = createFormItemSchema({ name, field_name });
    formItemSchema.children = createRadioGroupSchema({ dict_values });
    return formItemSchema;
  })
  formSchema.children = formChildren;
  return formSchema;
}
function createFormSchema() {
  return {
    "componentName": "Form",
    "id": uuidv4(),
    "props": {
      "labelCol": {
        "span": 6
      },
      "wrapperCol": {
        "span": 14
      },
      "onValuesChange": {
        "type": "JSExpression",
        "value": "function() {\n      const self = this;\n      try {\n        return (function onValuesChange(changedValues, allValues) {\n  console.log('onValuesChange', changedValues, allValues);\n}).apply(self, arguments);\n      } catch(e) {\n        console.log('call function which parsed by lowcode failed: ', e);\n        return e.message;\n      }\n    }"
      },
      "onFinish": {
        "type": "JSExpression",
        "value": "function() {\n      const self = this;\n      try {\n        return (function onFinish(values) {\n  console.log('onFinish', values);\n}).apply(self, arguments);\n      } catch(e) {\n        console.log('call function which parsed by lowcode failed: ', e);\n        return e.message;\n      }\n    }"
      },
      "onFinishFailed": {
        "type": "JSExpression",
        "value": "function() {\n      const self = this;\n      try {\n        return (function onFinishFailed({ values, errorFields, outOfDate }) {\n  console.log('onFinishFailed', values, errorFields, outOfDate);\n}).apply(self, arguments);\n      } catch(e) {\n        console.log('call function which parsed by lowcode failed: ', e);\n        return e.message;\n      }\n    }"
      },
      "name": "basic",
      "ref": "form_fqup",
      "colon": true,
      "hideRequiredMark": false,
      "labelAlign": "right",
      "layout": "horizontal",
      "preserve": true,
      "scrollToFirstError": true,
      "size": "middle",
      "validateMessages": {
        "required": "'${name}' 不能为空"
      }
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  }
}

function createFormItemSchema({ name, field_name }: {
  name: string;
  field_name: string
}) {
  return {
    "componentName": "Form.Item",
    "id": uuidv4(),
    "props": {
      "label": name || "表单项",
      "labelAlign": "right",
      "colon": true,
      "required": false,
      "noStyle": false,
      "valuePropName": "value",
      "requiredobj": {
        "required": null,
        "message": null
      },
      "typeobj": {
        "type": null,
        "message": null
      },
      "lenobj": {
        "max": null,
        "min": null,
        "message": null
      },
      "patternobj": {
        "pattern": null,
        "message": null
      },
      "name": field_name || ""
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": "",
  };
}
function createRadioGroupSchema({ dict_values }: {
  dict_values: any[]
}) {
  const options = dict_values.map((_) => ({
    label: _.name,
    value: _.value
  }))
  return {
    "componentName": "antdRadioGroup",
    "id": uuidv4(),
    "props": {
      "options": options || [],
      "disabled": false,
      "optionType": "default"
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  };
}

function createCheckGroupSchema({ dict_values }: {
  dict_values: any[]
}) {
  const options = dict_values.map((_) => ({
    label: _.name,
    value: _.value
  }))
  return {
    "componentName": "antdCheckboxGroup",
    "id": uuidv4(),
    "props": {
      "options": options || "",
      "name": "",
      "defaultValue": [],
      "disabled": false
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  }
}

/**
 * 
 * 
 * 
 * 以下函数用于辅助低代码编辑页面的多页面管理插件功能
 * 
 * 
 */

// /* 该函数作用是将后端返回不规则数据转化为antd的Menu组件能够正确显示*/
// export function pageMsgToMenu(flatDataArr: any[], parentId: number | null) {
//   let newArr: any[] = []
//   flatDataArr.forEach(item => {
//     if (item.parent_id === parentId) {
//       item.key = item.id.toString()
//       item.label = item.name
//       let child = pageMsgToMenu(flatDataArr, item.id)
//       if (child.length > 0) {
//         item.children = child
//       }
//       newArr.push(item)
//     }
//   })
//   return newArr;
// }

/* 该函数作用是将后端返回不规则数据转化为antd的Menu组件能够正确显示*/
export function pageMsgToMenu(originalData: any) {
  return originalData.map((item: any) => {
    if (!item.children || !item.children.length) {
      return {
        ...item,
        label: item.name,
        key: item.id,
        children: item.model_list.map((item: any) => ({
          ...item,
          label: item.name,
          key: item.id,
        }))
      }
    }
    return {
      ...item,
      label: item.name,
      key: item.id,
      children: [...pageMsgToMenu(item.children), ...pageMsgToMenu(item.model_list)]
    }
  })
}
/* 该函数作用是在保存Schema时，寻找返回url连接的所属指标模型对象*/
export function findTargetInMenuData(MenuData: any, currentId: string | null): any {
  let target = null;
  let isGet = false;
  function deepSearch(tree: any, id: string | null) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].children && tree[i].children.length > 0) {
        deepSearch(tree[i].children, id);
      }
      if (id === tree[i].id.toString() || isGet) {
        isGet || (target = tree[i]);
        isGet = true;
        break;
      }
    }
  }
  deepSearch(MenuData, currentId);
  return target;
}

/* 该函数作用是比较两个复杂对象是否相同，用于比较两个Schema对象*/
export function deepEquals(x: any, y: any) {
  // 先判断传入的是否为对象
  if (Object.keys(x).length !== Object.keys(y).length) {
    return false
  }
  let newX = Object.keys(x)
  for (let p = 0; p < newX.length; p++) {
    let p2 = newX[p]
    let a = x[p2] instanceof Object
    let b = y[p2] instanceof Object
    if (a && b) {
      if (!deepEquals(x[p2], y[p2])) {
        return false
      }
    } else if (x[p2] !== y[p2]) {
      return false
    }
  }
  return true
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

// /** 自定义实现对Menu组件内容的自定义渲染*/
// export function _MenuItemRender(name: string, categoryId: number) {
//   return (
//     <div
//       style={{
//         display: 'flex',
//         // alignItems: 'center',
//         justifyContent: 'space-between',
//         gap: 8,
//       }}
//     >
//       <div>{name}</div>
//       <div>
//         <Tooltip title="编辑">
//           <Button
//             type="ghost"
//             style={{ border: "none" }}
//             icon={<EditOutlined style={{ color: "#1890ff" }} />}
//             onClick={() => { console.log(123) }} />
//         </Tooltip>
//         {/* <Tooltip title="删除">
//         <Button 
//         type="ghost"
//         style={{border:"none"}}
//         icon={<CloseOutlined style={{color:"red"}}/>} 
//         onClick={()=>{console.log(123)}}/>
//       </Tooltip> */}
//       </div>
//     </div>
//   )
// }


/**
 * 以下辅助函数功能都用于辅助生成研究页面的树形数据
 */


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

/* 寻找Tree组件的初始选中项节点 */
export function findFirstSelectNode(TreeData: any) {
  for (let i = 0; i < TreeData.length; i++) {
    if (TreeData[i].children.length > 1) {
      return TreeData[i].children[0];
    }
    if (TreeData[i].children && !TreeData[i].isLeaf) {
      continue;
    }
  }
}

/* 寻找Tree结构中符合条件的节点 */
export function treeForeach(TreeData: any,compFunc:any) {
  for (const node of TreeData) {
    if (compFunc(node)) return node
    if (node.children) {
      const res:any = treeForeach(node.children, compFunc)
      if (res) return res
    }
  }
  return null;
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
