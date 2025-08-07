import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contex/AuthContex";
import API from "../api/Api";
import { Card, Flex, Button, Modal, Input, Form } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TodoData {
  id?: string;
  todotext: string;
}

// Fetch todos
const fetchTodos = async (): Promise<TodoData[]> => {
  const response = await API.get("/todo/get-todo");
  return response.data;
};
const { TextArea } = Input;
const Homepage = () => {
  const [formEdit] = Form.useForm();
  const [formCreate] = Form.useForm();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editTodo, setEditTodo] = React.useState<TodoData | null>(null);

  const queryClient = useQueryClient();

  // Fetch todos----------------------
  const { data: todos, isPending, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // Create Todo------------------------------
  const createTodo = useMutation({
    mutationFn: (newTodo: TodoData) => API.post("/todo/create", newTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      formCreate.resetFields();
    },
  });

  // Update Todo----------------------------
  const updateTodo = useMutation({
    mutationFn: (updatedTodo: TodoData) =>
      API.put(`/todo/update/${updatedTodo.id}`, updatedTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setIsModalVisible(false);
    },
  });

  // Delete Todo-----------------------
  const deleteTodo = useMutation({
    mutationFn: (id: string) => API.delete(`/todo/delete/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const onCreateFinish = (values: TodoData) => {
    createTodo.mutate(values);
  };

  const onUpdateFinish = (values: TodoData) => {
    if (!editTodo?.id) return;
    updateTodo.mutate({ ...editTodo, ...values });
  };

  const handleEdit = (todo: TodoData) => {
    formEdit.setFieldsValue({ todotext: todo.todotext });
    setEditTodo(todo);
    setIsModalVisible(true);
  };

  const handleDelete = (id?: string) => {
    if (id) deleteTodo.mutate(id);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.log("Logout failed:", err);
    }
  };

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <Button onClick={logout}>Logout</Button>
      <p>{user?.name}</p>
      <p>{user?.email}</p>

      {/* Create Todo Form================================= */}
      <Form
        form={formCreate}
        layout="vertical"
        onFinish={onCreateFinish}
        style={{ maxWidth: 600, margin: "20px" }}
      >
        <Form.Item
          label="Task"
          name="todotext"
          rules={[{ required: true, message: "Please enter a task!" }]}
        >
          {/* <Input placeholder="Enter Task" /> */}
          <TextArea rows={4} placeholder="Enter Task" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={createTodo.isPending}>
            Add Task
          </Button>
        </Form.Item>
      </Form>

      {/*----------------- Todo Cards------------------- */}
      <Flex wrap gap="middle" justify="center" style={{ margin: "20px" }}>
        {todos?.length ? (
          todos.map((todo) => (
            <Card key={todo.id} style={{ width: "200px" }}>
              <Flex justify="space-between">
                <EditOutlined style={{ color: "blue" }} onClick={() => handleEdit(todo)} />
                <DeleteOutlined
                  style={{ color: "red" }}
                  onClick={() => handleDelete(todo.id)}
                />
              </Flex>
              <p>{todo.todotext}</p>
            </Card>
          ))
        ) : (
          <Card style={{ width: 300 }}>
            <p>No tasks available</p>
          </Card>
        )}
      </Flex>

      {/* Edit Modal ==========================*/}
      <Modal
        title="Edit Task"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={formEdit} layout="vertical" onFinish={onUpdateFinish}>
          <Form.Item
            label="Task"
            name="todotext"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            {/* <Input /> */}
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateTodo.isPending}>
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

export default Homepage;
