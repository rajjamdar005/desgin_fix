import { useState, useEffect } from 'react'
import { ClerkLoaded, SignIn, SignUp, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import DesignFix from './components/DesignFix'
import Results from './pages/Results'
import carpenterImg from './assets/carrrr.jpg'
import './App.css'

const authAppearance = {
  variables: {
    colorPrimary: '#667eea',
  },
  elements: {
    formButtonPrimary: 'auth-primary-button',
  },
}

function App() {
  const [authMode, setAuthMode] = useState('sign-in')
  const [path, setPath] = useState(window.location.pathname || '/')

  // simple client-side routing: update when history changes
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleAuthToggle = () => {
    setAuthMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'))
  }

  return (
    <div className="app-shell">
      <SignedIn>
        <div className="signed-in-header">
          <UserButton 
            appearance={{ 
              elements: { 
                avatarBox: 'user-avatar-main',
                userButtonPopoverCard: 'user-menu-card'
              } 
            }} 
          />
        </div>
      </SignedIn>

      <main className="app-main">
        <SignedIn>
          <div className="app-content">
            {path === '/results' ? <Results /> : <DesignFix />}
          </div>
        </SignedIn>

        <SignedOut>
          <ClerkLoaded>
            <div className="auth-container">
              {/* Left side - Dark Geometric Background */}
              <div className="auth-brand-side">
                <div className="auth-brand-content">
                  <div className="auth-brand-logo">
                    <span className="brand-icon"></span>
                    <span className="brand-name">DesignFix</span>
                  </div>
                  <h1 className="auth-hero-title">
                    Analyze Smarter. Design Better. Create Anywhere.
                  </h1>
                  <p className="auth-hero-subtitle">
                    From quick website analysis to in-depth design insights, our powerful AI helps you work seamlessly across devices.
                  </p>
                </div>
              </div>

              {/* Right side - Auth Forms */}
              <div className="auth-form-side">
                <div className="auth-form-wrapper">
                  <h2 className="auth-title">Welcome Back!</h2>
                  <p className="auth-subtitle">
                    Log in to start creating stunning videos with ease.
                  </p>
                  
                  <div className="auth-card">
                    {authMode === 'sign-in' ? (
                      <SignIn appearance={authAppearance} routing="virtual" signUpUrl="#sign-up" afterSignInUrl="/" />
                    ) : (
                      <SignUp appearance={authAppearance} routing="virtual" signInUrl="#sign-in" afterSignUpUrl="/" />
                    )}
                  </div>
                  
                  <div className="auth-switch">
                    {authMode === 'sign-in' ? (
                      <span>
                        Don't have an account?{' '}
                        <button type="button" onClick={handleAuthToggle} className="auth-switch-btn">
                          Sign up here
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{' '}
                        <button type="button" onClick={handleAuthToggle} className="auth-switch-btn">
                          Sign in
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ClerkLoaded>
        </SignedOut>
      </main>
    </div>
  )
}

export default App
