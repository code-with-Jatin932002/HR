
'use client';
// Assuming useAuthRedirect is now useProtectRoute as per your structure
// import useProtectRoute from '../../hooks/useProtectRoute'; 
import useProtectRoute from '@/hooks/useProtectRoute';
import { useAuth } from '@/context/AuthContext';


export default function DashboardPage() {
  // const router = useRouter(); // No longer directly used in this component due to hook
  useProtectRoute(); // 🔐 protect page

    const { loading } = useAuth();

  if (loading) return null;

  // Removed redundant useEffect, as useProtectRoute handles authentication checks
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     router.replace('/'); // redirect to login if no token
  //   }
  // }, []);



  return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="p-6 min-h-screen bg-gray-100">
      {/* 🧑 Welcome */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-1">Welcome to your Dashboard</h1>
        <p className="text-gray-700">
          {/* Hello, 👋 <strong>Guest</strong>  */}
        </p>
      </div>

      {/* 🔢 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[ 
          { title: 'Total Employees', value: '340', color: 'bg-blue-100 text-blue-700' },
          { title: 'Active HR', value: '12', color: 'bg-green-100 text-green-700' },
          { title: 'Pending Leaves', value: '24', color: 'bg-yellow-100 text-yellow-700' },
          { title: 'Payroll Processed', value: '₹9.3L', color: 'bg-purple-100 text-purple-700' },
        ].map((card, index) => (
          <div key={index} className={`p-4 rounded-lg shadow-md ${card.color}`}>
            <h4 className="text-lg font-semibold">{card.title}</h4>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 📊 Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-64 flex items-center justify-center">
          <p className="text-gray-500">📊 Chart 1 Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-64 flex items-center justify-center">
          <p className="text-gray-500">📈 Chart 2 Placeholder</p>
        </div>
      </div>

      {/* 🧾 Table & Chat */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table */}
        

        <div className="bg-white p-6 rounded-lg shadow-md xl:col-span-2">
  <h3 className="text-xl font-semibold mb-4 text-blue-600">Recent Leave Requests</h3>

  {/* 🛠️ Make table responsive */}
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left">
      <thead className="bg-blue-100 text-blue-700">
        <tr>
          <th className="px-4 py-2 whitespace-nowrap">Employee</th>
          <th className="px-4 py-2 whitespace-nowrap">Department</th>
          <th className="px-4 py-2 whitespace-nowrap">From</th>
          <th className="px-4 py-2 whitespace-nowrap">To</th>
          <th className="px-4 py-2 whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody>
        {[ 
          { name: 'Aman Singh', dept: 'HR', from: '2025-05-12', to: '2025-05-14', status: 'Approved' },
          { name: 'Ravi Kumar', dept: 'Dev', from: '2025-05-10', to: '2025-05-12', status: 'Pending' },
        ].map((row, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">{row.dept}</td>
            <td className="px-4 py-2">{row.from}</td>
            <td className="px-4 py-2">{row.to}</td>
            <td className="px-4 py-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {row.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


        {/* Chat */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Chat</h3>
          <ul className="space-y-4">
            {[ 
              { name: 'Anjali', text: 'Leave approved ✅', time: '2m ago' },
              { name: 'Rohit', text: 'Payroll done 💸', time: '5m ago' },
              { name: 'Neha', text: 'New job posted 📌', time: '10m ago' },
            ].map((chat, i) => (
              <li key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold">{chat.name}</p>
                  <p className="text-gray-600">{chat.text}</p>
                </div>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
          </div>

  );
}





