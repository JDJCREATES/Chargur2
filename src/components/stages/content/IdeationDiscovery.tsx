import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../store/useAppStore';
import { 
  Lightbulb, 
  Target, 
  Users,
  TrendingUp,  
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { Chip, Stack } from '@mui/material';

interface IdeationDiscoveryProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}
// Add this interface after the imports (around line 15):
interface UserPersona {
  name: string;
  role: string;
  painPoint: string;
  emoji: string;
  id?: string;
}

// Add this interface after the existing UserPersona interface:
interface FormData {
  appIdea: string;
  appName: string;
  tagline: string;
  problemStatement: string;
  userPersonas: UserPersona[];
  valueProposition: string;
  competitors: string;
  platform: string;
  techStack: string[];
  uiStyle: string;
}

export const IdeationDiscovery: React.FC<IdeationDiscoveryProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const { session } = useAuth();
  const defaultFormData = {
    appIdea: '',
    appName: '',
    tagline: '',
    problemStatement: '',
    // To this:
userPersonas: [] as UserPersona[],
    valueProposition: '',
    competitors: '',
    platform: 'web',
    techStack: [] as string[],
    uiStyle: 'clean-minimal',
  };
  
  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));
  const [isSearchingCompetitors, setIsSearchingCompetitors] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  // Function to add a competitor
  const addCompetitor = (competitor: any) => {
    const competitors = formData.competitors || [];
    updateFormData('competitors', [...competitors, competitor]);
  };


 
  // Function to search for competitors using the Edge Function
  const searchCompetitors = async () => {
    if (!formData.appIdea) {
      alert('Please describe your app idea first.');
      return;
    }
    
    try {
      setIsSearchingCompetitors(true);

      // Direct API call to fetch-competitors (bypasses agent-prompt)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-competitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if session is available
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          appDescription: formData.appIdea,
          maxResults: 4
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.error || 'Unknown error'}`;
        } catch (e) {
          errorMessage += ` - ${errorText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.competitors && data.competitors.length > 0) {
        // Update the competitors text field
        const competitorText = data.competitors
          .map((comp: any) => `${comp.name} (${comp.domain}) - ${comp.tagline}`)
          .join('\n');
        
        updateFormData('competitors', competitorText);
        
        // Create structured data for board nodes and pass to parent
        const updatedFormData = {
          ...formData,
          competitors: competitorText,
          // Add competitor nodes data that can be used by the board
          competitorNodes: data.competitors.map((comp: any, index: number) => ({
            id: `competitor-${Date.now()}-${index}-${comp.name.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'competitor',
            data: {
              label: comp.name,
              domain: comp.domain,
              tagline: comp.tagline,
              features: comp.features || [],
              pricing: comp.pricingTiers || [],
              positioning: comp.marketPositioning || 'mid-market',
              strengths: comp.strengths || [],
              weaknesses: comp.weaknesses || [],
              url: comp.link || ''
            },
            position: { 
              x: 100 + (index * 200), 
              y: 100 + (Math.floor(index / 3) * 150) 
            }
          }))
        };
        
        // Update parent with all the data including nodes
        onUpdateData(updatedFormData);
        
        console.log(`✅ Found ${data.competitors.length} competitors via direct API call`);
      } else {
        alert('No competitors found for your app idea. Try refining your description.');
        console.log('⚠️ No competitors found in API response:', data);
      }
    } catch (error) {
      console.error('❌ Failed to search for competitors:', error);
      alert(`Failed to search for competitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearchingCompetitors(false);
    }
  };

  const quickTags = [
    'E-commerce', 'AI/ML', 'Social', 'Productivity', 'Health', 'Education',
    'Finance', 'Entertainment', 'Travel', 'Food', 'Fitness', 'Gaming',
    'SaaS', 'IoT', 'AR/VR', 'Mobile App'
  ];

  const personas = [
    { id: 'student', emoji: '🧑‍🎓', label: 'Student', role: 'Student' },
    { id: 'developer', emoji: '🧑‍💻', label: 'Developer', role: 'Software Developer' },
    { id: 'manager', emoji: '🧑‍💼', label: 'Manager', role: 'Business Manager' },
    { id: 'shopper', emoji: '🛍️', label: 'Shopper', role: 'Consumer' },
    { id: 'creator', emoji: '🎨', label: 'Creator', role: 'Content Creator' },
    { id: 'entrepreneur', emoji: '🚀', label: 'Entrepreneur', role: 'Business Owner' },
    { id: 'teacher', emoji: '👨‍🏫', label: 'Teacher', role: 'Educator' },
    { id: 'doctor', emoji: '👨‍⚕️', label: 'Doctor', role: 'Healthcare Professional' },
    { id: 'designer', emoji: '👨‍🎨', label: 'Designer', role: 'UX/UI Designer' },
    { id: 'analyst', emoji: '👨‍💼', label: 'Analyst', role: 'Data Analyst' },
    { id: 'freelancer', emoji: '💼', label: 'Freelancer', role: 'Independent Worker' },
    { id: 'parent', emoji: '👨‍👩‍👧‍👦', label: 'Parent', role: 'Family Caregiver' },
    { id: 'athlete', emoji: '🏃‍♂️', label: 'Athlete', role: 'Sports Professional' },
    { id: 'chef', emoji: '👨‍🍳', label: 'Chef', role: 'Culinary Professional' },
    { id: 'traveler', emoji: '🧳', label: 'Traveler', role: 'Travel Enthusiast' },
    { id: 'gamer', emoji: '🎮', label: 'Gamer', role: 'Gaming Enthusiast' },
  ];

  const techOptions = [
    'React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Supabase',
    'Firebase', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'React-Native', 'Expo'
  ];

  const uiStyles = [
    { id: 'sleek-dark', label: 'Sleek & Dark', desc: 'Modern apps, developer tools, high-tech' },
    { id: 'fun-playful', label: 'Fun & Playful', desc: 'Consumer apps, kids, games, lifestyle' },
    { id: 'clean-minimal', label: 'Clean & Minimal', desc: 'Startups, design-focused tools, UX-first apps' },
    { id: 'professional', label: 'Professional', desc: 'B2B, fintech, healthcare, enterprise' },
    { id: 'accessible-first', label: 'Accessible-First', desc: 'Inclusive design, education, public services' },
  ];

    // Initialize selectedPersonas based on initialFormData

const [selectedPersonas, setSelectedPersonas] = useState<string[]>(() => {
  if (initialFormData?.userPersonas?.length > 0) {
    return initialFormData.userPersonas
      .map((p: UserPersona) => 
        personas.find(persona => persona.label === p.name)?.id
      )
      .filter(Boolean);
  }
  return [];
});


  const toggleTag = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t: string) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updated);
  };

  const togglePersona = (persona: string) => {
    const personaData = personas.find(p => p.id === persona);
    if (!personaData) return;
    const currentStageId = 'ideation-discovery';
    
    if (selectedPersonas.includes(persona)) {
      // Remove persona
      setSelectedPersonas(selectedPersonas.filter(p => p !== persona));
      // Update local state
      const updatedUserPersonas = formData.userPersonas.filter((p: UserPersona) => p.name !== personaData.label);
      setFormData((prev: any) => ({
        ...prev,
        userPersonas: updatedUserPersonas
      }));
      // Update global state immediately - use the existing method
      useAppStore.getState().updateStageData(currentStageId, { userPersonas: updatedUserPersonas });
      // Also update via the regular callback for consistency
      onUpdateData({ ...formData, userPersonas: updatedUserPersonas });
    } else {
      // Add persona
      setSelectedPersonas([...selectedPersonas, persona]);
      const newPersona = {
        name: personaData.label,
        role: personaData.role,
        painPoint: `Needs solutions for ${personaData.label.toLowerCase()}-specific challenges`,
        emoji: personaData.emoji,
        id: `persona-${personaData.id}`
      };
      // Update local state
      const updatedUserPersonas = [...formData.userPersonas, newPersona];
      setFormData((prev: any) => ({
        ...prev,
        userPersonas: updatedUserPersonas
      }));
      // Update global state immediately - use the existing method
      useAppStore.getState().updateStageData(currentStageId, { userPersonas: updatedUserPersonas });
      // Also update via the regular callback for consistency
      onUpdateData({ ...formData, userPersonas: updatedUserPersonas });
    }
  };

  const toggleTechStack = (tech: string) => {
    const updated = formData.techStack.includes(tech)
      ? formData.techStack.filter((t: string) => t !== tech)
      : [...formData.techStack, tech];
    updateFormData('techStack', updated);
  };

  const generateAISummary = () => {
    const summary = `
**${formData.appName || 'Your App'}** ${formData.tagline ? `- "${formData.tagline}"` : ''}

**Mission:** ${formData.appIdea || 'Building something amazing'}

**Problem:** ${formData.problemStatement || 'Solving user pain points'}

**Target Users:** ${formData.userPersonas.map((p: UserPersona) => p.name).join(', ') || 'Various user types'}

**Value Proposition:** ${formData.valueProposition || 'Unique value for users'}

**Platform:** ${formData.platform} | **Style:** ${uiStyles.find(s => s.id === formData.uiStyle)?.label}

**Tech Stack:** ${formData.techStack.join(', ') || 'Modern web technologies'}

**UI Style:** ${uiStyles.find(s => s.id === formData.uiStyle)?.label || 'Clean & Minimal'}
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
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {quickTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => toggleTag(tag)}
                      color={selectedTags.includes(tag) ? "primary" : "default"}
                      variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                      sx={{ margin: '2px' }}
                    />
                  ))}
                </Stack>
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
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.3 Target Users & Personas - NEW SEPARATE SECTION */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Target Users & Personas</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Who has this problem?</label>
              <div className="space-y-2">
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
                        <div>
                          <div className="text-sm font-medium">{persona.label}</div>
                          <div className="text-xs opacity-75">{persona.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Display selected personas */}
                {formData.userPersonas.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Selected User Personas:</h4>
                    <div className="space-y-2">
                      {formData.userPersonas.map((persona: { name: string; role: string; painPoint: string; emoji: string }, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span>{persona.emoji}</span>
                          <span className="font-medium">{persona.name}</span>
                          <span className="text-green-600">({persona.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <div className="mt-2 flex justify-end">
                {isSearchingCompetitors ? (
                  <button
                    disabled
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-400 text-white rounded-md cursor-not-allowed"
                  >
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </button>
                ) : (
                  <button
                    onClick={searchCompetitors}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Find Competitors
                  </button>
                )}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.6 Platform & Device Intent */}
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
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {techOptions.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      onClick={() => toggleTechStack(tech)}
                      color={formData.techStack.includes(tech) ? "secondary" : "default"}
                      variant={formData.techStack.includes(tech) ? "filled" : "outlined"}
                      sx={{ margin: '2px' }}
                    />
                  ))}
                </Stack>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 1.7 UI Style Preferences */}
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

      {/* 1.8 AI Recap Summary */}
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
              <h4 className="font-medium text-sm text-gray-800 mb-2">Project Summary ~ .md</h4>
             
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateAISummary()}</pre>
            </div>
            
            <button
              onClick={onComplete}
              disabled={!formData.appIdea.trim() || stage.completed}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.appIdea.trim() && !stage.completed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {stage.completed ? '✅ Stage Complete' : `Complete ${stage.title || 'Ideation & Discovery'}`}
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};