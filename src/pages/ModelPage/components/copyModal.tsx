import { useModel } from '@umijs/max';
import { ModalForm, ProForm } from '@ant-design/pro-components';
import { Form } from 'antd';
import { TreeSelect } from 'antd';
import React, { useState } from 'react';

const { SHOW_PARENT } = TreeSelect;

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default ({ modalView, setModalView }: { modalView: boolean; setModalView: any }) => {
  const [form] = Form.useForm<{ name: string; company: string }>();
  const [value, setValue] = useState([]);
  const { TreeNodeList } = useModel('modelsMsg', (res) => {
    const TreeNodeList = res.allModelsMsg.map((item: any, index: number) => {
      const reduceStr = `${index}-${item.table_name}`;
      return {
        title: item.table_name,
        value: reduceStr,
        children: [],
        // item?.fields.map((item: any) => {
        //   return {
        //     title: item.name,
        //     value: `${reduceStr}-${item.name}`
        //   }
        // })
      };
    });
    return {
      TreeNodeList,
    };
  });
  const tProps = {
    treeData: TreeNodeList,
    value,
    allowClear: true,
    notFoundContent: '暂无数据',
    onChange: (newValue: never[]) => {
      console.log('onChange ', newValue);
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
      title="获取其他数据模型字段"
      // trigger={trigger.current}
      visible={modalView}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setModalView(false),
      }}
      onFinish={async (fromValues) => {
        console.log(fromValues);

        await waitTime(2000);
        // console.log(values.name);
        return true;
      }}
    >
      <ProForm.Group>
        <TreeSelect {...tProps} />
      </ProForm.Group>
    </ModalForm>
  );
};
