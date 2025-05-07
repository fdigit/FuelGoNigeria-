import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  vendorName: string;
  driverName: string;
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

export default function RateReview() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      orderId: 'ORD001',
      rating: 5,
      comment: 'Excellent service! The driver was very professional and arrived on time.',
      createdAt: '2024-03-01',
      vendorName: 'Fuel Station A',
      driverName: 'John Doe',
    },
    {
      id: '2',
      orderId: 'ORD002',
      rating: 4,
      comment: 'Good service overall, but there was a slight delay in delivery.',
      createdAt: '2024-03-02',
      vendorName: 'Fuel Station B',
      driverName: 'Jane Smith',
    },
  ]);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newReview, setNewReview] = useState<Partial<Review>>({
    rating: 5,
    comment: '',
  });

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setNewReview(review);
    setIsEditing(true);
  };

  const handleSaveReview = () => {
    if (!newReview.comment) {
      showToast('Please provide a comment' as ToastType, 'error');
      return;
    }

    if (isEditing && selectedReview) {
      setReviews(reviews.map(review => 
        review.id === selectedReview.id ? { ...review, ...newReview } : review
      ));
      showToast('Review updated successfully' as ToastType, 'success');
    } else {
      const newReviewWithId = {
        ...newReview,
        id: Date.now().toString(),
        orderId: 'ORD' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        createdAt: new Date().toISOString(),
        vendorName: 'Fuel Station C',
        driverName: 'Mike Johnson',
      } as Review;
      setReviews([...reviews, newReviewWithId]);
      showToast('Review submitted successfully' as ToastType, 'success');
    }

    setIsEditing(false);
    setSelectedReview(null);
    setNewReview({ rating: 5, comment: '' });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    showToast('Review deleted successfully' as ToastType, 'success');
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={`h-5 w-5 ${
        filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
      }`}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rate & Review</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => {
            setIsEditing(false);
            setSelectedReview(null);
            setNewReview({ rating: 5, comment: '' });
          }}
        >
          Write a Review
        </motion.button>
      </div>

      {/* Review List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {review.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled={i < review.rating} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {review.comment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {review.vendorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {review.driverName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {(isEditing || selectedReview === null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {isEditing ? 'Edit Review' : 'Write a Review'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating
                </label>
                <div className="mt-2 flex items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="focus:outline-none"
                    >
                      <StarIcon filled={rating <= (newReview.rating || 0)} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Comment
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedReview(null);
                  setNewReview({ rating: 5, comment: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 