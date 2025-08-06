import { Form, Input, Button, Typography, Card } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import type { SignUpType } from "../Types/User";
import API from "../api/Api";
 
const { Title } = Typography;
 
const Register: React.FC = () => { 
  const navigate = useNavigate();
  const [form] = Form.useForm();
 
  const onFinish = async (values: SignUpType) => {
       console.log(values);
    try {
      const response = await API.post("/auth/register", values);
      console.log("Registration successful:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
    }
 
  };
 
  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          style={{
            width: 350,
            padding: 24,
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Title level={3} style={{ textAlign: "center" }}>
            Sign Up
          </Title>
          <Form
            form={form}
            name="signup_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical" >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <Input placeholder="Username" />
            </Form.Item>
 
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
                Register
              </Button>
            </Form.Item>
 
            <Form.Item style={{ textAlign: "center" }}>
              Already have an account ?
              <NavLink
                to="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Login
              </NavLink>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};
 
export default Register;
