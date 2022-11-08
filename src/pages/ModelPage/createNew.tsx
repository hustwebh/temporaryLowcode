import type { EditableFormInstance, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { EditableProTable, ProForm } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Modal, Input } from 'antd';
import CopyModal from './components/copyModal';
import { QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  delModelData,
  addModelData,
  changeModelData,
  getModelData,
} from '@/services/ant-design-pro/tableData';
import { getAllModels } from '@/services/ant-design-pro/layout';
import { checkBoxCanSelect } from '@/utils';
import { useModel } from 'umi';
import { useLocation } from 'react-router';

type DataSourceType = {
  id: React.Key;
  name?: string;
  type?: string;
  length?: number;
  decimal_point?: number;
  notNull?: number | string;
  comment?: string;
};

const { confirm } = Modal;

export default function ModelTable() {
  const { refreshSymbol,setRefreshSymbol } = useModel('modelsMsg', res => ({
    refreshSymbol: res.refreshSymbol,
    setRefreshSymbol:res.setRefreshSymbol
  }));
  const { pathname } = useLocation();
  const tableId = pathname.split('/').pop();
  const [modalView, setModalView] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const formRef = useRef<ProFormInstance<any>>();
  const actionRef = useRef<any>();
  const [treeNodeList, setTreeNodeList] = useState<any>([]);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any>({});
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '字段名',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        "int": {
          text: 'int',
        },
        "int unsigned": {
          text: 'int unsigned',
        },
        "varchar": {
          text: 'varchar',
        },
        "date": {
          text: 'date',
        },
        "smallint": {
          text: 'smallint',
        },
      },
    },
    {
      title: '长度',
      dataIndex: 'length',
    },
    {
      title: '小数点',
      dataIndex: 'decimal_point',
    },
    {
      title: '不是null',
      dataIndex: 'notNull',
      valueType: 'radio',
      valueEnum: {
        1: {
          text: '是',
        },
        0: {
          text: '否',
        },
      },
    },
    {
      title: '注释',
      dataIndex: 'comment',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            const tableDataSource = formRef.current?.getFieldValue('table') as DataSourceType[];
            formRef.current?.setFieldsValue({
              table: tableDataSource.filter((item) => item.id !== record.id),
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  useEffect(() => {
    //获取所有列表数据以及所有表单信息项目的Array
    const getAllModelsMsg = async () => {
      const res = await getAllModels();
      console.log("allModelMsg", res);
      const TreeNodeList = res.map((item: any) => {
        const reduceStr = `${item.table_name}`;
        const selectAble = checkBoxCanSelect(item);
        return {
          title: item.table_name,
          value: reduceStr,
          disableCheckbox: selectAble,
          children: item?.fields.map((item: any) => {
            return {
              title: item.name,
              value: `${reduceStr}-${item.name}`,
              disableCheckbox: selectAble,
            }
          })
        };
      });
      setTreeNodeList(TreeNodeList);
      setAllModels(res);
    };
    getAllModelsMsg();
  }, [pathname])

  const FormRequest = async () => {
    // if (tableId) {
    //   const result = await getModelData(~~tableId);
    //   console.log(result);
    //   if (result) setTableData(result);
    //   return { table: result.fields };
    // }
    return { table: [] };
  };

  const showPromiseConfirm = () => {
    let inputValue = tableData.table_name;
    confirm({
      title: '将该数据模型确认名称并上传',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Input
          defaultValue={tableData.table_name}
          onChange={(e) => {
            inputValue = e.target.value;
          }}
        />
      ),
      async onOk() {
        const SubmitValues = {
          id: tableData.id,
          table_name: inputValue,
          fields: formRef.current?.getFieldsValue?.().table,
        };
        const res = await addModelData(SubmitValues);
        console.log("res",res);
        if (res) {
          message.success('上传数据模型成功!');
          setRefreshSymbol(!refreshSymbol)
        }
      },
      onCancel() {},
    });
  };

  const handleConfirm = async (e: React.MouseEvent<HTMLElement> | undefined) => {
    const delResult = await delModelData(tableData.id);
    if (delResult) {
      //删除成功
      message.info("删除成功")
      setRefreshSymbol(!refreshSymbol)
    }
  };

  const getDataFromOtherModel = (value: any[]) => {
    const selectDataNoflat = value.map((item: string) => {
      const selectOptions = item.split('-')
      if (selectOptions.length === 1) {
        //代表这个表所有的都选了
        const selectedModel = allModels.filter((item: any) => item.table_name === selectOptions[0])[0];
        const selectedData = selectedModel.fields.map((item: any) => {
          return {
            ...item,
            id: (Math.random() * 1000000).toFixed(0)
          }
        })
        return selectedData;
      }
      else if (selectOptions.length > 1) {
        //代表这个表被选中了一部分
        const selectedModel = allModels.filter((item: any) => item.table_name === selectOptions[0])[0];
        const selectedData = selectedModel.fields.filter((item: any) => item.name === selectOptions[1])[0];
        return {
          ...selectedData,
          id: (Math.random() * 1000000).toFixed(0)
        }
      }
    })
    const selectData = selectDataNoflat.flat(Infinity)
    console.log("selectData", selectData);
    // selectData.forEach((_)=>{
    //   console.log(123);
    //   actionRef?.current?.addEditRecord(_)
    // })
    actionRef?.current?.addEditRecord(selectData[0])
    actionRef?.current?.addEditRecord(selectData[3])
    return true;
  }

  // {
  //   table: DataSourceType[];
  // }

  return (
    <>
      <ProForm<any>
        style={{
          paddingRight:50
        }}
        formRef={formRef}
        params={{ pathname }}
        request={FormRequest}
        validateTrigger="onBlur"
        submitter={{
          render: (props, doms) => {
            return [
              <Button type="primary" key="submit" onClick={showPromiseConfirm}>
                提交
              </Button>,
              <Button key="rest" onClick={() => props.form?.resetFields()}>
                重置
              </Button>,
            ];
          },
        }}
      >
        <EditableProTable<DataSourceType>
          rowKey="id"
          scroll={{
            x: 960,
          }}
          editableFormRef={editorFormRef}
          actionRef={actionRef}
          headerTitle={'新建数据模型'}
          name="table"
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
          }}
          toolBarRender={() => [
            // <Popconfirm
            //   title="确认删除该数据模型吗?"
            //   onConfirm={handleConfirm}
            //   onCancel={() => null}
            // >
            //   <Button key="delete" type="dashed" danger>
            //     删除该数据模型
            //   </Button>
            // </Popconfirm>,
            <Button
              key="rows"
              onClick={() => {
                setModalView(true);
              }}
            >
              复用其他table的数据
            </Button>,
          ]}
          columns={columns}
          editable={{
            type: 'multiple',
            editableKeys,
            onChange: setEditableRowKeys,
            actionRender: (row, config, defaultDom) => {
              return [defaultDom.save, defaultDom.delete || defaultDom.cancel];
            },
          }}
        />
      </ProForm>
      <CopyModal
        modalView={modalView}
        setModalView={setModalView}
        treeNodeList={treeNodeList}
        getDataFromOtherModel={getDataFromOtherModel}
      />
    </>
  );
}
