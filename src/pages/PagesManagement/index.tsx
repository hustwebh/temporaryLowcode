import { Component } from 'react';
// import { connect } from 'umi';
import { Link } from '@umijs/max';
import { Button, message } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getAllPages } from '../../services/ant-design-pro/pagesManagement';
import { getAllProjects } from '@/services/ant-design-pro/layout';
import SortableTree, {
  changeNodeAtPath,
  addNodeUnderParent,
  removeNodeAtPath,
  getTreeFromFlatData,
  getFlatDataFromTree
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { ChangePages } from '@/services/ant-design-pro/pagesManagement'
// import style from "./index.less"

const { pathname } = location;

export default class pagesManagement extends Component {
  constructor(props: any) {
    super(props);

    this.state = {
      loading: false,
      projectMsg: {},
      treeData: [],
    };
  }

  getAllPagesMsg = async () => {
    this.setState({
      loading: true,
    });

    let pages = await getAllPages({ project_id: ~~pathname.split('/')[1] });
    if (!pages.length) {
      //该项目下暂时没有页面
      pages = pages.concat([{
        id: (Math.random() * 1000000).toFixed(0),
        name: '请为该项目创建页面',
        project_id: 1,
        parent_id: null,
      }])
    }

    const projects = await getAllProjects();
    const project = projects.filter((_: any) => _.id === ~~pathname.split('/')[1])[0];
    this.setState({
      treeData: getTreeFromFlatData({
        flatData: pages.map((node: any) => ({ ...node, title: node.name })),
        // flatData: initialData.map((node) => ({ ...node, title: node.name })),
        getKey: (node: any) => node.id,
        getParentKey: (node: any) => node.parent_id,
        rootKey: null,
      }),
      pages,
      projectMsg: project,
      loading: false,
    });
  };

  // getProjectName = async () => {
  //   this.setState({
  //     loading: true,
  //   })
  //   const pages = await getAllProjects();
  //   const project = pages.filter((_: any) => _.id === ~~pathname.split('/')[1]);
  //   this.setState({
  //     projectMsg: project,
  //     loading: false,
  //   })
  // }

  componentDidMount() {
    this.getAllPagesMsg();
    // this.getProjectName();
  }

  savePages = async () => {
    const flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      name: node.name,
      parent_id: path.length > 1 ? path[path.length - 2] : null,
    }));
    const page_list = flatData.map((item) => {
      const correspondingObject = this.state.pages.filter((_) => _.id === item.id)[0];
      console.log("correspondingObject", correspondingObject);
      return {
        ...item,
        file_path: correspondingObject?.file_path || "",
        note: correspondingObject?.note || ""
      }
    })
    const modifyMsg = {
      project_id: ~~pathname.split('/')[1],
      page_list,
    }
    const res = await ChangePages(modifyMsg);
    if (res) message.success("保存页面结构成功")
  }


  render() {
    const getNodeKey = ({ treeIndex }: { treeIndex: number }) => treeIndex;
    console.log("this.state", this.state);
    return !this.state.loading ? (
      <>
        <div
          style={{ height: 100 }}
        >
          <h1>{this.state.projectMsg.name}</h1>
          <h3>{this.state.projectMsg.description}</h3>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'end',
          // paddingRight: 90,
          paddingBottom:10
        }}>
          <Button
            style={{ width: 130, height: 35 }}
            type='primary'
          >
            <Link to={`/${~~pathname.split('/')[1]}/Editor`} target="_blank">
              <EditOutlined />
              进入编辑
            </Link>
          </Button>
        </div>
          <SortableTree
            treeData={this.state.treeData}
            onChange={(treeData) => this.setState({ treeData })}
            generateNodeProps={({ node, path }) => ({
              title: (
                <input
                  style={{ fontSize: '1.1rem' }}
                  value={node.name}
                  onChange={(event) => {
                    const name = event.target.value;

                    this.setState((state) => ({
                      treeData: changeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                        newNode: { ...node, name },
                      }),
                    }));
                  }}
                />
              ),
              buttons: [
                <Button
                  // className={style.operateBtn}
                  key='addChild'
                  type="text"
                  icon={<PlusCircleOutlined />}
                  onClick={() =>
                    this.setState((state) => ({
                      treeData: addNodeUnderParent({
                        treeData: state.treeData,
                        parentKey: path[path.length - 1],
                        expandParent: true,
                        getNodeKey,
                        newNode: {
                          name: `默认`,
                          id: (Math.random() * 1000000).toFixed(0),
                        },
                      }).treeData,
                    }))
                  }
                />,
                <Button
                  // className={style.operateBtn}
                  key='removeChild'
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    //判断是否有子节点
                    console.log("e", e);
                    console.log("state", this.state)
                    this.setState((state) => ({
                      treeData: removeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                      }),
                    }))
                  }
                  }
                />,
                // <Button
                //   // className={style.operateBtn}
                //   type="text"
                //   key='toEditor'
                // >
                //   <Link to={`/${~~pathname.split('/')[1]}/Editor`} target="_blank">
                //     <EditOutlined />
                //   </Link>
                // </Button>,
              ],
            })}
          />
        <div style={{
          // paddingTop:20,
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }}>
          <Button
            style={{ width: 130, height: 35, marginRight: 20 }}
            type='primary'
            onClick={this.savePages}
          >
            保存页面结构
          </Button>
        </div>
      </>
    ) : (
      'loading'
    );
  }
}

// export default connect(({ initialData }: { initialData: any }) => ({
//   initialData
// }))(PageManagement)
