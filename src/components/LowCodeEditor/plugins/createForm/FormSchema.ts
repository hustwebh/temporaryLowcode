import { v4 as uuidv4 } from 'uuid';

export function createFormSchema() {
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
export function createFormItemSchema({ name, field_name }: {
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
export function createRadioGroupSchema({ name, field_name, dict_values }: {
  name: string;
  field_name: string;
  dict_values: any[]
}) {
  const options = dict_values.map((_) => ({
    label: _.name,
    value: _.value
  }))
  let formItemSchema: any = createFormItemSchema({ name, field_name });
  formItemSchema.children = [{
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
  }]
  return formItemSchema;
}
export function createCheckboxGroupSchema({ name, field_name, dict_values }: {
  name: string;
  field_name: string;
  dict_values: any[]
}) {
  const options = dict_values.map((_) => ({
    label: _.name,
    value: _.value
  }))
  let formItemSchema: any = createFormItemSchema({ name, field_name });
  formItemSchema.children = [{
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
  }]
  return formItemSchema;
}
export function createInputSchema({ name, field_name }: {
  name: string;
  field_name: string;
}) {
  let formItemSchema: any = createFormItemSchema({ name, field_name });
  formItemSchema.children = [{
    "componentName": "Input",
    "id": "node_ocldk3bys81",
    "props": {
      "placeholder": "请输入",
      "bordered": true,
      "disabled": false
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  }]
  return formItemSchema
}
export function createSelectSchema({ name, field_name, dict_values }: {
  name: string;
  field_name: string;
  dict_values: any[]
}) {
  const options = dict_values.map((_) => ({
    label: _.name,
    value: _.value
  }))
  let formItemSchema: any = createFormItemSchema({ name, field_name });
  formItemSchema.children = {
    "componentName": "Select",
    "id": uuidv4(),
    "props": {
      "style": {
        "width": 200
      },
      "options": options,
      "allowClear": false,
      "autoFocus": false,
      "defaultActiveFirstOption": true,
      "disabled": false,
      "labelInValue": false,
      "showSearch": false,
      "loading": false,
      "bordered": true,
      "optionFilterProp": "value",
      "tokenSeparators": [],
      "maxTagCount": 0,
      "maxTagTextLength": 0
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  }
  return formItemSchema
}
export function createSwitchSchema({ name, field_name }: {
  name: string;
  field_name: string;
}) {
  let formItemSchema: any = createFormItemSchema({ name, field_name });
  formItemSchema.children = [{
    "componentName": "Switch",
    "id": uuidv4(),
    "props": {
      "defaultChecked": true,
      "autoFocus": false,
      "disabled": false,
      "loading": false
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  }]
  return formItemSchema
}
export function createControlledContainerSchema({ name, field_name }: {
  name: string;
  field_name: string;
}) {
  let formItemSchema: any = createFormItemSchema({ name, field_name });
  formItemSchema.children = [{
    "componentName": "controlledSwitch",
    "id": uuidv4(),
    "props": {
      "checked": true,
      "size": "default",
      "defaultChecked": true,
      "disabled": false,
      "loading": false,
      "autoFocus": false
    },
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": ""
  }]
  let boxSchema = {
    "componentName": "Box",
    "id": uuidv4(),
    "props": {},
    "hidden": false,
    "title": "",
    "isLocked": false,
    "condition": true,
    "conditionGroup": "",
    "children": [formItemSchema]
  }
  return boxSchema;
}