import React, { useState, useEffect } from 'react';
import { Modal, Table, Badge } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { activityService, Activity } from '../../services/api';

interface Props {
  userId: string;
  onClose: () => void;
}

const UserActivityHistory: React.FC<Props> = ({ userId, onClose }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getUserActivity(userId);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activity history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: 'success' | 'failed') => {
    return status === 'success' ? (
      <Badge bg="success">Success</Badge>
    ) : (
      <Badge bg="danger">Failed</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>User Activity History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Device</th>
                <th>IP Address</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id}>
                  <td>{activity.type}</td>
                  <td>{getStatusBadge(activity.status)}</td>
                  <td>
                    {activity.deviceInfo.browser} on {activity.deviceInfo.os}
                    <br />
                    <small className="text-muted">{activity.deviceInfo.device}</small>
                  </td>
                  <td>{activity.ipAddress}</td>
                  <td>{activity.details || '-'}</td>
                  <td>{formatDate(activity.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserActivityHistory; 