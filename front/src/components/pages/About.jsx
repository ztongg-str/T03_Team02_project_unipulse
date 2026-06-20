export default function About() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>About UniPulse</h1>
        <p>Empowering the modern student experience</p>
      </div>

      <div className="mx-auto max-w-[720px] py-10">
        <p className="text-base leading-[1.7] text-judge-gray mb-6">
          UniPulse is a campus event platform designed to help students discover,
          participate in, and engage with the vibrant community around them.
          From workshops and seminars to social gatherings and sports events,
          UniPulse brings everything happening on campus to your fingertips.
        </p>

        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
        <p className="text-base leading-[1.7] text-judge-gray mb-6">
          We believe that university life is about more than just academics.
          It's about building connections, exploring new interests, and creating
          memories that last a lifetime. UniPulse makes it easy to find your
          community and stay engaged.
        </p>

        <h3 className="text-2xl font-bold mb-4">Key Features</h3>
        <ul className="text-base leading-8 text-judge-gray pl-5">
          <li>Browse and discover campus events</li>
          <li>Register for events with one click</li>
          <li>Connect with friends and build your community</li>
          <li>Earn achievements and track your streaks</li>
          <li>Personalized event recommendations</li>
        </ul>
      </div>
    </div>
  );
}
