import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogo, EnvelopeSimple } from '@phosphor-icons/react';

export default function LoginPage() {
  const { user, signInWithGoogle, sendMagicLink, completeMagicLinkSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if coming from a magic link
    completeMagicLinkSignIn();
  }, [completeMagicLinkSignIn]);

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSending(true);
    await sendMagicLink(email);
    setIsSending(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Replace with actual logo URL if available */}
        <div className="w-20 h-20 bg-teal rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold font-serif">
          JL
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-teal-dark font-serif">
          Sovereign Community
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
          The Coaching with Michelle community. Move from fine to done.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-linen py-8 px-4 shadow-xl shadow-black/5 sm:rounded-xl sm:px-10 border border-teal/10">
          
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-teal text-teal bg-white rounded-lg hover:bg-teal/5 transition-colors font-medium"
          >
            <GoogleLogo size={20} weight="bold" />
            Continue with Google
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-teal/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-linen px-2 text-gray-500">Or use email</span>
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleMagicLinkSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeSimple className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-teal/20 rounded-lg bg-white/50 focus:bg-white focus:ring-teal focus:border-teal sm:text-sm transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-clay hover:bg-clay-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending link...' : 'Send Magic Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
