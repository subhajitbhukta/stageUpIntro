import React, { useState, useEffect } from 'react';

const App = ({ onComplete, onPlatformSelect }) => {
  const [phase, setPhase] = useState('fade-in');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [logoVisibility, setLogoVisibility] = useState([false, false, false, false]);

  const platforms = [
    {
      id: 'kids',
      name: 'Kids StageUp',
      icon: '🎨',
      description: 'Creative Learning for Young Minds',
      link: 'https://stageup.in/'
    },
    {
      id: 'school',
      name: 'School StageUp',
      icon: '📚',
      description: 'Comprehensive School Education',
      link: 'https://stageup.in/'
    },
    {
      id: 'adv',
      name: 'ADV StageUp',
      icon: '🎯',
      description: 'Advanced Skill Development',
      link: "https://stageuppro.netlify.app/"
    },
    {
      id: 'pro',
      name: 'Pro StageUp',
      icon: '💼',
      description: 'Professional Growth & Development',
      link: "https://stageuppro.netlify.app/"
    }
  ];

  useEffect(() => {
    const timers = [];
    logoVisibility.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setLogoVisibility(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 200 + 300)
      );
    });

    timers.push(
      setTimeout(() => {
        setPhase('showing');
      }, 1500)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const handlePlatformSelect = (platform) => {
  setSelectedPlatform(platform.id);

  // if external link -> open new tab immediately and do not fade out
  if (platform.link) {
    window.open(platform.link, "_blank");
    return;
  }

  // else internal navigation logic (if any)
  setPhase('selected');
  setTimeout(() => {
    setPhase('fade-out');
    setTimeout(() => {
      onComplete(platform.id);
      if (onPlatformSelect) onPlatformSelect(platform.id);
    }, 500);
  }, 800);
};


  return (
    <div className={` inset-0 z-50 flex flex-col bg-white transition-all duration-700 ${
      phase === 'fade-out' ? 'opacity-0' : 'opacity-100'
    }`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
      <div className="relative z-10 max-w-6xl w-full px-6 mx-auto flex-1 flex flex-col justify-center py-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 delay-100 ${
          logoVisibility[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-3 leading-tight tracking-tight">
            StageUp – Empowering the Future Coders of India
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-4 font-medium">
            "From Curiosity to Career – A Complete Coding Journey"
          </p>
          <div className="w-20 h-0.5 bg-gray-900 mx-auto"></div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {platforms.map((platform, index) => (
            <div
              key={platform.id}
              onClick={() => phase === 'showing' && handlePlatformSelect(platform)}
              className={`transition-all duration-500 ${
                logoVisibility[index] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              } ${
                selectedPlatform === null 
                  ? 'scale-100' 
                  : selectedPlatform === platform.id 
                    ? 'scale-105' 
                    : 'scale-95 opacity-50'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`
                relative bg-white rounded-xl border-2 border-gray-200 p-8
                transform transition-all duration-300 cursor-pointer
                ${phase === 'showing' ? 'hover:border-gray-900 hover:shadow-lg hover:-translate-y-1' : ''}
                ${selectedPlatform === platform.id ? 'border-gray-900 shadow-lg' : ''}
              `}>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                    {platform.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {platform.name}
                </h3>
                
                <p className="text-gray-600 text-sm text-center mb-6">
                  {platform.description}
                </p>

                {/* Button */}
                <div className="flex justify-center">
                  <div className={`
                    inline-flex items-center gap-2 text-sm font-medium
                    ${selectedPlatform === platform.id ? 'text-gray-900' : 'text-gray-700'}
                    group-hover:text-gray-900 transition-colors
                  `}>
                    {platform.link ? 'Visit Platform' : 'Get Started'}
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling certification badges section */}
      <div className={`relative z-10 py-3 border-t border-gray-200 bg-gray-50 transition-all duration-700 delay-300 ${
        logoVisibility[3] ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-center text-gray-500 text-xs font-medium mb-4 tracking-wider uppercase">
            We Are Supported By
          </h3>
          
          {/* Scrolling container */}
          <div className="relative overflow-hidden mb-2">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
            
            {/* Scrolling content */}
            <div className="flex animate-scroll">
              {/* First set */}
              <div className="flex items-center gap-6 px-3">
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Google for Education</div>
                </div>
                
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Scratch</div>
                </div>
                
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">CodePen</div>
                </div>
                
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Khan Academy</div>
                </div>
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-6 px-3">
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Google for Education</div>
                </div>
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Scratch</div>
                </div>
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">CodePen</div>
                </div>
                <div className="flex-shrink-0 bg-white rounded-lg px-5 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Khan Academy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Certifications bar */}
      <div className={`relative z-10 py-2 bg-gray-900 transition-all duration-700 delay-400 ${
        logoVisibility[3] ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <span className="text-sm">✓</span>
              <span>ISO 9001:2015</span>
            </div>
            <div className="w-px h-3 bg-gray-600"></div>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <span className="text-sm">🏢</span>
              <span>MSME Registered</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-center text-gray-500 text-xs font-medium">
          © 2025 StageUp. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default App;

