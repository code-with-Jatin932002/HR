
'use client';
import { useState } from "react";
import Image from 'next/image';
import RegisterModal from '@/components/RegisterModal';
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

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
  const [showRegister, setShowRegister] = useState(false);
  const router =  useRouter()
  return (
    <div className="min-h-screen bg-[#FAF7FF]    font-sans overflow-x-hidden -mb-15">
      {showRegister && <RegisterModal onRegisterSuccessAndRedirectToSignIn={() => {
      setShowRegister(false);
      router.push("/signin"); // ✅ redirect
       } }  onClose={() => setShowRegister(false)} />}
 <section id ="home"
  className="relative h-[88vh] w-full flex items-center justify-center overflow-hidden rounded-b-[2rem] shadow-2xl"
>
  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/img.png"
      alt="HR Dashboard"
      className="w-full h-full object-cover brightness-60"
    />
    {/* Stronger Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-indigo-900/60 to-indigo-800/50"></div>
  </div>

  {/* Decorative Blur Circles */}
  <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/25 rounded-full blur-[100px]"></div>
  <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/25 rounded-full blur-[100px]"></div>

  {/* Content */}
  <div className="relative z-10 max-w-2xl text-center px-6">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-white drop-shadow-2xl">
      Revolutionize Your{" "}
      <span className="bg-gradient-to-r from-pink-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">
        HR Processes
      </span>
    </h1>
    <p className="text-lg sm:text-xl mb-6 max-w-lg mx-auto text-gray-100 drop-shadow-lg">
      Simplify hiring, secure data, and drive performance with our sleek,
      all-in-one HR portal tailored for your team.
    </p>
    <button
     onClick={() => setShowRegister(true)}
      className="inline-block bg-gradient-to-r from-pink-600 via-yellow-600 to-red-500
                 text-white font-semibold py-3 px-10 rounded-full text-lg shadow-lg
                 hover:from-pink-600 via-yellow-600 to-red-500 transition-all duration-300 
                 transform hover:scale-110 hover:shadow-2xl"         
    >
     🚀 Get Started
    </button>
  </div>
</section>
      {/* Main */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Intro */}
        <section id="intro" className="my-20  -mt-15 text-center bg-gradient-to-r from-purple-50 to-purple-100 
                    py-20 rounded-3xl shadow-inner">
          <div className="mx-auto max-w-screen-xl px-4 lg:grid lg:grid-cols-2 items-center gap-16">
            <div className="mb-8 lg:mb-0"> 
              <img
                className="w-full h-100 rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                src="/img.png"
                alt="HR Dashboard"
              />
            </div>
            <div className="p-15 rounded-3xl bg-white shadow-xl border border-purple-100 hover:shadow-2xl transition duration-500">
              <h2 className="mb-6 text-4xl font-extrabold text-purple-800">
                Simplify Complex HR Tasks
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                  Managing HR doesn’t have to be complicated. Our portal turns complex processes into simple, automated workflows—making onboarding, payroll, and performance tracking effortless. With all employee records stored securely in one place, your HR team can focus less on paperwork and more on people.               
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id = "services" className="my-20 -mt-15 text-center bg-white py-20 rounded-3xl shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-14">
            Core Features Designed for You
          </h2>

          <div className="max-w-7xl mx-auto px-6 sm:px-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: "📝", title: "Effortless Profile Management", desc: "Quickly create and manage HR profiles.", color: "from-purple-400 to-purple-600" },
              { icon: "⏱️", title: "Attendance Tracking", desc: "Monitor staff attendance and leave requests.", color: "from-pink-400 to-pink-600" },
              { icon: "📁", title: "Employee Directory", desc: "Maintain a searchable database of employees.", color: "from-indigo-400 to-indigo-600" },
              { icon: "📊", title: "Analytics & Reports", desc: "Gain insights into HR trends with visual reports.", color: "from-yellow-400 to-yellow-600" },
              { icon: "🚀", title: "Onboarding & Offboarding", desc: "Automate new hires and departing processes.", color: "from-red-400 to-red-600" },
              { icon: "🔒", title: "Security & Compliance", desc: "Protect sensitive data with secure standards.", color: "from-fuchsia-400 to-fuchsia-600" },
            ].map((f, i) => (
              <div
                key={i}
                className="group bg-gradient-to-r from-purple-50 to-purple-100 
                    py-12 rounded-3xl p-8 shadow-xl border border-gray-200 
                           hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500"
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r ${f.color} text-white text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                  <span>{f.icon}</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-base group-hover:text-gray-700 transition-colors duration-300">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
          <section className="my-20 -mt-15 text-center bg-gradient-to-r from-purple-50 to-purple-100 
                    py-20 rounded-3xl shadow-inner">
  <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-14">
    What Our Users Saying
  </h2>

  <div className="flex flex-wrap justify-center gap-10">
    {testimonials.map((t, index) => (
      <div
        key={index}
        className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl max-w-sm text-center
                   border border-purple-200 shadow-inner hover:shadow-xl
                   transition duration-300 transform hover:scale-105"
      >
        {/* Image */}
        <div className="flex justify-center mb-6">
          <Image
            src={t.image}
            alt={t.name}
            width={80}
            height={80}
            className="rounded-full object-cover border-4 border-purple-100 shadow-md"
          />
        </div>

        {/* Review */}
        <p className="text-gray-700 italic text-lg leading-relaxed mb-4">
          "{t.review}"
        </p>
        <h4 className="font-extrabold text-purple-700 text-xl">{t.name}</h4>
        <p className="text-sm text-gray-500">HR Manager at Leading Corp.</p>
      </div>
    ))}
  </div>
</section>

 <section id="about" className="my-20  -mt-15 text-center bg-white py-20 rounded-3xl shadow-2xl">
        <div className="mx-auto max-w-screen-xl px-4 lg:grid lg:grid-cols-2 items-center gap-16">
          <div className="mb-8 lg:mb-0">
            <img
              className="w-full rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
              src="/hrrr.png"
              alt="about-us"
            />
          </div>
          <div className="group bg-gradient-to-r from-purple-50 to-purple-100 
                    py-12 rounded-3xl p-8 shadow-xl border border-gray-200 
                           hover:shadow-2xl  transition-all duration-500">
            <h2 className="mb-4 text-4xl font-extrabold text-purple-600 dark:text-purple">
              About Us
            </h2>
            <p className="text-gray-700 dark:text-gray-900 text-lg leading-relaxed">
           At HR Portal, we believe managing people should be as seamless as managing business goals. Our HR Management Portal is designed to empower organizations with a modern, efficient, and user-friendly platform that simplifies every aspect of Human Resource management.

          From employee onboarding to payroll, performance tracking, and compliance, our solution ensures HR teams spend less time on paperwork and more time on people.

          We combine technology, innovation, and human touch to help companies build stronger teams, foster growth, and create a workplace where everyone thrives.            </p>
          </div>
        </div>
      </section>

        {/* Brands */}
        <section className="my-20 -mt-15 text-center bg-gradient-to-r from-purple-50 to-purple-100 
                    py-20 rounded-3xl shadow-inner">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-10">Trusted by Leading Organizations</h2>
          <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-10">
            {brandLogos.map((logo, idx) => (
              <div key={idx} className="relative h-16 w-40 md:h-20 md:w-48 flex items-center justify-center
                                         grayscale hover:grayscale-0 transition duration-300 hover:scale-110">
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

        {/* CTA */}
       <section id ="free"
  className="relative -mt-15 bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 
             text-white text-center py-24 px-6 rounded-3xl shadow-2xl overflow-hidden"
>
  {/* Decorative Blur Circles */}
  <div className="absolute -top-24 -left-24 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-[100px]"></div>
  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px]"></div>

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>

  {/* Content */}
  <div className="relative z-10 max-w-3xl mx-auto">
    <h3 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-xl">
      Ready to Transform Your <span className="bg-gradient-to-r from-pink-500 via-yellow-500 to-red-500 text-transparent bg-clip-text">HR?</span>
    </h3>
    <p className="mb-12 text-lg md:text-xl text-purple-100 leading-relaxed">
      Join hundreds of businesses already experiencing efficient HR management.  
      Sign up today and revolutionize your workflow.
    </p>

    <button
     onClick={() => setShowRegister(true)}
      className="relative bg-gradient-to-r from-pink-600 via-yellow-600 to-red-500
                 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg
                 hover:from-fuchsia-600 hover:from-pink-600 via-yellow-600 to-red-500 transition-all duration-300
                 transform hover:scale-110 hover:shadow-2xl"
    >
      <span className="relative z-10">🚀 Register for Free Trial</span>
    </button>
  </div>
</section>

      </main>
    </div>
  );
}
