import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, Users, Rocket, Brain, Code, Target } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-bold mb-2">About Chargur</h2>
                  <p className="text-purple-100 text-lg">
                    We're not a dev shop. We're not a brand.<br />
                    We're just two people who got tired of broken workflows—<br />
                    <span className="font-semibold">and built something better.</span>
                  </p>
                </motion.div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-6 space-y-8">
                  {/* Origin Story */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                      <Zap className="w-8 h-8 text-orange-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-3">The Pivot</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Chargur started as a pivot. We were days into a hackathon with an entirely different idea—
                        then scrapped the whole thing when we realized: <strong>we didn't have the tool we needed to build right in the first place.</strong>
                      </p>
                      <p className="text-gray-700 mt-3">
                        So we made one.
                      </p>
                    </div>
                  </motion.section>

                  {/* Who We Are */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">Who We Are</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2">Alyssa (aka CtrlAlyDelete)</h4>
                        <p className="text-gray-700 leading-relaxed">
                          Not a developer. A builder. A strategist. A chaos organizer.
                          The one who steps in when everyone else is spinning their wheels.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-2">Jacob</h4>
                        <p className="text-gray-700 leading-relaxed">
                          The dev behind the scenes. Built Chargur's AI logic, custom nodes, and made Bolt do things it wasn't built to do.
                          Quietly brilliant, ridiculously fast, and only half-joking when he says,
                        </p>
                        <blockquote className="italic text-green-700 border-l-2 border-green-300 pl-3 mt-2">
                          "I'm prompting two AIs at once—let's go."
                        </blockquote>
                      </div>
                    </div>
                  </motion.section>

                  {/* Why We Built It */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-800">Why We Built Chargur</h3>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span>Because planning your app shouldn't be harder than building it.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span>Because most tools give you either a blank page or too many buttons.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span>Because starting over three times just to get your architecture right is a waste of everyone's time—and tokens.</span>
                        </li>
                      </ul>
                      
                      <p className="mt-4 text-purple-800 font-medium">
                        Chargur is the tool we wish we had when we started.<br />
                        Now it exists. And we're just getting started.
                      </p>
                    </div>
                  </motion.section>

                  {/* What We Believe */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-red-600" />
                      <h3 className="text-xl font-bold text-gray-800">What We Believe</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Great tools don't need to be loud—they just need to work.",
                        "Clarity > code.",
                        "If it feels like chaos, it probably is. So organize it.",
                        "You don't have to be a dev to have dev-worthy ideas.",
                        "No one's coming to fix it for you. So fix it yourself."
                      ].map((belief, index) => (
                        <div 
                          key={index}
                          className="bg-red-50 p-3 rounded-lg border border-red-200 text-gray-700 text-sm"
                        >
                          {belief}
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* What's Next */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Rocket className="w-5 h-5 text-teal-600" />
                      <h3 className="text-xl font-bold text-gray-800">What's Next</h3>
                    </div>
                    
                    <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
                      <p className="text-gray-700 mb-4">
                        Chargur's already showing signs of something bigger:
                        It's modular. It's scalable. And it's deeply context-aware.
                      </p>
                      
                      <p className="text-gray-700 mb-3 font-medium">We're exploring:</p>
                      
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <Code className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span>Multi-platform expansion (beyond Bolt)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Code className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span>Token usage prediction</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Code className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span>User templates + team collaboration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Code className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span>Export tools & persistent cloud storage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Code className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span>Public beta post-hackathon</span>
                        </li>
                      </ul>
                    </div>
                  </motion.section>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 text-center">
                <p className="text-gray-600 text-sm">
                  Made with <Heart className="w-4 h-4 text-red-500 inline" /> by Alyssa & Jacob
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};