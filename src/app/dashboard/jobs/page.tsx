'use client';

export default function JobsPage() {
  const activeJobs = [
  {
    title: "Frontend Developer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote",
    salary: "$4000/month",
  },
  {
    title: "Product Manager",
    department: "Product",
    type: "On-site",
    location: "Noida",
    salary: "$5000/month",
  },
];

const inactiveJobs = [
  {
    title: "UI Designer",
    department: "Design",
    type: "Remote",
    location: "Delhi",
    salary: "$3500/month",
  },
  {
    title: "Manager",
    department: "Sales",
    type: "On-site",
    location: "Mumbai",
    salary: "$4500/month",
  },
  {
    title: "Business Development Manager",
    department: "BDM",
    type: "Remote",
    location: "Bangalore",
    salary: "$3800/month",
  },
];

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Jobs Page</h1>

        {/* Active Jobs */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">Active Jobs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeJobs.map((job, index) => (
              <div
                key={index}
                // className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition duration-300"
               className="p-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition duration-300"

              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Department: {job.department}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Location: {job.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Type: {job.type}</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Salary: {job.salary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Inactive Jobs */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Inactive Jobs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveJobs.map((job, index) => (
              <div
                key={index}
                className="p-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition duration-300"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Department: {job.department}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Location: {job.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Type: {job.type}</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Salary: {job.salary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
  );
}
