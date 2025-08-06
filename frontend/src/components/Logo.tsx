import { Flex } from "antd";
import { Typography } from 'antd';
 
const { Title } = Typography;
 
function Logo() {
  return (
    <>
      <Flex vertical={false} align="center" gap="small">
        <img style={{ height: "6vh" }} src="./logo.png" />
        <Title level={2} style={{ textAlign: "center", alignItems: "center", marginTop:10, marginLeft :"10px", fontFamily: "roboto" }}>
          CubeFactory
        </Title>
      </Flex>
    </>
  );
}
 
export default Logo;