import { ModalForm, ProForm } from '@ant-design/pro-components';
import { Form } from 'antd';
import { TreeSelect } from 'antd';
import { useState, } from 'react';

const { SHOW_PARENT } = TreeSelect;

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default ({ modalView, setModalView, treeNodeList, getDataFromOtherModel }
  : { modalView: boolean; setModalView: any; treeNodeList: any; getDataFromOtherModel: any }) => {
  const [form] = Form.useForm<{ name: string; company: string }>();
  const [value, setValue] = useState([]);

  const tProps = {
    treeData: treeNodeList,
    value,
    allowClear: true,
    notFoundContent: '暂无数据',
    onChange: (newValue: never[]) => {
      // console.log('onChange ', newValue);
      setValue(newValue);
    },
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: '点击选择相应字段',
    style: {
      minWidth: '350px',
    },
  };

  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="导入字段"
      // trigger={trigger.current}
      visible={modalView}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setModalView(false),
      }}
      onFinish={async () => {
        // console.log("fromValues",fromValues);
        await waitTime(2000);
        setModalView(false)
        return getDataFromOtherModel(value);
      }}
    >
      <ProForm.Group>
        <TreeSelect {...tProps} />
      </ProForm.Group>
    </ModalForm>
  );
};
