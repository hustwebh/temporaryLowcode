import React, { useState, useEffect, useRef } from 'react';
import { Col, Row, Button, Input, message, Space, Tag } from 'antd';
import { Link } from '@umijs/max';
import {
  getIndicatorData,
  modifyIndicatorData,
  modifyTableData
} from '@/services/ant-design-pro/tableData';
import { modifyIndicator } from '@/services/ant-design-pro/categroy'
import type { EditableFormInstance, ProColumns, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { EditableProTable, ProForm } from '@ant-design/pro-components';
import CopyModal from './components/copyModal';
import { v4 as uuidv4 } from 'uuid';
// import {
//   delModelData,
//   changeModelData,
//   getModelData,
// } from '@/services/ant-design-pro/tableData';
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  EditOutlined,
  MinusCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {
  checkBoxCanSelect,
  categoriesAndIndicatorsDataToTreeWithoutKey,
  TreeDataWithoutKeyToTreeData,
  findFirstSelectNode
} from '@/utils'
import { getAllIndicators } from '@/services/ant-design-pro/layout';
import {
  getAllCategories,
  addCategory
} from '@/services/ant-design-pro/categroy'
import { useLocation } from 'umi';

import TreeList from './components/TreeList'

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

const DicValue: React.FC<{
  value?: {
    name: string;
    value: string;
  }[];
  onChange?: (
    value: {
      name: string;
      value: string;
    }[],
  ) => void;
}> = ({ value = [], onChange }) => {
  const [values, setValues] = useState<{
    name: string;
    value: string;
  }[]>(value)
  const setValue = (target: any, type: string) => {
    let copyValue = values;
    const indexOfTarget = ~~target.id;

    if (type === "name") {
      copyValue.splice(indexOfTarget, 1, {
        name: target.value,
        value: value[indexOfTarget].value
      })
    } else if (type === "value") {
      copyValue.splice(indexOfTarget, 1, {
        name: value[indexOfTarget].name,
        value: target.value,
      })
    }
    setValues(copyValue)
    onChange?.(copyValue)
  }
  const addNewDicValue = () => {
    let newValues = [...(value || []), {
      name: "",
      value: ""
    }];
    setValues(newValues)
    onChange?.(newValues)
  }

  const deleteDicValue = (target: any) => {
    let copyValue = value;
    copyValue.splice(target, 1);
    setValues(copyValue)
    onChange?.(copyValue)
  }
  return (
    <div>
      <Row>
        <Col span={12}>选项名</Col>
        <Col span={12}>选项值</Col>
      </Row>
      {values && values.map((item, index) => {
        return (<Row style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: 5
        }}>
          <Col span={8}>
            <Input id={`${index}`} value={item.name} onChange={(e) => setValue(e.target, "name")} />
          </Col>
          <Col span={8}>
            <Input id={`${index}`} value={item.value} onChange={(e) => setValue(e.target, "value")} />
          </Col>
          <Col span={3}>
            <DeleteOutlined id={`${index}`} onClick={(e) => deleteDicValue(index)} />
          </Col>
        </Row>)
      })}
      {/* <ProForm<{
        name: string;
        value: string;
      }[]>>
        {value.map((item) => (
          <ProForm.Group>
            <ProFormText name="name" defaultValue={item.name} />
            <ProFormText name="value" defaultValue={item.value} />
          </ProForm.Group>
        ))}
      </ProForm> */}
      <Row>
        <Button type="link" icon={<PlusOutlined />} onClick={addNewDicValue}>新增一行</Button>
      </Row>
    </div>
  );
};

const TableTitle: React.FC<{
  tableData: any
  tableName: string
  setTableName: any
}> = ({ tableData, tableName, setTableName }) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [value, setValue] = useState<string>(tableData.table_name)
  const handleChange = (e: any) => {
    setValue(e.target.value)
    setTableName(e.target.value)
  }
  return isEdit ? (
    <div>
      <Input
        autoFocus={true}
        value={value}
        onChange={handleChange}
        onPressEnter={async () => {
          const result = await modifyIndicatorData(tableData.id, {
            table_name: value
          })
          if (result) {
            setTableName(value);
            setIsEdit(false);
          }
        }}
      />
    </div>
  ) : (
    <div>
      {`${tableName}`}
      <Button
        icon={<EditOutlined />}
        type='ghost'
        style={{ outline: 'none', border: 'none' }}
        onClick={() => setIsEdit(true)}
      />
    </div>
  )
}


