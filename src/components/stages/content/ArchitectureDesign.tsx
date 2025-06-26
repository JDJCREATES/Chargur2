import React, { useState, useEffect } from 'react';

import { 
  Building2, 
  FolderTree, 
  Database, 
  Globe,  
  Brain, 
  FileText, 
  CheckCircle,
  Plus,
  Copy,
  Download,
  GitBranch,
  Key,
  Zap,
  Link,
} from 'lucide-react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { Stage } from '../../../types';

interface ArchitectureDesignProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
}

interface Route {
  id: string;
  path: string;
  component: string;
  protected: boolean;
  description: string;
}

interface Component {
  id: string;
  name: string;
  type: 'layout' | 'ui' | 'form' | 'display' | 'utility';
  dependencies: string[];
  props: string[];
  location: string;
}

interface DatabaseTable {
  id: string;
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    unique: boolean;
  }>;
  relations: string[];
}

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  rateLimit: boolean;
  params: string[];
}

interface EnvVariable {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: 'secret' | 'config' | 'url';
  usage: 'frontend' | 'backend' | 'edge-function';
}

export const ArchitectureDesign: React.FC<ArchitectureDesignProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData,
}) => {
  const defaultFormData = {
    sitemap: [
      { id: '1', path: '/', component: 'LandingPage', protected: false, description: 'Public landing page' },
      { id: '2', path: '/login', component: 'LoginPage', protected: false, description: 'User authentication' },
      { id: '3', path: '/dashboard', component: 'Dashboard', protected: true, description: 'Main user dashboard' },
      { id: '4', path: '/profile', component: 'ProfilePage', protected: true, description: 'User profile management' },
      { id: '5', path: '/settings', component: 'SettingsPage', protected: true, description: 'App settings' },
    ] as Route[],
    
    folderStructure: {
      '/src': {
        '/components': {
          '/layout': ['Header.tsx', 'Sidebar.tsx', 'Footer.tsx', 'Layout.tsx'],
          '/ui': ['Button.tsx', 'Card.tsx', 'Modal.tsx', 'Input.tsx', 'Avatar.tsx'],
          '/forms': ['LoginForm.tsx', 'ProfileForm.tsx', 'ContactForm.tsx'],
          '/display': ['UserCard.tsx', 'DataTable.tsx', 'Chart.tsx'],
        },
        '/pages': ['Dashboard.tsx', 'Profile.tsx', 'Settings.tsx', 'Landing.tsx'],
        '/hooks': ['useAuth.tsx', 'useApi.tsx', 'useLocalStorage.tsx'],
        '/context': ['AuthContext.tsx', 'ThemeContext.tsx', 'AppContext.tsx'],
        '/lib': ['api.ts', 'utils.ts', 'constants.ts', 'validations.ts'],
        '/types': ['index.ts', 'api.ts', 'user.ts'],
        '/styles': ['globals.css', 'components.css'],
      },
      '/public': ['favicon.ico', 'logo.svg', 'manifest.json'],
      '/supabase': {
        '/migrations': ['001_initial_schema.sql', '002_add_profiles.sql'],
        '/functions': ['send-email', 'process-upload'],
      }
    },
    
    stateManagement: 'context',
    
    databaseSchema: [
      {
        id: '1',
        name: 'users',
        fields: [
          { name: 'id', type: 'uuid', required: true, unique: true },
          { name: 'email', type: 'text', required: true, unique: true },
          { name: 'name', type: 'text', required: true, unique: false },
          { name: 'avatar_url', type: 'text', required: false, unique: false },
          { name: 'created_at', type: 'timestamptz', required: true, unique: false },
          { name: 'updated_at', type: 'timestamptz', required: true, unique: false },
        ],
        relations: ['profiles', 'posts'],
      },
      {
        id: '2',
        name: 'profiles',
        fields: [
          { name: 'id', type: 'uuid', required: true, unique: true },
          { name: 'user_id', type: 'uuid', required: true, unique: true },
          { name: 'bio', type: 'text', required: false, unique: false },
          { name: 'website', type: 'text', required: false, unique: false },
          { name: 'location', type: 'text', required: false, unique: false },
        ],
        relations: ['users'],
      },
    ] as DatabaseTable[],
    
    apiEndpoints: [
      { id: '1', method: 'GET' as const, path: '/api/users', description: 'Get all users', auth: true, rateLimit: true, params: ['limit', 'offset'] },
      { id: '2', method: 'POST' as const, path: '/api/users', description: 'Create new user', auth: false, rateLimit: true, params: ['email', 'password', 'name'] },
      { id: '3', method: 'PUT' as const, path: '/api/users/:id', description: 'Update user', auth: true, rateLimit: false, params: ['name', 'email'] },
      { id: '4', method: 'DELETE' as const, path: '/api/users/:id', description: 'Delete user', auth: true, rateLimit: false, params: [] },
    ] as APIEndpoint[],
    
    envVariables: [
      { id: '1', name: 'SUPABASE_URL', description: 'Supabase project URL', required: true, type: 'url' as const, usage: 'frontend' as const },
      { id: '2', name: 'SUPABASE_ANON_KEY', description: 'Supabase anonymous key', required: true, type: 'secret' as const, usage: 'frontend' as const },
      { id: '3', name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key', required: true, type: 'secret' as const, usage: 'backend' as const },
      { id: '4', name: 'OPENAI_API_KEY', description: 'OpenAI API key for AI features', required: false, type: 'secret' as const, usage: 'edge-function' as const },
    ] as EnvVariable[],
    
    integrations: [
      'Supabase (Database & Auth)',
      'Vercel (Deployment)',
      'OpenAI (AI Features)',
      'Stripe (Payments)',
      'Resend (Email)',
    ],
    
    aiAgentZones: [
      'Layout injection based on screen size',
      'Dynamic form generation from schema',
      'Prompt history management',
      'Auto-generated API documentation',
      'Component prop suggestions',
    ],
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  // Sync formData with initialFormData when it changes
  useEffect(() => {
    if (initialFormData) {
      console.log('Updating ArchitectureDesign formData from initialFormData');
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

  const addRoute = () => {
    const newRoute: Route = {
      id: Date.now().toString(),
      path: '/new-route',
      component: 'NewComponent',
      protected: false,
      description: 'New route description',
    };
    updateFormData('sitemap', [...formData.sitemap, newRoute]);
  };

  const addDatabaseTable = () => {
    const newTable: DatabaseTable = {
      id: Date.now().toString(),
      name: 'new_table',
      fields: [
        { name: 'id', type: 'uuid', required: true, unique: true },
        { name: 'created_at', type: 'timestamptz', required: true, unique: false },
      ],
      relations: [],
    };
    updateFormData('databaseSchema', [...formData.databaseSchema, newTable]);
  };

  const addAPIEndpoint = () => {
    const newEndpoint: APIEndpoint = {
      id: Date.now().toString(),
      method: 'GET',
      path: '/api/new-endpoint',
      description: 'New API endpoint',
      auth: false,
      rateLimit: false,
      params: [],
    };
    updateFormData('apiEndpoints', [...formData.apiEndpoints, newEndpoint]);
  };

  const addEnvVariable = () => {
    const newVar: EnvVariable = {
      id: Date.now().toString(),
      name: 'NEW_VARIABLE',
      description: 'New environment variable',
      required: false,
      type: 'config',
      usage: 'frontend',
    };
    updateFormData('envVariables', [...formData.envVariables, newVar]);
  };

  const generateSQLSchema = () => {
    return formData.databaseSchema.map(table => {
      const fields = table.fields.map(field => {
        const constraints = [];
        if (field.required) constraints.push('NOT NULL');
        if (field.unique) constraints.push('UNIQUE');
        return `  ${field.name} ${field.type.toUpperCase()} ${constraints.join(' ')}`;
      }).join(',\n');
      
      return `CREATE TABLE ${table.name} (\n${fields}\n);`;
    }).join('\n\n');
  };

  const generateEnvTemplate = () => {
    return formData.envVariables.map(envVar => {
      const comment = `# ${envVar.description} (${envVar.usage})`;
      const required = envVar.required ? ' # REQUIRED' : ' # OPTIONAL';
      return `${comment}\n${envVar.name}=${envVar.type === 'secret' ? 'your_secret_here' : 'your_value_here'}${required}`;
    }).join('\n\n');
  };

  const generateArchitectureSummary = () => {
    return `
**Architecture Design Summary**

**Project Structure:**
- Routes: ${formData.sitemap.length} pages defined
- Database Tables: ${formData.databaseSchema.length} tables
- API Endpoints: ${formData.apiEndpoints.length} endpoints
- Environment Variables: ${formData.envVariables.length} variables

**State Management:** ${formData.stateManagement}

**Key Integrations:**
${formData.integrations.map(integration => `- ${integration}`).join('\n')}

**AI Agent Zones:**
${formData.aiAgentZones.map(zone => `- ${zone}`).join('\n')}

**Protected Routes:** ${formData.sitemap.filter(route => route.protected).length}/${formData.sitemap.length}
**Auth Required Endpoints:** ${formData.apiEndpoints.filter(endpoint => endpoint.auth).length}/${formData.apiEndpoints.length}
    `.trim();
  };

  const stateManagementOptions = [
    { value: 'local', label: 'Local State', desc: 'useState and useReducer only' },
    { value: 'context', label: 'React Context', desc: 'Context API for global state' },
    { value: 'zustand', label: 'Zustand', desc: 'Lightweight state management' },
    { value: 'redux', label: 'Redux Toolkit', desc: 'Full Redux implementation' },
  ];

  return (
    <div className="p-4 space-y-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Architecture Design</h3>
        <p className="text-sm text-gray-600">Create a developer-ready project blueprint with technical specifications</p>
      </div>

      {/* 5.1 Page & Component Structure */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Page & Component Structure</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Define all routes and page components</p>
              <button
                onClick={addRoute}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                Add Route
              </button>
            </div>

            <div className="space-y-2">
              {formData.sitemap.map((route) => (
                <div key={route.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-blue-700 mb-1">Path</label>
                      <input
                        type="text"
                        value={route.path}
                        readOnly={true}
                        className="w-full px-2 py-1 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-blue-700 mb-1">Component</label>
                      <input
                        type="text"
                        value={route.component}
                        readOnly={true}
                        className="w-full px-2 py-1 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-blue-700 mb-1">Protected</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={route.protected}
                          className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                          readOnly
                        />
                        <span className="text-blue-700">{route.protected ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-blue-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={route.description}
                        readOnly={true}
                        className="w-full px-2 py-1 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.2 Folder Structure & Naming Conventions */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Folder Structure & Naming Conventions</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Organized project structure following React + TypeScript best practices</p>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="space-y-1">
                <div>/src</div>
                <div className="ml-2">/components</div>
                <div className="ml-4">/layout → Header.tsx, Sidebar.tsx, Footer.tsx, Layout.tsx</div>
                <div className="ml-4">/ui → Button.tsx, Card.tsx, Modal.tsx, Input.tsx, Avatar.tsx</div>
                <div className="ml-4">/forms → LoginForm.tsx, ProfileForm.tsx, ContactForm.tsx</div>
                <div className="ml-4">/display → UserCard.tsx, DataTable.tsx, Chart.tsx</div>
                <div className="ml-2">/pages → Dashboard.tsx, Profile.tsx, Settings.tsx, Landing.tsx</div>
                <div className="ml-2">/hooks → useAuth.tsx, useApi.tsx, useLocalStorage.tsx</div>
                <div className="ml-2">/context → AuthContext.tsx, ThemeContext.tsx, AppContext.tsx</div>
                <div className="ml-2">/lib → api.ts, utils.ts, constants.ts, validations.ts</div>
                <div className="ml-2">/types → index.ts, api.ts, user.ts</div>
                <div className="ml-2">/styles → globals.css, components.css</div>
                <div>/public → favicon.ico, logo.svg, manifest.json</div>
                <div>/supabase</div>
                <div className="ml-2">/migrations → 001_initial_schema.sql, 002_add_profiles.sql</div>
                <div className="ml-2">/functions → send-email/, process-upload/</div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-green-800 mb-2">Naming Conventions</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• <strong>Folders:</strong> kebab-case (e.g., user-profile, api-routes)</li>
                <li>• <strong>Components:</strong> PascalCase (e.g., UserProfile.tsx, ApiClient.ts)</li>
                <li>• <strong>Hooks:</strong> camelCase with 'use' prefix (e.g., useAuth.ts)</li>
                <li>• <strong>Types:</strong> PascalCase interfaces (e.g., User, ApiResponse)</li>
                <li>• <strong>Constants:</strong> UPPER_SNAKE_CASE (e.g., API_BASE_URL)</li>
              </ul>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.3 State Management Plan */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">State Management Plan</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State Management Strategy</label>
              <div className="grid grid-cols-2 gap-2">
                {stateManagementOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFormData('stateManagement', option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.stateManagement === option.value
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-purple-800 mb-2">State Ownership Map</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">User Authentication</span>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">AuthContext</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Theme Preferences</span>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">ThemeContext</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Form Data</span>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">Local State</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">API Cache</span>
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">React Query</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.4 Data Modeling & Database Schema */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-600" />
            <Typography className="font-medium text-sm">Data Modeling & Database Schema</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Supabase PostgreSQL schema design</p>
              <button
                onClick={addDatabaseTable}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <Plus className="w-3 h-3" />
                Add Table
              </button>
            </div>

            <div className="space-y-3">
              {formData.databaseSchema.map((table) => (
                <div key={table.id} className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-sm text-orange-800">{table.name}</h4>
                    <span className="text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded">
                      {table.fields.length} fields
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    <div className="font-medium text-orange-700">Field</div>
                    <div className="font-medium text-orange-700">Type</div>
                    <div className="font-medium text-orange-700">Required</div>
                    <div className="font-medium text-orange-700">Unique</div>
                    
                    {table.fields.map((field, index) => (
                      <React.Fragment key={index}>
                        <div className="text-orange-600 font-mono">{field.name}</div>
                        <div className="text-orange-600">{field.type}</div>
                        <div className="text-orange-600">{field.required ? '✓' : '—'}</div>
                        <div className="text-orange-600">{field.unique ? '✓' : '—'}</div>
                      </React.Fragment>
                    ))}
                  </div>

                  {table.relations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <span className="text-xs font-medium text-orange-700">Relations: </span>
                      <span className="text-xs text-orange-600">{table.relations.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-900 text-green-400 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-green-300">Generated SQL Schema</h4>
                <button className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Copy className="w-3 h-3" />
                  Copy SQL
                </button>
              </div>
              <pre className="text-xs overflow-x-auto">{generateSQLSchema()}</pre>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.5 API & Integration Blueprint */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            <Typography className="font-medium text-sm">API & Integration Blueprint</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">API endpoints and third-party integrations</p>
              <button
                onClick={addAPIEndpoint}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <Plus className="w-3 h-3" />
                Add Endpoint
              </button>
            </div>

            <div className="space-y-2">
              {formData.apiEndpoints.map((endpoint) => (
                <div key={endpoint.id} className="p-3 bg-teal-50 rounded-lg">
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Method</label>
                      <span className={`px-2 py-1 rounded font-mono ${
                        endpoint.method === 'GET' ? 'bg-green-200 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-200 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {endpoint.method}
                      </span>
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Path</label>
                      <span className="font-mono text-teal-600">{endpoint.path}</span>
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Auth</label>
                      <span className="text-teal-600">{endpoint.auth ? '🔒' : '🔓'}</span>
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Rate Limit</label>
                      <span className="text-teal-600">{endpoint.rateLimit ? '⏱️' : '—'}</span>
                    </div>
                    <div>
                      <label className="block font-medium text-teal-700 mb-1">Description</label>
                      <span className="text-teal-600">{endpoint.description}</span>
                    </div>
                  </div>
                  
                  {endpoint.params.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-teal-200">
                      <span className="text-xs font-medium text-teal-700">Parameters: </span>
                      <span className="text-xs text-teal-600">{endpoint.params.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-teal-800 mb-2">Third-party Integrations</h4>
              <div className="space-y-1">
                {formData.integrations.map((integration, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-teal-700">
                    <Link className="w-3 h-3" />
                    <span>{integration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.6 Environment Variables & Config */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Environment Variables & Config</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Environment configuration and secrets</p>
              <button
                onClick={addEnvVariable}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-3 h-3" />
                Add Variable
              </button>
            </div>

            <div className="space-y-2">
              {formData.envVariables.map((envVar) => (
                <div key={envVar.id} className="p-3 bg-indigo-50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block font-medium text-indigo-700 mb-1">Name</label>
                      <span className="font-mono text-indigo-600">{envVar.name}</span>
                    </div>
                    <div>
                      <label className="block font-medium text-indigo-700 mb-1">Type</label>
                      <span className={`px-2 py-1 rounded ${
                        envVar.type === 'secret' ? 'bg-red-200 text-red-800' :
                        envVar.type === 'url' ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {envVar.type}
                      </span>
                    </div>
                    <div>
                      <label className="block font-medium text-indigo-700 mb-1">Usage</label>
                      <span className="text-indigo-600">{envVar.usage}</span>
                    </div>
                    <div>
                      <label className="block font-medium text-indigo-700 mb-1">Required</label>
                      <span className="text-indigo-600">{envVar.required ? '✓' : '—'}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-indigo-600">{envVar.description}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 text-green-400 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-green-300">.env.example Template</h4>
                <button className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Copy className="w-3 h-3" />
                  Copy Template
                </button>
              </div>
              <pre className="text-xs overflow-x-auto">{generateEnvTemplate()}</pre>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.7 AI Agent Logic Zones */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-pink-600" />
            <Typography className="font-medium text-sm">AI Agent Logic Zones</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Areas where AI can dynamically adjust and optimize the architecture</p>
            
            <div className="space-y-2">
              {formData.aiAgentZones.map((zone, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
                  <Brain className="w-4 h-4 text-pink-600" />
                  <span className="text-sm text-pink-700">{zone}</span>
                  <div className="ml-auto">
                    <span className="text-xs px-2 py-1 bg-pink-200 text-pink-700 rounded">AI-Controlled</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
              <h4 className="font-medium text-sm text-pink-800 mb-2">AI Capabilities</h4>
              <ul className="text-xs text-pink-700 space-y-1">
                <li>• Dynamic component generation based on data models</li>
                <li>• Responsive layout adjustments for different screen sizes</li>
                <li>• Auto-optimization of API calls and caching strategies</li>
                <li>• Intelligent error boundary placement</li>
                <li>• Performance monitoring and optimization suggestions</li>
              </ul>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 5.8 Output & Export */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Architecture Output & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 mb-2">Architecture Summary</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{generateArchitectureSummary()}</pre>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <FileText className="w-4 h-4" />
                Export README
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700">
                <Database className="w-4 h-4" />
                Export Schema
              </button>
              <button className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                <Zap className="w-4 h-4" />
                Trigger Bolt
              </button>
            </div>
            
            <button
              onClick={onComplete}
              className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Complete Architecture Design
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};