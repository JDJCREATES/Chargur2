import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Target, 
  Users, 
  TrendingUp, 
  Zap, 
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Star,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';

interface IdeationDiscoveryProps {
  stage: Stage;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

export const IdeationDiscovery: React.FC<IdeationDiscoveryProps> = ({
  stage,
  onComplete,
  onUpdateData,
}) => {
  const [formData, setFormData] = useState({
    appIdea: '',
    appName: '',
    tagline: '',
    problemStatement: '',
    targetUsers: '',
    valueProposition: '',
    competitors: '',
    keyFeatures: [] as string[],
    platform: 'web',
    techStack: [] as string[],
    uiStyle: 'clean-minimal',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  const quickTags = [
    'E-commerce', 'AI/ML', 'Social', 'Productivity', 'Health', 'Education',
    'Finance', 'Entertainment', 'Travel', 'Food', 'Fitness', 'Gaming'
  ];

  const personas = [
    { id: 'student', emoji: '🧑‍🎓', label: 'Student' },
    { id: 'developer', emoji: '🧑‍💻', label: 'Developer' },
    { id: 'manager', emoji: '🧑‍💼', label: 'Manager' },
    { id: 'shopper', emoji: '🛍️', label: 'Shopper' },
    { id: 'creator', emoji: '🎨', label: 'Creator' },
    { id: 'entrepreneur', emoji: '🚀', label: 'Entrepreneur' },
  ];

  const commonFeatures = [
    'User Authentication', 'Real-time Chat', 'Push Notifications', 'Payment Processing',
    'Map Integration', 'File Upload', 'Search & Filters', 'Analytics Dashboard',
    'Social Sharing', 'Offline Support', 'Multi-language', 'Dark Mode'
  ];

  const techOptions = [
    'React', 'TypeScript', 'Tailwind CSS', 'Material-UI', 'Supabase',
    'Firebase', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB'
  ];

  const uiStyles = [
    { id: 'sleek-dark', label: 'Sleek & Dark', desc: 'Modern dark theme with bold accents' },
    { id: 'fun-playful', label: 'Fun & Playful', desc: 'Bright colors and rounded elements' },
    { id: 'clean-minimal', label: 'Clean & Minimal', desc: 'Simple, focused, lots of whitespace' },
    { id: 'professional', label: 'Professional', desc: 'Corporate-friendly, trustworthy' },
  ];

  const toggleTag = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updated);
  };

  const togglePersona = (persona: string) => {
    const updated = selectedPersonas.includes(persona)
      ? selectedPersonas.filter(p => p !== persona)
      : [...selectedPersonas, persona];
    setSelectedPersonas(updated);
  };

  const toggleFeature = (feature: string) => {
    const updated = formData.keyFeatures.includes(feature)
      ? formData.keyFeatures.filter(f => f !== feature)
      : [...formData.keyFeatures, feature];
    updateFormData('keyFeatures', updated);
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !formData.keyFeatures.includes(customFeature.trim())) {
      updateFormData('keyFeatures', [...formData.keyFeatures, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const toggleTechStack = (tech: string) => {
    const updated = formData.techStack.includes(tech)
      ? formData.techStack.filter(t => t !== tech)
      : [...formData.techStack, tech];
    updateFormData('techStack', updated);
  };

  const generateAISummary = () => {
    const summary = `
**${formData.appName || 'Your App'}** ${formData.tagline ? `- "${formData.tagline}"` : ''}

**Mission:** ${formData.appIdea || 'Building something amazing'}

**Problem:** ${formData.problemStatement || 'Solving user pain points'}

**Target Users:** ${selectedPersonas.join(', ') || 'Various user types'}

**Value Proposition:** ${formData.valueProposition || 'Unique value for users'}

**Key Features:** ${formData.keyFeatures.join(', ') || 'Core functionality'}

**Platform:** ${formData.platform} | **Style:** ${uiStyles.find(s => s.id === formData.uiStyle)?.label}

**Tech Stack:** ${formData.techStack.join(', ') || 'Modern web technologies'}
    `.trim();

    return summary;
  };

  return (
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Ideation & Discovery</h3>
        <p className="text-sm text-gray-600">Let's understand your vision and build the foundation</p>
      </div>

      {/* 1.1 App Idea Overview */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <Typography className="font-medium text-sm">App Idea Overview</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What are you building?</label>
              <textarea
                value={formData.appIdea}
                onChange={(e) => updateFormData('appIdea', e.target.value)}
                placeholder="Describe your app idea in a few sentences..."
                rows={3}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => updateFormData('appName', e.target.value)}
                  placeholder="MyAwesomeApp"
                  className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateFormData('tagline', e.target.value)}
                  placeholder="Your app in 3 words"
                  className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Tags</label>
              <div className="flex flex-wrap gap-1">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.2 Problem Statement */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-600" />
            <Typography className="font-medium text-sm">Problem Statement</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What core problem are you solving?</label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => updateFormData('problemStatement', e.target.value)}
                placeholder="Describe the main problem your app addresses..."
                rows={2}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Who has this problem?</label>
              <input
                type="text"
                value={formData.targetUsers}
                onChange={(e) => updateFormData('targetUsers', e.target.value)}
                placeholder="Describe your target users..."
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.3 Target Users / Personas */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Target Users & Personas</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Who is this for?</p>
            <div className="grid grid-cols-2 gap-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => togglePersona(persona.id)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedPersonas.includes(persona.id)
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{persona.emoji}</span>
                    <span className="text-sm font-medium">{persona.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.4 Value Proposition */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">Value Proposition</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What's your secret sauce?</label>
              <textarea
                value={formData.valueProposition}
                onChange={(e) => updateFormData('valueProposition', e.target.value)}
                placeholder="What makes your app unique and valuable?"
                rows={2}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.5 Competitor Awareness */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <Typography className="font-medium text-sm">Competitor Awareness (Optional)</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What tools/apps already exist like this?</label>
              <textarea
                value={formData.competitors}
                onChange={(e) => updateFormData('competitors', e.target.value)}
                placeholder="List similar apps or tools (optional)..."
                rows={2}
                className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.6 Key Features */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Key Features</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-1">
              {commonFeatures.map((feature) => (
                <label key={feature} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.keyFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Add custom feature..."
                className="flex-1 p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addCustomFeature()}
              />
              <button
                onClick={addCustomFeature}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.7 Platform & Device Intent */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <Typography className="font-medium text-sm">Platform & Tech Stack</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mobile', label: 'Mobile', icon: Smartphone },
                  { value: 'web', label: 'Web', icon: Monitor },
                  { value: 'both', label: 'Both', icon: Tablet },
                ].map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <button
                      key={platform.value}
                      onClick={() => updateFormData('platform', platform.value)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        formData.platform === platform.value
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tech Preferences</label>
              <div className="flex flex-wrap gap-1">
                {techOptions.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTechStack(tech)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      formData.techStack.includes(tech)
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.8 UI Style Preferences */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-600" />
            <Typography className="font-medium text-sm">UI Style Preferences</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-2">
            {uiStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => updateFormData('uiStyle', style.id)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  formData.uiStyle === style.id
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-sm">{style.label}</div>
                <div className="text-xs text-gray-500">{style.desc}</div>
              </button>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.9 AI Recap Summary */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">AI Summary & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Project Summary</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateAISummary()}</pre>
            </div>
            
            <button
              onClick={onComplete}
              disabled={!formData.appIdea.trim()}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.appIdea.trim()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Complete Ideation & Discovery
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};