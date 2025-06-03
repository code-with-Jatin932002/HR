
'use client';

export default function PayrollPage() {
  const payrollData = [
    {
      id: 1,
      name: "Anjali Singh",
      ctc: "₹9,00,000",
      salaryPerMonth: "₹75,000",
      deduction: "₹5,000",
      status: "Paid",
    },
    {
      id: 2,
      name: "Ravi Kumar",
      ctc: "₹6,00,000",
      salaryPerMonth: "₹50,000",
      deduction: "₹2,000",
      status: "Pending",
    },
    {
      id: 3,
      name: "Sonal Verma",
      ctc: "₹10,00,000",
      salaryPerMonth: "₹83,333",
      deduction: "₹3,500",
      status: "On Hold",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-200 text-green-700 dark:bg-green-700 dark:text-white";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white";
      case "On Hold":
        return "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white";
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Payroll Records</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-900 dark:text-gray-100">
          <thead className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Employee Name</th>
              <th className="px-6 py-4">CTC</th>
              <th className="px-6 py-4">Salary / Month</th>
              <th className="px-6 py-4">Deduction</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-200">
            {payrollData.map((payroll) => (
              <tr key={payroll.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 font-medium">{payroll.name}</td>
                <td className="px-6 py-4">{payroll.ctc}</td>
                <td className="px-6 py-4">{payroll.salaryPerMonth}</td>
                <td className="px-6 py-4">{payroll.deduction}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payroll.status)}`}>
                    {payroll.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
