import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const AboutModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h2 className="text-xl font-black tracking-tighter text-orange-500">SunSide</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">About the App</h3>
            <p className="text-gray-700 text-sm leading-relaxed font-medium">
              SunSide helps you choose the smartest seat on any public transport — left or right — so you avoid direct sunlight during your journey.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed font-medium">
              Using real-time solar position tracking and live route data, SunSide calculates exactly which side of the vehicle will face the sun at every point of your trip, so you arrive cooler, comfortable, and tanning-free.
            </p>
          </section>

          <div className="h-px bg-gray-50 w-full"></div>

          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Why it was built</h3>
            <p className="text-gray-700 text-sm leading-relaxed font-medium italic">
              "Ever sat on the wrong side of a bus on a hot summer day? This app was built to solve exactly that — a simple problem that millions of daily commuters face but no app has ever solved."
            </p>
          </section>

          <div className="h-px bg-gray-50 w-full"></div>

          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'FastAPI', 'Leaflet.js', 'OSRM', 'SunCalc', 'OpenStreetMap'].map(tech => (
                <span key={tech} className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold">{tech}</span>
              ))}
            </div>
          </section>

          <div className="h-px bg-gray-50 w-full"></div>

          <section className="space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">👨‍💻 Developer</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white">
                NKR
              </div>
              <div>
                <h4 className="text-base font-black text-gray-800">Nabin Kumar Rouniyar</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Yantra Technology</p>
              </div>
            </div>
            
            <div className="grid gap-3 pt-2">
              <a href="mailto:nabingupta68@gmail.com" className="flex items-center gap-3 text-xs font-bold text-gray-600 hover:text-orange-500 transition-colors">
                <span className="text-base">📧</span> nabingupta68@gmail.com
              </a>
              <a href="https://github.com/Nabin68" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-bold text-gray-600 hover:text-orange-500 transition-colors">
                <span className="text-base">🐙</span> github.com/Nabin68
              </a>
              <a href="https://www.linkedin.com/in/nabin-rouniyar-86682726a/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-bold text-gray-600 hover:text-orange-500 transition-colors">
                <span className="text-base">💼</span> LinkedIn →
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <p className="text-[10px] italic font-bold text-gray-300">Made with ☀️ to beat the sun</p>
        </div>
      </div>
    </div>
  );
};

AboutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AboutModal;
