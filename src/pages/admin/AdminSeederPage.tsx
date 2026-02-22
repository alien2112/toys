import React, { useState, useEffect } from 'react';

interface SeederStats {
  products: {
    total: number;
    featured: number;
    stock_value: number;
    categories: Array<{ name: string; count: number }>;
  };
  users: {
    total: number;
    admins: number;
  };
  categories: {
    total: number;
  };
  excel_files: {
    toys: { exists: boolean; size: number; modified: number | null };
    birthdays: { exists: boolean; size: number; modified: number | null };
  };
}

interface PreviewData {
  toys: {
    count: number;
    sample: Array<{
      name: string;
      category: string;
      price: number;
      stock: number;
    }>;
  };
  birthdays: {
    count: number;
    sample: Array<{
      name: string;
      category: string;
      price: number;
      stock: number;
    }>;
  };
}

const AdminSeederPage: React.FC = () => {
  const [stats, setStats] = useState<SeederStats | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [includeImages, setIncludeImages] = useState(false);
  const [includeOrders, setIncludeOrders] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'status' | 'preview' | 'actions'>('status');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seeder');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error(data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch seeder status');
      alert('Failed to fetch seeder status');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seeder/preview');
      const data = await response.json();
      
      if (data.success) {
        setPreview(data.data);
      } else {
        console.error(data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch preview data');
      alert('Failed to fetch preview data');
    } finally {
      setLoading(false);
    }
  };

  const seedProducts = async () => {
    await performSeeding('/api/admin/seeder/seed-products', 'Products');
  };

  const seedUsers = async () => {
    await performSeeding('/api/admin/seeder/seed-users', 'Users');
  };

  const seedImages = async () => {
    await performSeeding('/api/admin/seeder/seed-images', 'Product Images');
  };

  const seedAll = async () => {
    await performSeeding('/api/admin/seeder/seed-all', 'All Data');
  };

  const performSeeding = async (endpoint: string, dataType: string) => {
    try {
      setSeeding(true);
      setOutput('');
      
      const formData = new FormData();
      formData.append('mode', mode);
      
      if (endpoint === '/api/admin/seeder/seed-all') {
        formData.append('include_images', includeImages.toString());
        formData.append('include_orders', includeOrders.toString());
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || `${dataType} seeded successfully!`);
        setOutput(data.data?.output || '');
        await fetchStats(); // Refresh stats
      } else {
        console.error(data.message);
        alert(data.message);
        setOutput(data.message);
      }
    } catch (error) {
      console.error(`Failed to seed ${dataType.toLowerCase()}`);
      alert(`Failed to seed ${dataType.toLowerCase()}`);
      setOutput('Network error occurred');
    } finally {
      setSeeding(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Seeding Management</h1>
        <p className="text-gray-600 mt-2">Manage database seeding from Excel files</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['status', 'preview', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && stats && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{stats.products.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className="font-medium">{stats.products.featured}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Value:</span>
                  <span className="font-medium">{stats.products.stock_value.toLocaleString()} KWD</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">{stats.users.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admins:</span>
                  <span className="font-medium">{stats.users.admins}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{stats.categories.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Breakdown</h3>
            <div className="space-y-2">
              {stats.products.categories.map((category) => (
                <div key={category.name} className="flex justify-between items-center">
                  <span className="text-gray-700">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{category.count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(category.count / stats.products.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Excel Files Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Excel Files Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">Toys & Games</h4>
                  <p className="text-sm text-gray-600">الالعاب والدراجات محدث (1).xlsx</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${stats.excel_files.toys.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.excel_files.toys.exists ? '✓ Available' : '✗ Missing'}
                  </div>
                  {stats.excel_files.toys.exists && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(stats.excel_files.toys.size)} - {formatDate(stats.excel_files.toys.modified)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">Baby & Birthday</h4>
                  <p className="text-sm text-gray-600">المواليد محدث (1).xlsx</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${stats.excel_files.birthdays.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.excel_files.birthdays.exists ? '✓ Available' : '✗ Missing'}
                  </div>
                  {stats.excel_files.birthdays.exists && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(stats.excel_files.birthdays.size)} - {formatDate(stats.excel_files.birthdays.modified)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Excel Data Preview</h2>
            <button
              onClick={fetchPreview}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Preview'}
            </button>
          </div>

          {preview && (
            <div className="space-y-6">
              {/* Toys Preview */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Toys & Games ({preview.toys.count} products)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.toys.sample.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.price} KWD
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Birthdays Preview */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Baby & Birthday ({preview.birthdays.count} products)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.birthdays.sample.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.price} KWD
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seeding Options</h3>
            
            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seeding Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="merge"
                    checked={mode === 'merge'}
                    onChange={(e) => setMode(e.target.value as 'merge' | 'replace')}
                    className="mr-2"
                  />
                  <div>
                    <span className="font-medium">Merge</span>
                    <p className="text-sm text-gray-600">Keep existing data and add/update from Excel</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="replace"
                    checked={mode === 'replace'}
                    onChange={(e) => setMode(e.target.value as 'merge' | 'replace')}
                    className="mr-2"
                  />
                  <div>
                    <span className="font-medium">Replace</span>
                    <p className="text-sm text-gray-600">Clear existing data and use only Excel data</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mb-6 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Include product images (slower)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeOrders}
                  onChange={(e) => setIncludeOrders(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Generate sample orders</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={seedProducts}
                disabled={seeding}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed Products'}
              </button>
              
              <button
                onClick={seedUsers}
                disabled={seeding}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed Users'}
              </button>
              
              <button
                onClick={seedImages}
                disabled={seeding}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed Images'}
              </button>
              
              <button
                onClick={seedAll}
                disabled={seeding}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed All Data'}
              </button>
            </div>

            {/* Warning */}
            {mode === 'replace' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex">
                  <div className="text-yellow-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                    <p className="text-sm text-yellow-700">
                      Replace mode will permanently delete all existing data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output */}
          {output && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seeding Output</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSeederPage;
