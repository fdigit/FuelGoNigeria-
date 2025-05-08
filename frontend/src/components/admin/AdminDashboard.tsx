import React from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import UserManagement from './UserManagement';
import AdminInvitation from './AdminInvitation';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Admin Dashboard</Heading>
      <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
        <Tabs>
          <TabList>
            <Tab>User Management</Tab>
            <Tab>Admin Invitations</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <UserManagement />
            </TabPanel>
            <TabPanel>
              <AdminInvitation />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 