import type { PluginProps } from '@alilc/lowcode-types';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button } from 'antd';
import { getIndicatorData } from '@/services/ant-design-pro/tableData';
import { project } from '@alilc/lowcode-engine';
import {
  createFormSchema,
  createFormItemSchema,
  createRadioGroupSchema,
  createCheckboxGroupSchema,
  createInputSchema,
  createSelectSchema,
  createSwitchSchema,
  createControlledContainerSchema
} from './FormSchema';

function createFormSchemaByData(data: any) {
  const { field_list } = data;
  let formSchema: any = createFormSchema();
  let formChildren = field_list.map((item: any) => {
    const { name, field_name, dict_values, tag } = item;
    let formItemSchema;
    switch (tag) {
      case "单选":
        formItemSchema = createRadioGroupSchema({ name, field_name, dict_values });
        break;
      case "多选":
        formItemSchema = createCheckboxGroupSchema({ name, field_name, dict_values });
        break;
      case "输入框":
        formItemSchema = createInputSchema({ name, field_name });
        break;
      case "下拉框":
        formItemSchema = createSelectSchema({ name, field_name, dict_values });
        break;
      case "开关":
        formItemSchema = createSwitchSchema({ name, field_name });
        break;
      case "受控渲染":
        formItemSchema = createControlledContainerSchema({ name, field_name });
        break;
      default:
        break;
    }
    return formItemSchema;
  })
  formSchema.children = formChildren;
  return formSchema;
}

const insertForm = async () => {
  const data = await getIndicatorData(~~(localStorage.getItem("indicator") || ""));
  const targetForm = createFormSchemaByData(data);
  let currentPageSchema = project.currentDocument?.exportSchema();
  if (currentPageSchema?.children) {
    currentPageSchema.children.push(targetForm)
  } else {
    currentPageSchema.children = targetForm
  }
  project.currentDocument && project.removeDocument(project.currentDocument);
  project.openDocument(currentPageSchema)
}

const createFormPluginContent: React.FC<PluginProps> = () => {
  return (
    <Button onClick={() => insertForm()}>
      生成表单
    </Button>
  );
};

const CreateFormPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton } = ctx;

      skeleton.add({
        name: 'createForm',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
        },
        content: createFormPluginContent
      });
    },
  };
}

CreateFormPlugin.pluginName = 'createForm';
// CreateFormPlugin.meta = {
//   dependencies: ['EditorInitPlugin'],
// };

export default CreateFormPlugin;