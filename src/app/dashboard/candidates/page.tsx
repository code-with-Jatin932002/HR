'use client';

export default function CandidatesPage() {

  const candidates = [
    {
      name: "Amit Sharma",
      position: "Frontend Developer",
      date: "2025-05-10",
      email: "amit.sharma@example.com",
      mobile: "+91 9876543210",
      status: "Shortlisted",
    },
    {
      name: "Priya Verma",
      position: "UI/UX Designer",
      date: "2025-05-08",
      email: "priya.verma@example.com",
      mobile: "+91 9811123456",
      status: "Interview Scheduled",
    },
    {
      name: "Ravi Kapoor",
      position: "Backend Developer",
      date: "2025-05-06",
      email: "ravi.kapoor@example.com",
      mobile: "+91 9887654321",
      status: "Pending",
    },
  ];



  return (
     <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          Candidate Applications
        </h1>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-left bg-gray-100  dark:bg-gray-900 dark:text-gray-100">
            <thead className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase text-sm">
              <tr>
                <th className="px-6 py-3">Candidate Name</th>
                <th className="px-6 py-3">Applied For</th>
                <th className="px-6 py-3">Applied Date</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Mobile Number</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, idx) => (
                <tr
                  key={idx}
                  className="border-t  border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.position}</td>
                  <td className="px-6 py-4">{c.date}</td>
                  <td className="px-6 py-4">{c.email}</td>
                  <td className="px-6 py-4">{c.mobile}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        c.status === "Shortlisted"
                          ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-white"
                          : c.status === "Interview Scheduled"
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-white"
                          : "bg-red-200 text-red-800 dark:bg-red-700 dark:text-white"
                      }`}
                    >
                      {c.status}
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
