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

interface UserPersona {
  name: string;
  role: string;
  painPoint: string;
  emoji: string;
  id?: string;
}

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
    <div className="space-y-4">
      {/* Rest of your JSX components */}
    </div>
  );
};