import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Shield, BarChart3, Users, CheckCircle, Lock } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Secure Digital
              <span className="block text-blue-600">Voting Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience democracy at your fingertips with our state-of-the-art online voting system. 
              Secure, transparent, and accessible to all eligible voters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
              >
                <Vote className="mr-2 h-5 w-5" />
                Register to Vote
              </Link>
              <Link
                to="/results"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 border-2 border-blue-600 rounded-lg transition-colors"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SecureVote?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to ensure every vote counts and every voice is heard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">End-to-End Security</h3>
              <p className="text-gray-600">
                Advanced encryption and blockchain verification ensure your vote remains secure and anonymous.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Identity</h3>
              <p className="text-gray-600">
                Multi-factor authentication and OTP verification prevent fraudulent voting attempts.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Results</h3>
              <p className="text-gray-600">
                Watch democracy in action with live vote counting and transparent result publication.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessible to All</h3>
              <p className="text-gray-600">
                Mobile-friendly design ensures every eligible voter can participate from anywhere.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin Controls</h3>
              <p className="text-gray-600">
                Comprehensive administration panel for election management and oversight.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Voting</h3>
              <p className="text-gray-600">
                Intuitive interface makes casting your vote simple and straightforward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of citizens who trust SecureVote for their democratic participation.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;