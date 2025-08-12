import { Form, Input, Button, Typography, Card, Flex } from "antd";
import  Logo  from "../components/Logo";
import { NavLink, useNavigate } from "react-router-dom";
import type { LoginType } from "../Types/User";
import API from "../api/Api";
import { useAuth } from '../contex/AuthContex';
import { useMutation } from "@tanstack/react-query";
 
const { Title } = Typography;
 
const Login = () => {
   const navigate = useNavigate();
   const [form] = Form.useForm();
 const { setUser } = useAuth(); 

  const Logintodo = useMutation({
    mutationFn: (resdata: LoginType) => API.post("/auth/login", resdata),
    onSuccess: (response) => {
      console.log("Login successful:", response.data);
      setUser(response.data.user);
      navigate("/home");
    },
     onError: (error) => {
    console.error("Login failed:", error);
  },
  })

const onFinish = async (values: LoginType) => {
  Logintodo.mutate(values);
}


  // const onFinish = async (values: LoginType) => {
  //   try {
  //     console.log('Sending Login data:', values);
  //     // await API.post("/login", values);
  //   const response = await API.post("/auth/login", values);
  //   setUser(response.data.user);
  //     // const response = await API.get("/me");
  //     // setUser(response.data);
  //     navigate("/home");
  //   } catch (err: any) {
  //     console.error("Login failed:", err.response?.data || err.message);
  //   }
  // };
    
  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: '#F5F5F5'
        }}
      >
        <Card
          style={{
            width: 400,
            padding: 24,
            backgroundColor: "white",
            border: "none",
            borderRadius: 12,
          }}
        >
          <Flex justify="center" style={{marginBottom:20}}><Logo /></Flex>
          {/* <Title level={4} style={{ textAlign: "center", marginTop: 20 }}>
            Login to your account
          </Title> */}
          <Form
            form={form}
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            disabled={false}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
 
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};
 
export default Login;
 
