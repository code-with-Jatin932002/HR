'use client';

export default function DepartmentsPage() {
  const departments = [
    {
      name: "Design Department",
      members: 12,
      people: [
        { name: "Ayesha Khan", role: "Lead Designer" },
        { name: "Rahul Mehra", role: "UI/UX Designer" },
      ],
    },
    {
      name: "Sales Department",
      members: 18,
      people: [
        { name: "Sonal Verma", role: "Sales Manager" },
        { name: "Aman Roy", role: "Account Executive" },
      ],
    },
    {
      name: "Marketing Department",
      members: 10,
      people: [
        { name: "Priya Sharma", role: "Marketing Lead" },
        { name: "Vikash Kumar", role: "Content Strategist" },
      ],
    },
    {
      name: "Project Management",
      members: 16,
      people: [
        { name: "Nikita Joshi", role: "Project Manager" },
        { name: "Ravi Patel", role: "Scrum Master" },
      ],
    },
    {
      name: "HR Department",
      members: 8,
      people: [
        { name: "Anjali Singh", role: "HR Manager" },
        { name: "Deepak Sinha", role: "Recruiter" },
      ],
    },
    {
      name: "Development Team",
      members: 25,
      people: [
        { name: "Kunal Sharma", role: "Lead Developer" },
        { name: "Neha Yadav", role: "Frontend Developer" },
      ],
    },
  ];


  return (
    
    <div className="p-6 bg-gray-100 dark:bg-gray-950 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">All Departments</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-800 shadow-md rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">{dept.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{dept.members} Members</p>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
                    See Members
                  </button>
                </div>

                <ul className="mt-4 space-y-2">
                  {dept.people.map((person, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-200 flex justify-between">
                      <span>{person.name}</span>
                      <span className="text-gray-400 italic">{person.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

  );
}
