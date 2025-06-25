import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import adminService from '../../services/admin.service';
import type { AdminInvitation } from '../../services/api';

// Type the icons as React components
const PlusIcon = FaPlus as unknown as React.FC;
const TrashIcon = FaTrash as unknown as React.FC;

const AdminInvitation: React.FC = () => {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await adminService.listAdminInvitations();
      setInvitations(response);
    } catch (error) {
      showToast('error', 'Failed to load admin invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAdminInvitation(email, role);
      setShowModal(false);
      setEmail('');
      setRole('ADMIN');
      fetchInvitations();
      showToast('success', 'Invitation sent successfully');
    } catch (error) {
      showToast('error', 'Failed to create invitation');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteAdminInvitation(id);
      fetchInvitations();
      showToast('success', 'Invitation deleted successfully');
    } catch (error) {
      showToast('error', 'Failed to delete invitation');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Invitations</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <PlusIcon />
          <span className="ms-2">New Invitation</span>
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation) => (
            <tr key={invitation._id}>
              <td>{invitation.email}</td>
              <td>{invitation.role}</td>
              <td>{invitation.status}</td>
              <td>{new Date(invitation.createdAt).toLocaleDateString()}</td>
              <td>{new Date(invitation.expiresAt).toLocaleDateString()}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(invitation._id)}
                >
                  <TrashIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Admin Invitation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminInvitation; 