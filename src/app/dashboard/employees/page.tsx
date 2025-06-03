
'use client';

import { useState } from 'react';
import { FaUser, FaFileAlt, FaEnvelope, FaSlack, FaGithub } from "react-icons/fa"; // Importing the necessary icons


export default function EmployeesPage() {
  const [currentStep, setCurrentStep] = useState(1); // Track current step (1: Personal, 2: Professional, etc.)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: ''
  });
  const [professionalInfo, setProfessionalInfo] = useState({
    employeeId: '',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: ''
  });
  const [documentInfo, setDocumentInfo] = useState({
    photo: null,
    appointmentLetter: null
  });
  const [accountInfo, setAccountInfo] = useState({
    emailAddress: '',
    slackId: '',
    githubId: ''
  });

  // const handleNextStep = () => {
  //   setCurrentStep(currentStep + 1);
  // };

  // const handlePreviousStep = () => {
  //   setCurrentStep(currentStep - 1);
  // };

    // Previous and Next Step Handlers
  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto bg-gray-100 dark:bg-gray-900 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">Add Employee</h1>

        {/* Section Navigation */}
        <div className="mb-6 flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className={`text-xl ${currentStep === 1 ? 'text-blue-600' : 'text-gray-600'}`}
          >
                                      <FaUser className="mr-2" /> 

            Personal Information
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className={`text-xl ${currentStep === 2 ? 'text-blue-600' : 'text-gray-600'}`}
          >
                                      <FaSlack className="mr-2" /> 

            Professional Information
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className={`text-xl ${currentStep === 3 ? 'text-blue-600' : 'text-gray-600'}`}
          >
                          <FaFileAlt className="mr-2" /> 
            Documents
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className={`text-xl ${currentStep === 4 ? 'text-blue-600' : 'text-gray-600'}`}
          >
                                      <FaGithub className="mr-2" /> 

            Account Access
          </button>
        </div>

        {/* Personal Information Section */}
        {currentStep === 1 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2">Personal Information</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="John Doe"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="john@example.com"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="1234567890"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Date of Birth</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  value={personalInfo.dob}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Gender</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  value={personalInfo.gender}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Address</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  rows={2}
                  placeholder="123 Street, City"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
                >
                  Next
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Professional Information Section */}
        {currentStep === 2 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2">Professional Information</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Employee ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="EMP001"
                  value={professionalInfo.employeeId}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, employeeId: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Department</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="IT, HR, etc."
                  value={professionalInfo.department}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, department: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Designation</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="Software Engineer"
                  value={professionalInfo.designation}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, designation: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Joining Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  value={professionalInfo.joiningDate}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, joiningDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Employment Type</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  value={professionalInfo.employmentType}
                  onChange={(e) => setProfessionalInfo({ ...professionalInfo, employmentType: e.target.value })}
                >
                  <option value="">Select</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Intern</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded mr-4"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
                >
                  Next
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Documents Section */}
        {currentStep === 3 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2">Documents</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Profile Photo</label>
                <input
                  type="file"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  // onChange={(e) => setDocumentInfo({ ...documentInfo, photo: e.target.files[0] })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Appointment Letter</label>
                <input
                  type="file"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  // onChange={(e) => setDocumentInfo({ ...documentInfo, appointmentLetter: e.target.files[0] })}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded mr-4"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
                >
                  Next
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Account Access Section */}
        {currentStep === 4 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-2">Account Access</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="john@example.com"
                  value={accountInfo.emailAddress}
                  onChange={(e) => setAccountInfo({ ...accountInfo, emailAddress: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">Slack ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="john_slack"
                  value={accountInfo.slackId}
                  onChange={(e) => setAccountInfo({ ...accountInfo, slackId: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 dark:text-gray-300">GitHub ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  placeholder="john_github"
                  value={accountInfo.githubId}
                  onChange={(e) => setAccountInfo({ ...accountInfo, githubId: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded mr-4"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => alert('Form Submitted!')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
