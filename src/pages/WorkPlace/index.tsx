import { Card, Button, Avatar, Modal, Input, Form, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl, Link, useModel, history } from '@umijs/max';
import { getAllProjects } from '@/services/ant-design-pro/layout';
import { addProject, changeProject } from '@/services/ant-design-pro/projects';

const { Meta } = Card;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const WorkPlace: React.FC = () => {
  
  const [loading, setLoading] = useState(true);
  const [projectList, setProjectList] = useState([]);
  const [addProjectModal, setAddProjectModal] = useState(false);
  const [changeProjectModal, setChangeProjectModal] = useState(false);
  const [addForm] = Form.useForm();
  const intl = useIntl();

  const  {initUserMsg,refresh}  = useModel('@@initialState', (res) => {
    setLoading(false)
    return {
      initUserMsg: res.initialState?.currentUser,
      refresh:res.refresh,
    };
  });
  console.log("initUserMsg",initUserMsg);

  useEffect(() => {
    getProjectsMsg();
  }, []);

  const getProjectsMsg = async () => {
    const res = await getAllProjects();
    if (res) setProjectList(res);
    await refresh();
  };

  const addNewProject = async (values: any) => {
    const res = await addProject(values);
    if (res) {
      setAddProjectModal(false);
      getProjectsMsg();
      message.success('创建新项目成功');
    } else {
      message.error('创建新项目失败请重试');
    }
  };

  const changeOldProject = async (values: any) => {
    const res = await changeProject(values.id, {
      name: values.name,
      description: values.description,
    });
    if (res) {
      setChangeProjectModal(false);
      getProjectsMsg();
      message.success('修改项目成功');
    } else {
      message.error('修改项目失败请重试');
    }
  };

  return (
    <>
      <Card style={{ width: '100%' }} loading={loading}>
        <Meta
          style={{ width: 600 }}
          avatar={<Avatar src={initUserMsg?.avatar} size={60} />}
          title={initUserMsg?.name}
          description={initUserMsg?.group}
        />
      </Card>
      <ProCard
        gutter={8}
        title="项目列表"
        extra={
          <Button
            onClick={() => {
              setAddProjectModal(true);
            }}
          >
            新建项目
          </Button>
        }
        style={{ marginBlockStart: 8 }}
        wrap
      >
        {projectList.map((item:any)=>{
          return (
            <ProCard
            colSpan={8}
            bordered
            hoverable
            title={item.name}
            style={{ marginTop: '10px' }}
            extra={
              <Button
                icon={<EditOutlined />}
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  setChangeProjectModal(true);
                  addForm.setFieldsValue({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                  });
                }}
              />
            }
            onClick={() => {
              location.href = `/${item.id}/PagesManagement`;
            }}
          >
            {item.description || '该项目暂无描述'}
          </ProCard>
        )
        })}
      </ProCard>
      {/* <ProList<any>
        // pagination={{
        //   onChange: pageChange,
        //   current: current_page,
        //   defaultPageSize: 6,
        //   showSizeChanger: false,
        // }}
        toolBarRender={() => {
          return [
            <Button
              key="3"
              type="primary"
              onClick={() => history.push(`/write/new`)}
            >
              新建项目
            </Button>,
          ];
        }}
        showActions="hover"
        rowSelection={{}}
        grid={{ gutter: 16, column: 2 }}
        // onItem={(record: any) => {
        //   return {
        //     onMouseEnter: () => {
        //       console.log(record);
        //     },
        //     onClick: () => {
        //       console.log(record);
        //     },
        //   };
        // }}
        metas={{
          title: {},
          subTitle: {},
          description: {},
          content: {},
        }}
        headerTitle="文章列表展示"
        dataSource={projectList}
      /> */}
      <Modal
        title="添加新的项目"
        open={addProjectModal}
        onCancel={() => {
          setAddProjectModal(false);
        }}
        footer={null}
      >
        <Form {...layout} form={addForm} name="control-hooks" onFinish={addNewProject}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
            <Input placeholder="请输入新建项目名称" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input placeholder="输入对项目的基本描述" />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="修改项目"
        open={changeProjectModal}
        onCancel={() => {
          setChangeProjectModal(false);
        }}
        footer={null}
      >
        <Form {...layout} form={addForm} name="control-hooks" onFinish={changeOldProject}>
          <Form.Item name="id" label="项目ID" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input placeholder="请输入对项目的基本描述" />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WorkPlace;
