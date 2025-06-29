import React, { useState } from 'react';

import { 
  Building2, 
  FolderTree, 
  Database, 
  Globe,  
  FileText, 
  CheckCircle,
  Plus,
  Building2,
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
  fields: DatabaseField[];
  relations: string[];
}

interface DatabaseField {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
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
  };
  
  const [formData, setFormData] = useState(() => ({
    ...defaultFormData,
    ...(initialFormData || {})
  }));

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

  console.log('ArchitectureDesign formData:', {
    sitemap: formData?.sitemap,
    databaseSchema: formData?.databaseSchema,
    apiEndpoints: formData?.apiEndpoints,
    envVariables: formData?.envVariables,
    integrations: formData?.integrations
  });

  const generateSQLSchema = () => {
    if (!formData?.databaseSchema || !Array.isArray(formData.databaseSchema)) {
      return '-- No database schema defined';
    }
    
    return formData.databaseSchema.map((table: DatabaseTable) => {
      const fields = Array.isArray(table.fields) ? table.fields.map((field: DatabaseField) => {
        const constraints = [];
        if (field.required) constraints.push('NOT NULL');
        if (field.unique) constraints.push('UNIQUE');
        return `  ${field.name} ${field.type.toUpperCase()} ${constraints.join(' ')}`;
      }).join(',\n') : '';
      
      return `CREATE TABLE ${table.name} (\n${fields}\n);`;
    }).join('\n\n');
  };

  const generateEnvTemplate = () => {
    if (!formData?.envVariables || !Array.isArray(formData.envVariables)) {
      return '# No environment variables defined';
    }
    
    return formData.envVariables.map((envVar: EnvVariable) => {
      const comment = `# ${envVar.description} (${envVar.usage})`;
      const required = envVar.required ? ' # REQUIRED' : ' # OPTIONAL';
      return `${comment}\n${envVar.name}=${envVar.type === 'secret' ? 'your_secret_here' : 'your_value_here'}${required}`;
    }).join('\n\n');
  };

  const generateArchitectureSummary = () => {
    const sitemapCount = Array.isArray(formData?.sitemap) ? formData.sitemap.length : 0;
    const dbSchemaCount = Array.isArray(formData?.databaseSchema) ? formData.databaseSchema.length : 0;
    const apiEndpointsCount = Array.isArray(formData?.apiEndpoints) ? formData.apiEndpoints.length : 0;
    const envVarsCount = Array.isArray(formData?.envVariables) ? formData.envVariables.length : 0;
    
    return `
**Architecture Design Summary**

**Project Structure:**
- Routes: ${sitemapCount} pages defined
- Database Tables: ${dbSchemaCount} tables
- API Endpoints: ${apiEndpointsCount} endpoints
- Environment Variables: ${envVarsCount} variables

**State Management:** ${formData?.stateManagement || 'Not specified'}

**Key Integrations:**
${Array.isArray(formData?.integrations) ? formData.integrations.map((integration: string) => `- ${integration}`).join('\n') : '- None defined'}

**Protected Routes:** ${Array.isArray(formData?.sitemap) ? formData.sitemap.filter((route: Route) => route.protected).length : 0}/${sitemapCount}
**Auth Required Endpoints:** ${Array.isArray(formData?.apiEndpoints) ? formData.apiEndpoints.filter((endpoint: APIEndpoint) => endpoint.auth).length : 0}/${apiEndpointsCount}
    `.trim();
  };

  const stateManagementOptions = [
    { value: 'local', label: 'Local State', desc: 'useState and useReducer only' },
    { value: 'context', label: 'React Context', desc: 'Context API for global state' },
    { value: 'zustand', label: 'Zustand', desc: 'Lightweight state management' },
    { value: 'redux', label: 'Redux Toolkit', desc: 'Full Redux implementation' },
  ];

  return (
    <div className="p-2 space-y-2">

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
              {formData.sitemap.map((route: Route) => (
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
              {Array.isArray(formData.databaseSchema) && formData.databaseSchema.length > 0 ? formData.databaseSchema.map((table: DatabaseTable) => (
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
                    
                    {Array.isArray(table.fields) ? table.fields.map((field: DatabaseField, index: number) => (
                      <React.Fragment key={index}>
                        <div className="text-orange-600 font-mono">{field.name}</div>
                        <div className="text-orange-600">{field.type}</div>
                        <div className="text-orange-600">{field.required ? '✓' : '—'}</div>
                        <div className="text-orange-600">{field.unique ? '✓' : '—'}</div>
                      </React.Fragment>
                    )) : null}
                  </div>

                  {Array.isArray(table.relations) && table.relations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <span className="text-xs font-medium text-orange-700">Relations: </span>
                      <span className="text-xs text-orange-600">{table.relations.join(', ')}</span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-gray-500 text-sm">No database tables defined</div>
              )}
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
              {Array.isArray(formData.apiEndpoints) && formData.apiEndpoints.length > 0 ? formData.apiEndpoints.map((endpoint: APIEndpoint) => (
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
                  
                  {Array.isArray(endpoint.params) && endpoint.params.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-teal-200">
                      <span className="text-xs font-medium text-teal-700">Parameters: </span>
                      <span className="text-xs text-teal-600">{endpoint.params.join(', ')}</span>
                    </div>
                  )}
                </div>
              )) : null}
            </div>

            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-teal-800 mb-2">Third-party Integrations</h4>
              <div className="space-y-1">
                {formData.integrations.map((integration: string, index: number) => (
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
              {Array.isArray(formData.envVariables) && formData.envVariables.length > 0 ? formData.envVariables.map((envVar: EnvVariable) => (
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
              )) : <div className="text-gray-500 text-sm">No environment variables defined</div>}
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