export default function DiseaseIndexLibrary() {
  const { pathname } = useLocation();
  const [categories, setCategories] = useState<any>([])//获取分类和相关指标模型的原始数据
  const [indicator, setIndicator] = useState<number | null>(null)//获取初始状态下的指标模型id属性
  const [defaultKey, setDefaultKey] = useState<string>("")//获取初始状态下的指标模型key属性用作Tree初始选中高亮

  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [modalView, setModalView] = useState(false);
  const [allIndicators, setAllIndicators] = useState<any>([]);
  const [treeNodeList, setTreeNodeList] = useState<any>([]);
  const [tableData, setTableData] = useState<any>({});
  const [tableName, setTableName] = useState<string>("");
  const formRef = useRef<ProFormInstance<any>>();
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const actionRef = useRef<any>();

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '字段名',
      dataIndex: 'name',
      width: '9%'
    },
    {
      title: '字段英文名',
      dataIndex: 'field_name',
      width: '9%'
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: '13%',
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
      width: '7%'
    },
    {
      title: '小数点',
      dataIndex: 'decimal_point',
      width: '7%'
    },
    {
      title: '不是null',
      dataIndex: 'not_null',
      width: '7%',
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
      width: '8%'
    },
    {
      title: '控件类',
      dataIndex: 'tag',
      valueType: 'select',
      width: '13%',
      valueEnum: {
        "单选": {
          text: '单选',
        },
        "多选": {
          text: '多选',
        },
        "输入框": {
          text: '输入框',
        },
        "下拉框": {
          text: '下拉框',
        },
        "开关": {
          text: '开关',
        },
        "受控渲染": {
          text: '受控渲染'
        }
      },
    },
    {
      title: '字典值',
      dataIndex: 'dict_values',
      width: '20%',
      // formItemProps: {
      //   rules: [
      //     {
      //       required: true,
      //       message: '此项为必填项',
      //     },
      //   ],
      // },
      renderFormItem: () => (<DicValue />),
      render: (_, row) => row?.dict_values?.map((item) => {
        return <Tag key={item.name}>{item.name}-{item.value}</Tag>
      }),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
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
    awaitAllCategories()
  }, [pathname])
  useEffect(() => {
    if (indicator) {
      localStorage.setItem("indicator", indicator.toString())//便于低代码页面获取默认页面信息
      //下一行函数调用会导致请求重复，在FormRequest里调用函数
      // awaitGetIndicator();//获取当前页面上的指标模型
      awaitAllIndicators();//获取所有其他的指标模型用于复制字段
    }
  }, [indicator])

  const formRequest = async () => {
    const result = await awaitGetIndicator();
    setTableName(result.table_name)
    return {
      data: result.field_list,
      success: true,
    }
  }

  const awaitAllCategories = async () => {
    const result = await getAllCategories({ study_id: ~~pathname.split('/')[3] });
    const TreeDataWithoutKey = categoriesAndIndicatorsDataToTreeWithoutKey(result);
    const TreeData = TreeDataWithoutKeyToTreeData(TreeDataWithoutKey);
    const { id, key } = findFirstSelectNode(TreeData)
    setCategories(TreeData);
    setIndicator(id);
    setDefaultKey(key)
  }
  const awaitGetIndicator = async () => {
    const result = await getIndicatorData(indicator)
    console.log(result);
    setTableData(result);
    setTableName(result.table_name);
    return result;
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

  const EditableTableChanged = (value: any) => {
    setTableData((prevState: any) => {
      return {
        ...prevState,
        field_list: value
      }
    })
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
    // console.log("selectData", selectData);
    selectData.forEach((_) => actionRef?.current?.addEditRecord(_))
    return true;
  }

  const addCategoryAtRoot = async () => {
    const newIndex = categories.length
    const result = await addCategory({
      name: "新建分类",
      study_id: ~~pathname.split('/')[3]
    })
    if (result.data) {
      const { name, parent_id, id } = result.data
      setCategories([...categories, {
        title: name,
        parent_id,
        id,
        key: `.${newIndex}`,
      }])
    } else {
      message.error("添加分类失败，请重试")
    }
  }

  const showPromiseConfirm = async () => {
    const formValue = formRef.current?.getFieldsValue?.().table;
    console.log("formValue", formValue);
    const result = await modifyTableData(tableData.id, {
      field_list: formValue.map((item: any) => ({
        name: item.name,
        field_name: item.field_name,
        comment: item.comment,
        decimal_point: item.decimal_point,
        length: ~~item.length,
        not_null: ~~item.not_null,
        type: item.type,
        dict_values: item.dict_values
      }))
    })
    if (result) {
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
                  defaultKey={defaultKey}
                  setIndicator={setIndicator}
                  setDefaultKey={setDefaultKey}
                />
              )
              : "待添加研究项"
          }
        </Col>
        <Col span={18}>
          {indicator ? <>
            <ProForm<{
              table: DataSourceType[];
            }>
              formRef={formRef}
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
                controlled
                actionRef={actionRef}
                editableFormRef={editorFormRef}
                headerTitle={tableName && <TableTitle tableData={tableData} tableName={tableName} setTableName={setTableName} />}
                value={tableData.field_list}
                onChange={EditableTableChanged}
                params={{ indicator }}
                request={formRequest}
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
                    // style={{ width: 130, height: 35 }}
                    type='primary'
                  >
                    <Link to={`/${~~pathname.split('/')[1]}/Editor`} target="_blank">
                      <EditOutlined />
                      进入编辑
                    </Link>
                  </Button>,
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
          </> : "loading..."}
        </Col>
      </Row>
    </div>
  )
}
