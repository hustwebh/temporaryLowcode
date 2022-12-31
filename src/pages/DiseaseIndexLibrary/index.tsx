import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Button, Popconfirm, Modal, Input, message } from 'antd';
import { getIndicatorData } from '@/services/ant-design-pro/tableData';

import type { EditableFormInstance, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { EditableProTable, ProForm } from '@ant-design/pro-components';
import CopyModal from './components/copyModal';
import { v4 as uuidv4 } from 'uuid'
import {
  delModelData,
  changeModelData,
  getModelData,
} from '@/services/ant-design-pro/tableData';
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  EditOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import {
  checkBoxCanSelect,
  categoriesAndIndicatorsDataToTreeWithoutKey,
  TreeDataWithoutKeyToTreeData,
  findFirstSelectKey
} from '@/utils'
import { getAllIndicators } from '@/services/ant-design-pro/layout';
import {
  getAllCategories,
  addCategory
} from '@/services/ant-design-pro/categroy'
import { getAllModels } from '@/services/ant-design-pro/layout';
import { useModel, Link, useLocation } from 'umi';

import TreeList from './components/TreeList'

const { confirm } = Modal;

type DataSourceType = {
  id: React.Key;
  name?: string;
  type?: string;
  length?: number;
  is_key?: number
  decimal_point?: number;
  not_null?: number | string;
  comment?: string;
  dict_values?: object[]
};


export default function DiseaseIndexLibrary() {
  const { pathname } = useLocation();
  const [categories, setCategories] = useState<any>([])//获取分类和相关指标模型的原始数据
  const [indicator, setIndicator] = useState<number | null>(null)//获取初始状态下的指标模型


  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [modalView, setModalView] = useState(false);
  const [allIndicators, setAllIndicators] = useState<any>([]);
  const [treeNodeList, setTreeNodeList] = useState<any>([]);
  const formRef = useRef<ProFormInstance<any>>();
  const [tableData, setTableData] = useState<any>({});
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const actionRef = useRef<any>();

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
            console.log("beforeEdit", tableData.field_list);
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
    awaitAllCategories();//获取一个研究下的分类和对应模型种类
  }, [])
  useEffect(() => {
    if (indicator) {
      awaitGetIndicator();//获取当前页面上的指标模型
      awaitAllIndicators();//获取所有其他的指标模型用于复制字段
    }
  }, [indicator])


  const awaitAllCategories = async () => {
    const result = await getAllCategories({ study_id: ~~pathname.split('/')[3] });
    console.log(result);

    // const result = await getAllCategories({ study_id: 1 });
    const TreeDataWithoutKey = categoriesAndIndicatorsDataToTreeWithoutKey(result);
    const TreeData = TreeDataWithoutKeyToTreeData(TreeDataWithoutKey);
    setCategories(TreeData);
    setIndicator(findFirstSelectKey(TreeData));

  }
  const awaitGetIndicator = async () => {
    const result = await getIndicatorData(indicator)
    setTableData(result);
  }
  const awaitAllIndicators = async () => {
    const result = await getAllIndicators();
    const TreeNodeList = result.map((item: any) => {
      const reduceStr = `${item.table_name}`;
      const selectAble = checkBoxCanSelect(item, indicator);
      return {
        title: item.name,
        value: reduceStr,
        disableCheckbox: selectAble,
        // children: [],
        children: item.field_list
          ? (item?.field_list.map((item: any) => {
            return {
              title: item.name,
              value: `${reduceStr}-${item.table_name}`,
              disableCheckbox: selectAble,
            }
          }))
          : []
      };
    });
    setTreeNodeList(TreeNodeList);
    setAllIndicators(result);
  }

  const EditableTableChanged = () => {
    console.log(123);
  }

  const getDataFromOtherModel = (value: any[]) => {
    const selectDataNoflat = value.map((item: string) => {
      const selectOptions = item.split('-')
      if (selectOptions.length === 1) {
        //代表这个表所有的都选了
        const selectedModel = allIndicators.filter((item: any) => item.table_name === selectOptions[0])[0];
        const selectedData = selectedModel.field_list.map((item: any) => {
          return {
            ...item,
            id: uuidv4()
          }
        })
        return selectedData;
      }
      else if (selectOptions.length > 1) {
        //代表这个表被选中了一部分
        const selectedModel = allIndicators.filter((item: any) => item.table_name === selectOptions[0])[0];
        const selectedData = selectedModel.field_list.filter((item: any) => item.name === selectOptions[1])[0];
        return {
          ...selectedData,
          id: uuidv4()
        }
      }
    })
    const selectData = selectDataNoflat.flat(Infinity)
    console.log("selectData", selectData);
    selectData.forEach((_) => actionRef?.current?.addEditRecord(_))
    return true;
  }

  const addCategoryAtRoot = async () => {
    const newIndex = categories.length
    const result = await addCategory({
      name: "新建节点",
      parent_id: null,
    })
    if (result) {
      setCategories([...categories, {
        title: "新建节点",
        key: `.${newIndex}`,
        parent_id: null,
      }])
    } else {
      message.error("添加分类失败，请重试")
    }
  }

  const showPromiseConfirm =async () => {
    // let inputValue = tableData.name;
    // confirm({
    //   title: '将该数据模型确认名称并上传',
    //   icon: <ExclamationCircleOutlined />,
    //   content: (
    //     <Input
    //       defaultValue={inputValue}
    //       onChange={(e) => {
    //         inputValue = e.target.value;
    //       }}
    //     />
    //   ),
    //   async onOk() {
    //     const SubmitValues = {
    //       id: tableData.id,
    //       table_name: inputValue,
    //       field_list: formRef.current?.getFieldsValue?.().table,
    //     };
    //     const res = await changeModelData(SubmitValues);
    //     console.log("res", res);
    //     if (res) {
    //       message.success('修改数据模型成功!');
    //       setTableData({
    //         table_name: inputValue
    //       })
    //     }
    //   },
    //   onCancel() { },
    // });
    const SubmitValues = {
      id: tableData.id,
      // table_name: inputValue,
      field_list: formRef.current?.getFieldsValue?.().table,
    };
    const res = await changeModelData(SubmitValues);
    console.log("res", res);
    if (res) {
      message.success('修改数据模型成功!');
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <Row justify="space-between" style={{ height: "100%" }}>
        <Col span={5}>
          <Button
            icon={<PlusOutlined style={{ color: "#1890ff" }} />}
            onClick={addCategoryAtRoot}
          >添加分类</Button>
          {
            categories.length
              ? (
                <TreeList
                  TreeData={categories}
                  defaultIndicatorId={indicator}
                  setIndicator={setIndicator}
                />
              )
              : "待添加研究项"
          }
        </Col>
        <Col span={18}>
          {tableData.field_list && <>
            <ProForm<{
              table: DataSourceType[];
            }>
              style={{
                // paddingRight: 50
              }}
              formRef={formRef}
              initialValues={{
                table: tableData.field_list,
              }}
              // params={{ pathname }}
              // request={FormRequest}
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
                controlled
                actionRef={actionRef}
                editableFormRef={editorFormRef}
                headerTitle={`${tableData.name}/(${tableData.table_name})`}
                value={tableData.field_list}
                onChange={EditableTableChanged}
                name="table"
                recordCreatorProps={{
                  position: 'bottom',
                  record: () => ({ id: uuidv4() }),
                }}
                toolBarRender={() => [
                  // <Popconfirm
                  //   title="确认删除该数据模型吗?"
                  //   // onConfirm={handleConfirm}
                  //   onConfirm={() => { }}
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
                    导入字段
                  </Button>,
                  <Button
                    key="rows"
                    onClick={() => { }}
                  >
                    导出数据库
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
          </>}
        </Col>
      </Row>
    </div>
  )
}
