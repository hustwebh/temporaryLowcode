import { Component } from 'react';
// import { connect } from 'umi';
import { Link } from '@umijs/max';
import { Button, message } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getAllPages } from '../../services/ant-design-pro/pagesManagement';
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

// const initialData = [
//   {
//     "id": 1,
//     "project_id": 1,
//     "parent_id": null,
//     "name": "用户页面",
//     "children": [
//       {
//         "id": 2,
//         "project_id": 1,
//         "parent_id": 1,
//         "name": "用户登录页面",
//       },
//       {
//         "id": 3,
//         "project_id": 1,
//         "parent_id": 1,
//         "name": "用户注册页面",

//       }
//     ]
//   },
//   {
//     "id": 4,
//     "project_id": 1,
//     "parent_id": null,
//     "name": "文章首页",
//   }
// ];

export default class PageManagement extends Component {
  constructor(props: any) {
    super(props);

    this.state = {
      loading: false,
      treeData: [],
    };
  }

  getAllPagesMsg = async () => {
    this.setState({
      loading: true,
    });
    const result = await getAllPages({ project_id: ~~pathname.split('/')[1] });
    console.log('result', result);
    this.setState({
      treeData: getTreeFromFlatData({
        flatData: result.map((node: any) => ({ ...node, title: node.name })),
        // flatData: initialData.map((node) => ({ ...node, title: node.name })),
        getKey: (node: any) => node.id,
        getParentKey: (node: any) => node.parent_id,
        rootKey: null,
      }),
      loading: false,
    });
  };

  componentDidMount() {
    this.getAllPagesMsg();
  }

  savePages = async () => {
    const flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      name: node.name,
      parent: path.length > 1 ? path[path.length - 2] : null,
    }));
    console.log(flatData);
    const res = await ChangePages(~~pathname.split('/')[1],flatData);
    if (res) message.success("保存页面结构成功")
  }


  render() {
    const getNodeKey = ({ treeIndex }: { treeIndex: number }) => treeIndex;
    return !this.state.loading ? (
      <>
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
                onClick={(e) =>{
                  //判断是否有子节点
                  console.log("e",e);
                  console.log("state",this.state)
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
              <Button
                // className={style.operateBtn}
                type="text"
                key='toEditor'
              >
                <Link to={`/${~~pathname.split('/')[1]}/Editor`} target="_blank">
                  <EditOutlined />
                </Link>
              </Button>,
            ],
          })}
        />
        <Button
          style={{ width: 130, height: 35 }}
          type='primary'
          onClick={this.savePages}
        >保存页面结构</Button>
      </>
    ) : (
      'loading'
    );
  }
}

// export default connect(({ initialData }: { initialData: any }) => ({
//   initialData
// }))(PageManagement)
