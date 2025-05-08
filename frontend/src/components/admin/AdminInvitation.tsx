import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import adminService from '../../services/admin.service';

interface AdminInvitation {
  _id: string;
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
}

const AdminInvitation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchInvitations = async () => {
    try {
      const data = await adminService.listAdminInvitations();
      setInvitations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin invitations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await adminService.createAdminInvitation(email);
      toast({
        title: 'Success',
        description: 'Admin invitation sent successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setEmail('');
      fetchInvitations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create admin invitation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box p={4}>
      <form onSubmit={handleCreateInvitation}>
        <FormControl mb={4}>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          loadingText="Sending Invitation"
        >
          Send Invitation
        </Button>
      </form>

      <Box mt={8}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Expires At</Th>
              <Th>Created At</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invitations.map((invitation) => (
              <Tr key={invitation._id}>
                <Td>{invitation.email}</Td>
                <Td>
                  <Badge colorScheme={invitation.used ? 'green' : 'yellow'}>
                    {invitation.used ? 'Used' : 'Pending'}
                  </Badge>
                </Td>
                <Td>{formatDate(invitation.expiresAt)}</Td>
                <Td>{formatDate(invitation.createdAt)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AdminInvitation; 