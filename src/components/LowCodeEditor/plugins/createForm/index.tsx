import type { PluginProps } from '@alilc/lowcode-types';
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
  createSwitchSchema
} from './FormSchema';

function createFormSchemaByData(data: any) {
  const { field_list } = data;
  let formSchema:any = createFormSchema();
  let formChildren = field_list.map((item: any) => {
    const { name, field_name, dict_values, tag } = item;
    let formItemSchema:any = createFormItemSchema({ name, field_name });
    switch (tag) {
      case "单选":
        formItemSchema.children = createRadioGroupSchema({ dict_values });
        break;
      case "多选":
        formItemSchema.children = createCheckboxGroupSchema({ dict_values });
        break;
      case "输入框":
        formItemSchema.children = createInputSchema();
        break;
      case "下拉框":
        formItemSchema.children = createSelectSchema({ dict_values });
        break;
      case "开关":
        formItemSchema.children = createSwitchSchema();
        break;
      // case "受控渲染":
      //   formItemSchema.children = create//Schema();
      //   break;
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

const createForm: React.FC<PluginProps> = (props): React.ReactElement => {
  return (
    <Button onClick={() => insertForm()}>
      生成表单
    </Button>
  );
};

export default createForm;