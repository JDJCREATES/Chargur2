import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  UserCheck, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Download,
  FileText,
  Zap,
  Mail,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Clock,
  UserX,
  RefreshCw,
  Database,
  Code,
  Layers
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';

interface UserAuthFlowProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

interface AuthMethod {
  id: string;
  name: string;
  type: 'email' | 'oauth' | 'magic-link' | 'anonymous';
  enabled: boolean;
  provider?: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    admin: boolean;
  };
  color: string;
}

interface EdgeCase {
  id: string;
  scenario: string;
  handling: string;
  priority: 'high' | 'medium' | 'low';
}

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
}

export const UserAuthFlow: React.FC<UserAuthFlowProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const defaultFormData = {
    authMethods: [
      { id: '1', name: 'Email & Password', type: 'email' as const, enabled: true },
      { id: '2', name: 'Google OAuth', type: 'oauth' as const, enabled: true, provider: 'google' },
      { id: '3', name: 'GitHub OAuth', type: 'oauth' as const, enabled: false, provider: 'github' },
      { id: '4', name: 'Magic Link', type: 'magic-link' as const, enabled: false },
      { id: '5', name: 'Anonymous Access', type: 'anonymous' as const, enabled: false },
    ] as AuthMethod[],
    
    userRoles: [
      {
        id: '1',
        name: 'Guest',
        description: 'Unauthenticated users with limited access',
        permissions: { create: false, read: true, update: false, delete: false, admin: false },
        color: 'gray',
      },
      {
        id: '2',
        name: 'User',
        description: 'Standard authenticated users',
        permissions: { create: true, read: true, update: true, delete: false, admin: false },
        color: 'blue',
      },
      {
        id: '3',
        name: 'Admin',
        description: 'Full access administrators',
        permissions: { create: true, read: true, update: true, delete: true, admin: true },
        color: 'red',
      },
    ] as UserRole[],
    
    sessionManagement: {
      provider: 'supabase',
      tokenStorage: 'localStorage',
      autoRefresh: true,
      sessionTimeout: 7, // days
      idleDetection: false,
      multiDevice: true,
    },
    
    edgeCases: [
      { id: '1', scenario: 'Account Deletion', handling: 'Soft delete with 30-day recovery period', priority: 'high' as const },
      { id: '2', scenario: 'Suspended Account', handling: 'Block login with custom error message', priority: 'high' as const },
      { id: '3', scenario: 'Expired Invitation', handling: 'Show expired message with re-request option', priority: 'medium' as const },
      { id: '4', scenario: 'Password Reset Abuse', handling: 'Rate limit to 3 attempts per hour', priority: 'medium' as const },
      { id: '5', scenario: 'Multiple Failed Logins', handling: 'Temporary account lock after 5 attempts', priority: 'high' as const },
    ] as EdgeCase[],
    
    userMetadata: {
      requiredFields: ['email', 'display_name'],
      optionalFields: ['avatar_url', 'bio', 'location', 'website'],
      preferences: ['theme', 'language', 'notifications', 'privacy_level'],
      tracking: {
        lastLogin: true,
        loginCount: true,
        deviceInfo: false,
        ipTracking: false,
      },
    },
    
    securityFeatures: [
      { id: '1', name: 'Email Verification', description: 'Verify email addresses on signup', enabled: true, required: true },
      { id: '2', name: 'Two-Factor Authentication', description: 'Optional 2FA via TOTP or SMS', enabled: false, required: false },
      { id: '3', name: 'Password Strength Requirements', description: 'Enforce strong password policies', enabled: true, required: true },
      { id: '4', name: 'Rate Limiting', description: 'Limit auth attempts per IP/user', enabled: true, required: true },
      { id: '5', name: 'Device Fingerprinting', description: 'Track and limit devices per user', enabled: false, required: false },
      { id: '6', name: 'Suspicious Activity Detection', description: 'Monitor for unusual login patterns', enabled: false, required: false },
    ] as SecurityFeature[],
    
    onboardingFlow: {
      welcomeScreen: true,
      profileSetup: true,
      featureTour: true,
      dataImport: false,
      teamInvitation: false,
    },
    
    authUX: {
      loginModal: true,
      redirectBehavior: 'dashboard',
      errorHandling: 'toast',
      loadingStates: true,
      socialButtonStyle: 'branded',
      mobileOptimized: true,
    },
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  // Sync formData with initialFormData when it changes
  useEffect(() => {
    if (initialFormData) {
      console.log('Updating UserAuthFlow formData from initialFormData');
      setFormData(prev => ({
        ...prev,
        ...initialFormData
      }));
    }
  }, [initialFormData]);

  const updateFormData = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };

  const toggleAuthMethod = (methodId: string) => {
    const updated = formData.authMethods.map(method =>
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    );
    updateFormData('authMethods', updated);
  };

  const addUserRole = () => {
    const newRole: UserRole = {
      id: Date.now().toString(),
      name: 'New Role',
      description: 'Custom role description',
      permissions: { create: false, read: true, update: false, delete: false, admin: false },
      color: 'purple',
    };
    updateFormData('userRoles', [...formData.userRoles, newRole]);
  };

  const updateUserRole = (roleId: string, updates: Partial<UserRole>) => {
    const updated = formData.userRoles.map(role =>
      role.id === roleId ? { ...role, ...updates } : role
    );
    updateFormData('userRoles', updated);
  };

  const addEdgeCase = () => {
    const newCase: EdgeCase = {
      id: Date.now().toString(),
      scenario: 'New Edge Case',
      handling: 'Define handling strategy',
      priority: 'medium',
    };
    updateFormData('edgeCases', [...formData.edgeCases, newCase]);
  };

  const toggleSecurityFeature = (featureId: string) => {
    const updated = formData.securityFeatures.map(feature =>
      feature.id === featureId ? { ...feature, enabled: !feature.enabled } : feature
    );
    updateFormData('securityFeatures', updated);
  };

  const generateSupabaseSchema = () => {
    return `-- User Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Admin policies
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );`;
  };

  const generateAuthHooks = () => {
    return `// useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
};`;
  };

  const generateAuthSummary = () => {
    const enabledMethods = formData.authMethods.filter(m => m.enabled);
    const enabledSecurity = formData.securityFeatures.filter(f => f.enabled);
    
    return `
**User & Auth Flow Summary**

**Authentication Methods (${enabledMethods.length}):**
${enabledMethods.map(m => `- ${m.name}${m.provider ? ` (${m.provider})` : ''}`).join('\n')}

**User Roles (${formData.userRoles.length}):**
${formData.userRoles.map(r => `- ${r.name}: ${r.description}`).join('\n')}

**Session Management:**
- Provider: ${formData.sessionManagement.provider}
- Token Storage: ${formData.sessionManagement.tokenStorage}
- Auto Refresh: ${formData.sessionManagement.autoRefresh ? 'Yes' : 'No'}
- Session Timeout: ${formData.sessionManagement.sessionTimeout} days

**Security Features (${enabledSecurity.length} enabled):**
${enabledSecurity.map(f => `- ${f.name}`).join('\n')}

**Edge Cases Handled:** ${formData.edgeCases.length}
**Onboarding Steps:** ${Object.values(formData.onboardingFlow).filter(Boolean).length}

**Required Environment Variables:**
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
${formData.authMethods.some(m => m.type === 'oauth') ? '- GOOGLE_CLIENT_ID\n- GOOGLE_CLIENT_SECRET' : ''}
    `.trim();
  };

  return (
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">User & Auth Flow</h3>
        <p className="text-sm text-gray-600">Define authentication, authorization, and user management with security best practices</p>
      </div>

      {/* 6.1 Sign-up / Login Methods */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Sign-up / Login Methods</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Select authentication methods for your app</p>
            
            <div className="space-y-2">
              {formData.authMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {method.type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                      {method.type === 'oauth' && <Globe className="w-4 h-4 text-blue-600" />}
                      {method.type === 'magic-link' && <Zap className="w-4 h-4 text-blue-600" />}
                      {method.type === 'anonymous' && <UserX className="w-4 h-4 text-blue-600" />}
                      <span className="font-medium text-sm text-blue-800">{method.name}</span>
                    </div>
                    {method.provider && (
                      <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded">
                        {method.provider}
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={() => toggleAuthMethod(method.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-700">Enabled</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Onboarding Flow */}
            <div className="bg-blue-50 rounded-lg p-3 mt-4">
              <h4 className="font-medium text-sm text-blue-800 mb-2">Onboarding Flow</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.onboardingFlow).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateFormData('onboardingFlow', { ...formData.onboardingFlow, [key]: e.target.checked })}
                      className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-blue-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.2 User Roles & Permissions */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">User Roles & Permissions</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Define user roles and their permissions</p>
              <button
                onClick={addUserRole}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-3 h-3" />
                Add Role
              </button>
            </div>

            <div className="space-y-3">
              {formData.userRoles.map((role) => (
                <div key={role.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${role.color}-500`}></div>
                    <input
                      type="text"
                      value={role.name}
                      onChange={(e) => updateUserRole(role.id, { name: e.target.value })}
                      className="font-medium text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1"
                    />
                  </div>
                  
                  <textarea
                    value={role.description}
                    onChange={(e) => updateUserRole(role.id, { description: e.target.value })}
                    rows={1}
                    className="w-full p-1 text-xs border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 mb-2"
                  />

                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {Object.entries(role.permissions).map(([permission, enabled]) => (
                      <label key={permission} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => updateUserRole(role.id, {
                            permissions: { ...role.permissions, [permission]: e.target.checked }
                          })}
                          className="w-3 h-3 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-green-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Permissions Matrix */}
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-green-800 mb-2">Permissions Matrix</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-green-200">
                      <th className="text-left py-1 text-green-700">Role</th>
                      <th className="text-center py-1 text-green-700">Create</th>
                      <th className="text-center py-1 text-green-700">Read</th>
                      <th className="text-center py-1 text-green-700">Update</th>
                      <th className="text-center py-1 text-green-700">Delete</th>
                      <th className="text-center py-1 text-green-700">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.userRoles.map((role) => (
                      <tr key={role.id} className="border-b border-green-100">
                        <td className="py-1 text-green-800 font-medium">{role.name}</td>
                        <td className="text-center py-1">{role.permissions.create ? '✅' : '❌'}</td>
                        <td className="text-center py-1">{role.permissions.read ? '✅' : '❌'}</td>
                        <td className="text-center py-1">{role.permissions.update ? '✅' : '❌'}</td>
                        <td className="text-center py-1">{role.permissions.delete ? '✅' : '❌'}</td>
                        <td className="text-center py-1">{role.permissions.admin ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.3 Session Management */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">Session Management</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auth Provider</label>
                <select
                  value={formData.sessionManagement.provider}
                  onChange={(e) => updateFormData('sessionManagement', { ...formData.sessionManagement, provider: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="supabase">Supabase Auth</option>
                  <option value="clerk">Clerk</option>
                  <option value="auth0">Auth0</option>
                  <option value="firebase">Firebase Auth</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Storage</label>
                <select
                  value={formData.sessionManagement.tokenStorage}
                  onChange={(e) => updateFormData('sessionManagement', { ...formData.sessionManagement, tokenStorage: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="localStorage">Local Storage</option>
                  <option value="sessionStorage">Session Storage</option>
                  <option value="httpOnly">HTTP-Only Cookies</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (days)</label>
                <input
                  type="number"
                  value={formData.sessionManagement.sessionTimeout}
                  onChange={(e) => updateFormData('sessionManagement', { ...formData.sessionManagement, sessionTimeout: parseInt(e.target.value) })}
                  min="1"
                  max="365"
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                {[
                  { key: 'autoRefresh', label: 'Auto Token Refresh' },
                  { key: 'idleDetection', label: 'Idle Detection' },
                  { key: 'multiDevice', label: 'Multi-Device Support' },
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sessionManagement[option.key as keyof typeof formData.sessionManagement] as boolean}
                      onChange={(e) => updateFormData('sessionManagement', { 
                        ...formData.sessionManagement, 
                        [option.key]: e.target.checked 
                      })}
                      className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.4 Edge-Case User Scenarios */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <Typography className="font-medium text-sm">Edge-Case User Scenarios</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Define handling for edge cases and security scenarios</p>
              <button
                onClick={addEdgeCase}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <Plus className="w-3 h-3" />
                Add Case
              </button>
            </div>

            <div className="space-y-2">
              {formData.edgeCases.map((edgeCase) => (
                <div key={edgeCase.id} className="p-3 bg-orange-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-orange-700 mb-1">Scenario</label>
                      <input
                        type="text"
                        value={edgeCase.scenario}
                        className="w-full px-2 py-1 border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-orange-700 mb-1">Handling Strategy</label>
                      <input
                        type="text"
                        value={edgeCase.handling}
                        className="w-full px-2 py-1 border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-orange-700 mb-1">Priority</label>
                      <select
                        value={edgeCase.priority}
                        className="w-full px-2 py-1 border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.5 User Metadata & Profiles */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <Typography className="font-medium text-sm">User Metadata & Profiles</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-teal-50 rounded-lg p-3">
                <h4 className="font-medium text-sm text-teal-800 mb-2">Required Fields</h4>
                <div className="space-y-1">
                  {formData.userMetadata.requiredFields.map((field, index) => (
                    <div key={index} className="text-xs bg-white rounded px-2 py-1 text-teal-700">
                      {field}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-3">
                <h4 className="font-medium text-sm text-teal-800 mb-2">Optional Fields</h4>
                <div className="space-y-1">
                  {formData.userMetadata.optionalFields.map((field, index) => (
                    <div key={index} className="text-xs bg-white rounded px-2 py-1 text-teal-700">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-teal-800 mb-2">User Preferences</h4>
              <div className="grid grid-cols-2 gap-1">
                {formData.userMetadata.preferences.map((pref, index) => (
                  <div key={index} className="text-xs bg-white rounded px-2 py-1 text-teal-700">
                    {pref}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-teal-800 mb-2">Activity Tracking</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.userMetadata.tracking).map(([key, enabled]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateFormData('userMetadata', {
                        ...formData.userMetadata,
                        tracking: { ...formData.userMetadata.tracking, [key]: e.target.checked }
                      })}
                      className="w-3 h-3 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-xs text-teal-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.6 Security Features */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" />
            <Typography className="font-medium text-sm">Security Features</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Configure security measures and protections</p>
            
            <div className="space-y-2">
              {formData.securityFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-red-800">{feature.name}</span>
                      {feature.required && (
                        <span className="text-xs px-2 py-1 bg-red-200 text-red-700 rounded">Required</span>
                      )}
                    </div>
                    <p className="text-xs text-red-600 mt-1">{feature.description}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feature.enabled}
                      onChange={() => toggleSecurityFeature(feature.id)}
                      disabled={feature.required}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-red-700">Enabled</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.7 Auth UX Planning */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Auth UX Planning</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect After Login</label>
                <select
                  value={formData.authUX.redirectBehavior}
                  onChange={(e) => updateFormData('authUX', { ...formData.authUX, redirectBehavior: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="profile">Profile Setup</option>
                  <option value="previous">Previous Page</option>
                  <option value="onboarding">Onboarding Flow</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Error Handling</label>
                <select
                  value={formData.authUX.errorHandling}
                  onChange={(e) => updateFormData('authUX', { ...formData.authUX, errorHandling: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="toast">Toast Notifications</option>
                  <option value="inline">Inline Messages</option>
                  <option value="modal">Modal Dialogs</option>
                  <option value="banner">Banner Alerts</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'loginModal', label: 'Login Modal' },
                { key: 'loadingStates', label: 'Loading States' },
                { key: 'mobileOptimized', label: 'Mobile Optimized' },
              ].map((option) => (
                <label key={option.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.authUX[option.key as keyof typeof formData.authUX] as boolean}
                    onChange={(e) => updateFormData('authUX', { 
                      ...formData.authUX, 
                      [option.key]: e.target.checked 
                    })}
                    className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 6.8 Output & Code Generation */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Output & Code Generation</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            {/* Supabase Schema */}
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-green-300">Supabase Schema</h4>
                <button className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Copy className="w-3 h-3" />
                  Copy SQL
                </button>
              </div>
              <pre className="text-xs overflow-x-auto">{generateSupabaseSchema()}</pre>
            </div>

            {/* Auth Hooks */}
            <div className="bg-gray-900 text-blue-400 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-blue-300">Auth Hooks (TypeScript)</h4>
                <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Copy className="w-3 h-3" />
                  Copy Code
                </button>
              </div>
              <pre className="text-xs overflow-x-auto">{generateAuthHooks()}</pre>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Auth Flow Summary</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateAuthSummary()}</pre>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Database className="w-4 h-4" />
                Export Schema
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <Code className="w-4 h-4" />
                Export Hooks
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700">
                <FileText className="w-4 h-4" />
                Export Docs
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                <Zap className="w-4 h-4" />
                Send to Bolt
              </button>
            </div>
            
            <button
              onClick={onComplete}
              className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Complete User & Auth Flow
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};