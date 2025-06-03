
'use client'; // only if you're using app directory with client-side logic

import Image from 'next/image';

const testimonials = [
  {
    name: "John Doe",
    review: "This HR portal has completely streamlined our onboarding process!",
    image: "/people/person1.jpg", // Put image in public/people folder
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
    <div className="p-4 md:p-10">

      {/* Hero Section */}
      
      <div
        className="relative bg-cover bg-center h-[400px] rounded-lg mb-12 "
        style={{ backgroundImage: "url('/ab.jpg')" }}
      >
        {/* <div className="bg-black bg-opacity-50 h-full flex flex-col items-center justify-center text-white rounded-lg"> */}
        <div className="absolute inset-0  bg-opacity-50 flex flex-col items-center justify-center text-white rounded-lg px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2">Smart HR Management</h1>
          <p className="text-sm sm:text-base md:text-lg">Streamline hiring, employee data & more — all in one portal.</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4 text-blue-600">Features</h2>
        <p className="text-gray-600">Powerful tools for your HR management</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-left">
        <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">📝 Create HR Profiles</h3>
          <p className="text-gray-600">Add and manage HR members quickly with secure access.</p>
        </div>
        <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">⏱️ Track Attendance</h3>
          <p className="text-gray-600">Monitor staff attendance and leave records in real-time.</p>
        </div>
        <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">📁 Employee Directory</h3>
          <p className="text-gray-600">Maintain a searchable database of employees and departments.</p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="my-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">What Our Users Say</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-white p-6 shadow-md rounded-lg max-w-sm text-center"
            >
              <div className="flex justify-center mb-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              </div>
              <p className="text-gray-700 italic">"{t.review}"</p>
              <h4 className="font-bold mt-2">{t.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted by Brands */}
      <div className="mb-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Trusted by Brands</h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {brandLogos.map((logo, idx) => (
            <div key={idx} className="relative h-22 w-38">
              <Image
                src={logo}
                alt={`Brand ${idx}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-500 text-white text-center py-10 rounded-lg mt-10">
        <h3 className="text-2xl font-bold mb-2">Ready to streamline your HR process?</h3>
        <p className="mb-4">Register now and get started in minutes.</p>
        <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition">
          Register Now
        </button>
      </div>
    </div>
  );
}


