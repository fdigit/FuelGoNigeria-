import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import adminService from '../../services/admin.service';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const [allUsers, pending] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getPendingUsers(),
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setIsLoading(true);
      await adminService.approveUser(userId);
      toast({
        title: 'Success',
        description: 'User approved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      await adminService.rejectUser(selectedUser._id, rejectReason);
      toast({
        title: 'Success',
        description: 'User rejected successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsRejectModalOpen(false);
      setRejectReason('');
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      setIsLoading(true);
      await adminService.updateUserStatus(userId, status as 'active' | 'suspended' | 'rejected');
      toast({
        title: 'Success',
        description: 'User status updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'suspended':
        return 'orange';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const renderUserTable = (userList: User[]) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {userList.map((user) => (
          <Tr key={user._id}>
            <Td>{`${user.firstName} ${user.lastName}`}</Td>
            <Td>{user.email}</Td>
            <Td>{user.role}</Td>
            <Td>
              <Badge colorScheme={getStatusColor(user.status)}>{user.status}</Badge>
            </Td>
            <Td>
              {user.status === 'pending' ? (
                <>
                  <Button
                    colorScheme="green"
                    size="sm"
                    mr={2}
                    onClick={() => handleApprove(user._id)}
                    isLoading={isLoading}
                  >
                    Approve
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsRejectModalOpen(true);
                    }}
                    isLoading={isLoading}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Select
                  size="sm"
                  value={user.status}
                  onChange={(e) => handleStatusChange(user._id, e.target.value)}
                  isDisabled={isLoading}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </Select>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  return (
    <Box p={4}>
      <Tabs>
        <TabList>
          <Tab>All Users</Tab>
          <Tab>Pending Users</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {renderUserTable(users)}
          </TabPanel>
          <TabPanel>
            {renderUserTable(pendingUsers)}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject User</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Reason for Rejection</FormLabel>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection"
              />
            </FormControl>
            <Button
              colorScheme="red"
              mt={4}
              onClick={handleReject}
              isLoading={isLoading}
            >
              Confirm Rejection
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement; 