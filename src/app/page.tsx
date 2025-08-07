'use client';

import Image from 'next/image';

const testimonials = [
  {
    name: "John Doe",
    review: "This HR portal has completely streamlined our onboarding process!",
    image: "/people/person1.jpg",
  },
  {
    name: "Sarah Smith",
    review: "Super clean UI and very intuitive for HR teams.",
    image: "/people/person2.jpg",
  },
  {
    name: "David Johnson",
    review: "Managing employee data is now effortless. Highly recommended!",
    image: "/people/person3.jpg",
  },
];

const brandLogos = [
  "/brands/jasa.png",
  "/brands/infotech.png",
  "/brands/techwave.png",
  "/brands/hrspark.png",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section - This section now takes the full width of the screen */}
      <section
        className="relative bg-gradient-to-r from-blue-500 to-blue-500 h-[450px] md:h-[550px]
                   flex items-center justify-center text-white overflow-hidden shadow-xl mb-16"
      >
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="relative z-10 text-center px-6 container mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Revolutionize Your <span className="text-blue-200">HR Management</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Streamline hiring, automate employee data, and empower your team with our intuitive, all-in-one HR portal.
          </p>
          <button className="bg-white text-blue-500 font-bold py-3 px-8 rounded-full text-lg
                             hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Main content wrapper - Now the `container` and `mx-auto` classes are here */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Introduction/Problem-Solution Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Simplify Complex HR Tasks</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our HR portal is designed to take the burden off your HR department, allowing them to focus on what truly matters: your people. From onboarding to offboarding, we've got you covered.
          </p>
          <div className="flex justify-center mt-8">
            <Image
              src="/ab.jpg"
              alt="HR Portal Dashboard Preview"
              width={800}
              height={500}
              className="rounded-xl shadow-2xl border-4 border-white transform hover:scale-102 transition duration-300"
            />
          </div>
        </section>

        <hr className="my-12 border-t-2 border-gray-200" />

        {/* Features Section */}
        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700">Core Features Designed for You</h2>
          <p className="text-lg text-gray-600 mb-10">Discover how our portal transforms your HR operations.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-blue-100 rounded-xl shadow-lg
                            hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-blue-500">📝</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Effortless Profile Management</h3>
              <p className="text-gray-600">Quickly create, update, and manage comprehensive HR profiles with secure access controls.</p>
            </div>
            <div className="bg-white p-8 border border-blue-100 rounded-xl shadow-lg
                            hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-green-500">⏱️</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Advanced Attendance Tracking</h3>
              <p className="text-gray-600">Monitor staff attendance, leave requests, and punctuality in real-time, simplifying payroll processing.</p>
            </div>
            <div className="bg-white p-8 border border-blue-100 rounded-xl shadow-lg
                            hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-purple-500">📁</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Centralized Employee Directory</h3>
              <p className="text-gray-600">Maintain a dynamic, searchable database of all employees, departments, and critical information.</p>
            </div>
            {/* Additional features */}
            <div className="bg-white p-8 border border-blue-100 rounded-xl shadow-lg
                            hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-yellow-500">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Insightful Analytics & Reporting</h3>
              <p className="text-gray-600">Gain valuable insights into HR trends with customizable reports and data visualizations.</p>
            </div>
            <div className="bg-white p-8 border border-blue-100 rounded-xl shadow-lg
                            hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-red-500">🚀</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Seamless Onboarding & Offboarding</h3>
              <p className="text-gray-600">Automate processes for new hires and departing employees, ensuring a smooth transition.</p>
            </div>
            <div className="bg-white p-8 border border-blue-100 rounded-xl shadow-lg
                            hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-5xl mb-4 text-orange-500">🔒</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Robust Security & Compliance</h3>
              <p className="text-gray-600">Protect sensitive data with industry-leading security features and compliance standards.</p>
            </div>
          </div>
        </section>

        <hr className="my-12 border-t-2 border-gray-200" />

        {/* Testimonials */}
        <section className="my-16 text-center bg-blue-50 py-16 rounded-2xl shadow-inner">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">What Our Users Are Saying</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bg-white p-8 shadow-xl rounded-lg max-w-sm text-center
                           border-b-4 border-blue-400 hover:border-blue-600
                           transition duration-300 transform hover:scale-105"
              >
                <div className="flex justify-center mb-6">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
                <p className="text-gray-700 italic text-lg leading-relaxed mb-4">"{t.review}"</p>
                <h4 className="font-extrabold text-blue-700 text-xl">{t.name}</h4>
                <p className="text-sm text-gray-500">HR Manager at Leading Corp.</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="my-12 border-t-2 border-gray-200" />

        {/* Trusted by Brands */}
        <section className="mb-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Trusted by Leading Organizations</h2>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {brandLogos.map((logo, idx) => (
              <div key={idx} className="relative h-16 w-36 md:h-20 md:w-44 flex items-center justify-center
                                         grayscale hover:grayscale-0 transition duration-300">
                <Image
                  src={logo}
                  alt={`Brand ${idx}`}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </section>

        <hr className="my-12 border-t-2 border-gray-200" />

        {/* CTA - Call to Action */}
        <section className="bg-blue-600 text-white text-center py-16 px-6 rounded-2xl mt-10 shadow-xl border border-blue-800">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your HR?</h3>
          <p className="mb-8 text-lg md:text-xl max-w-3xl mx-auto">
            Join hundreds of businesses that are already experiencing the benefits of efficient HR management. Sign up today and revolutionize your workflow.
          </p>
          <button className="bg-white text-blue-700 font-bold py-3 px-10 rounded-full text-xl
                             hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg">
            Register for Free Trial
          </button>
        </section>
      </main>
    </div>
  );
}