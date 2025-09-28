import { ExclamationTriangleIcon, CircleStackIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const SetupRequired = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Database Setup Required
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Your Supabase database needs to be configured before using SANGBO BERDE
          </p>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-start">
            <CircleStackIcon className="h-6 w-6 text-blue-600 mt-1" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Database Schema Not Found
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                The required database tables haven't been created yet. Follow these steps to set up your database:
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Access Supabase Dashboard</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Go to your Supabase project dashboard and navigate to the SQL Editor
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Run Database Schema</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Copy and paste the complete SQL schema from the setup guide
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Verify Tables Created</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Check the Table Editor to confirm all tables are created successfully
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Need Help?
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Check the <code className="bg-blue-100 px-1 rounded">DATABASE_SETUP.md</code> file in your project for detailed instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh After Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupRequired
