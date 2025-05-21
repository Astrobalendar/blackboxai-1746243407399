import React from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { signOut } from 'firebase/auth';
import { firebaseService } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import HeaderDropdownMenu from '../components/HeaderDropdownMenu';
import { Calendar, Star, Moon, Sun, Clock, BarChart, User, Settings, ArrowRight } from 'lucide-react';

const features = [
  {
    title: 'Daily Horoscopes',
    description: 'Get personalized daily horoscope predictions based on your birth chart.',
    icon: <Star className="w-8 h-8 text-blue-500" />,
    link: '/horoscope'
  },
  {
    title: 'Astrological Calendar',
    description: 'Track important astrological events and planetary movements.',
    icon: <Calendar className="w-8 h-8 text-purple-500" />,
    link: '/calendar'
  },
  {
    title: 'Muhurta Timings',
    description: 'Find auspicious timings for your important events and activities.',
    icon: <Clock className="w-8 h-8 text-yellow-500" />,
    link: '/muhurta'
  },
  {
    title: 'Moon Phases',
    description: 'Track lunar cycles and their astrological significance.',
    icon: <Moon className="w-8 h-8 text-indigo-500" />,
    link: '/moon-phases'
  },
  {
    title: 'Prediction History',
    description: 'View and manage your past predictions and readings.',
    icon: <BarChart className="w-8 h-8 text-green-500" />,
    link: '/predictions'
  },
  {
    title: 'Profile Management',
    description: 'Manage your profile and birth chart details.',
    icon: <User className="w-8 h-8 text-pink-500" />,
    link: '/profiles'
  }
];

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fullName = user?.displayName || user?.email || 'User';

  const handleLogout = async () => {
    await signOut(firebaseService.auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-4 md:px-8 fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
            <Sun className="mr-2 text-yellow-500" />
            AstroBalendar
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/horoscope" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Horoscope</Link>
            <Link to="/calendar" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Calendar</Link>
            <Link to="/muhurta" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Muhurta</Link>
            <Link to="/predictions" className="font-medium text-gray-700 hover:text-blue-600 transition-colors">Predictions</Link>
            
            {user ? (
              <div className="flex items-center space-x-4 ml-4">
                <span className="text-sm font-medium text-gray-700">Welcome, {fullName.split(' ')[0]}</span>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <Link to="/login" className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <HeaderDropdownMenu />
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Your Personal <span className="text-blue-600">Astrological</span> Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Discover daily horoscopes, planetary transits, and auspicious timings tailored to your birth chart.
            Navigate life's journey with celestial wisdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/horoscope"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg"
            >
              Get Your Horoscope
            </Link>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              {user ? 'Go to Dashboard' : 'Start Free Trial'}
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Everything You Need for Astrological Insights
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Powerful tools to help you understand and navigate your astrological journey.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  to={feature.link}
                  className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-100"
                >
                  <div className="mb-4 flex items-center">
                    <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="ml-4 text-lg font-medium text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold mb-6">
              Ready to Explore Your Astrological Journey?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join thousands of users who trust AstroBalendar for accurate and insightful astrological predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Get Started for Free
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Features</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/horoscope" className="text-base text-gray-600 hover:text-blue-600">Horoscope</Link></li>
                <li><Link to="/calendar" className="text-base text-gray-600 hover:text-blue-600">Calendar</Link></li>
                <li><Link to="/muhurta" className="text-base text-gray-600 hover:text-blue-600">Muhurta</Link></li>
                <li><Link to="/predictions" className="text-base text-gray-600 hover:text-blue-600">Predictions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/about" className="text-base text-gray-600 hover:text-blue-600">About Us</Link></li>
                <li><Link to="/blog" className="text-base text-gray-600 hover:text-blue-600">Blog</Link></li>
                <li><Link to="/contact" className="text-base text-gray-600 hover:text-blue-600">Contact</Link></li>
                <li><Link to="/careers" className="text-base text-gray-600 hover:text-blue-600">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/privacy" className="text-base text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-base text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-base text-gray-600 hover:text-blue-600">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Connect</h3>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-base text-gray-500">&copy; {new Date().getFullYear()} AstroBalendar. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">Made with <span className="text-red-500">❤</span> for astrology enthusiasts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
