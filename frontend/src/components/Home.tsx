import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contex/AuthContex";
import API from "../api/Api";
import { Card, Flex, Button, Modal, Input, Form} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

interface TodoData {
  id?: string;
  todotext: string;
}

const Home = () => {
  const [formedit] = Form.useForm();
  const [formcreate] = Form.useForm();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [data, setData] = useState<TodoData[] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editid, setEditid] = useState<TodoData | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false)

  const onFinish = async (values: TodoData) => {
    console.log("Success:", values);
    try{
      const response = await API.post("/todo/create",values);
      setRefresh(prev => !prev);
        formcreate.resetFields();
    console.log(response)
    }catch(error){
      console.log("Error",error)
    }
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await API.get("/todo/get-todo");
        setData(response.data);
        console.log(response);
        setRefresh(true);
      } catch (err) {
        console.log("Error", err);
      }
    };
    fetchdata();
  }, [refresh]);

  const handleDelete = async(id?:string) =>{
    if(!id) return ;
  try{
   await API.delete(`/todo/delete/${id}`);
   setRefresh(prev => !prev);
  }catch(err){
    console.log(err)
  }
  }

  const handleEdit = (todo:TodoData) => {
   console.log("Editing",todo)
  formedit.setFieldsValue({todotext : todo.todotext})
  setIsModalVisible(true);
   setEditid(todo)
  }

  const onUpdateFinish = async (values: TodoData) =>{
    console.log("Updating students", values)
     const updatedStudent = {
      ...editid,
      ...values,
    };
    const updatedata = await API.put(`/todo/update/${editid?.id}`,updatedStudent)
    setRefresh(prev => !prev); 
    setIsModalVisible(false);
    console.log(updatedata);
  }

  const logout = async () => {
    try {
      await API.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.log("Logout failed:", err);
    }
  };

  return (
    <>
      {/* --------------showing data-------- */}
      <button onClick={logout}>Logout</button>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      {/* ------------------Create todo form------------------------------------------- */}
      <Form
        name="basic"
        form={formcreate}
        layout="vertical"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600, margin: "20px" }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Task"
          name="todotext"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter Task" />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Add Task
          </Button>
        </Form.Item>
      </Form>
      {/* -----------------------Data card--------------------- */}
      <Flex wrap gap="middle" style={{ margin: "20px" }} justify="center">
        {data && data.length > 0 ? (
          data.map((value) => (
            <Card
              key={value.id}
              style={{ width: "200px", border: "1px solid green" }}
            >
              <Flex justify="space-between">
                {/* <Button type="primary" onClick={() => handleEdit(value)}> */}
                <EditOutlined style={{ color: "blue" }} onClick={() => handleEdit(value)} />
                {/* </Button> */}
                {/* <Button danger onClick={() => handleDelete(value.id)}> */}
                <DeleteOutlined style={{ color: "red" }} onClick={() => handleDelete(value.id)}/>
                {/* </Button> */}
              </Flex>
              <p style={{ padding: "10px" }}>{value.todotext}</p>
            </Card>
          ))
        ) : (
          <Card style={{ width: 300 }}>
            <p>No data found</p>
          </Card>
        )}
      </Flex>
      {/* ------------------------Update/Edit-------------------- */}
      <Modal
        title="Edit ToDo"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
          <Form layout="vertical" form={formedit} onFinish={onUpdateFinish}>
            <Form.Item
              label="Todo"
              name="todotext"
              rules={[{ required: true, message: "Please input the ToDo name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => setIsModalVisible(false)}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
      </Modal>
    </>
  );
};

export default Home;
