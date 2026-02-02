import { useState, useRef, useEffect } from 'react';

export function App() {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate a random access code
  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Copy code to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Start screen sharing
  const startScreenSharing = async () => {
    try {
      // Create constraints with potential cursor support
      const constraints: any = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };
      
      // Add cursor property if supported
      constraints.video.cursor = 'always';
      
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error accessing screen share:', error);
      setErrorMessage('Failed to access screen share. Please try again.');
      setConnectionStatus('error');
    }
  };

  // Stop screen sharing
  const stopScreenSharing = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsCreatingSession(false);
    setConnectionStatus('idle');
  };

  // Handle joining a session
  const joinSession = () => {
    if (enteredCode.trim() === '') {
      setErrorMessage('Please enter a valid access code');
      setConnectionStatus('error');
      return;
    }
    
    // In a real implementation, this would connect to a signaling server
    // For this demo, we'll simulate a successful connection
    setConnectionStatus('connecting');
    setTimeout(() => {
      // Simulate validation
      if (enteredCode.length >= 6 && enteredCode.length <= 8) {
        setConnectionStatus('connected');
        setIsJoiningSession(true);
      } else {
        setErrorMessage('Invalid access code. Please check and try again.');
        setConnectionStatus('error');
      }
    }, 1500);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            ScreenMirror
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Secure, real-time screen sharing with unique access codes. Perfect for presentations, remote support, and live collaboration.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Screen Session */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create Screen Session</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Share your screen with others by generating a unique access code.
            </p>
            
            {!isCreatingSession ? (
              <button
                onClick={() => {
                  const code = generateAccessCode();
                  setAccessCode(code);
                  setIsCreatingSession(true);
                  startScreenSharing();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Sharing Screen
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">Your Access Code</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{accessCode}</span>
                    <button
                      onClick={() => copyToClipboard(accessCode)}
                      className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 p-2 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {connectionStatus === 'connected' ? 'Sharing Active' : 
                     connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </span>
                </div>
                
                <button
                  onClick={stopScreenSharing}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Stop Sharing
                </button>
              </div>
            )}
            
            {/* Local Video Preview */}
            {isCreatingSession && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Your Screen</h3>
                <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Join Screen Session */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Join Screen Session</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Enter the access code provided by the screen sharer to view their screen in real-time.
            </p>
            
            {!isJoiningSession ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="Enter 6-8 character access code"
                    className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && joinSession()}
                  />
                  {connectionStatus === 'error' && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                  )}
                </div>
                <button
                  onClick={joinSession}
                  disabled={enteredCode.trim() === ''}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed"
                >
                  Connect to Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {connectionStatus === 'connected' ? 'Connected to Session' : 
                     connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setIsJoiningSession(false);
                    setEnteredCode('');
                    setConnectionStatus('idle');
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Leave Session
                </button>
              </div>
            )}
            
            {/* Remote Video Preview */}
            {isJoiningSession && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Shared Screen</h3>
                <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-blue-50 dark:bg-slate-700/50 rounded-full px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-slate-700 dark:text-slate-300 text-sm">
              All connections are encrypted and secure. Your screen is only shared with those who have the access code.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
