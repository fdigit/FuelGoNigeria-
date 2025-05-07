import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Report {
  id: string;
  type: 'sales' | 'inventory' | 'users' | 'transactions';
  dateRange: {
    start: string;
    end: string;
  };
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
}

export default function Reports() {
  const { showToast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<Report['type']>('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      type: 'sales',
      dateRange: {
        start: '2024-02-01',
        end: '2024-02-29',
      },
      status: 'completed',
      downloadUrl: '/reports/sales-2024-02.pdf',
      createdAt: '2024-03-01T10:00:00Z',
    },
    {
      id: '2',
      type: 'inventory',
      dateRange: {
        start: '2024-02-01',
        end: '2024-02-29',
      },
      status: 'completed',
      downloadUrl: '/reports/inventory-2024-02.pdf',
      createdAt: '2024-03-01T11:00:00Z',
    },
    {
      id: '3',
      type: 'users',
      dateRange: {
        start: '2024-02-01',
        end: '2024-02-29',
      },
      status: 'generating',
      createdAt: '2024-03-01T12:00:00Z',
    },
  ]);

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      type: selectedReportType,
      dateRange,
      status: 'generating',
      createdAt: new Date().toISOString(),
    };

    setReports([newReport, ...reports]);
    showToast('Report generation started' as ToastType, 'info');

    // Simulate report generation
    setTimeout(() => {
      setReports(prev =>
        prev.map(report =>
          report.id === newReport.id
            ? {
                ...report,
                status: 'completed',
                downloadUrl: `/reports/${report.type}-${report.dateRange.start}.pdf`,
              }
            : report
        )
      );
      showToast('Report generated successfully' as ToastType, 'success');
    }, 3000);
  };

  const handleDownloadReport = (report: Report) => {
    if (report.downloadUrl) {
      // Here you would typically trigger the file download
      showToast('Report download started' as ToastType, 'info');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
      </div>

      {/* Report Generator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Generate New Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setSelectedReportType(e.target.value as Report['type'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="users">User Report</option>
              <option value="transactions">Transaction Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Report
          </motion.button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Report Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Generated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {report.type.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {report.dateRange.start} to {report.dateRange.end}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : report.status === 'generating'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(report.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {report.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 