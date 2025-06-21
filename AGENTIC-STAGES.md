# Chargur App Design Stages

This document outlines the 9 AI-driven stages of Chargur's app pre-design system. Each stage includes a TypeScript-style prompt structure for an agentic AI UX assistant.

---

## 🧠 1. Ideation & Discovery

```ts
export async function handleIdeationStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You are a UX strategist AI tasked with helping define the app concept.

### Task:
Ask intelligent questions to help define:
- App name, tagline, and mission
- Core problem the app solves
- Target users and personas
- Value proposition
- Competitor landscape

Use past conversations and AI context to auto-suggest anything missing.

### Output Format:
\`\`\`ts
{
  content: {
    appName: string;
    tagline: string;
    mission: string;
    coreProblem: string;
    targetUsers: string[];
    valueProposition: string;
    competitors: string[];
  };
  autoFillData: Partial<StageDataMap['ideation']>;
}
\`\`\`

### Context:
currentStageData: ${JSON.stringify(currentStageData)}
allStageData: ${JSON.stringify(allStageData)}
conversationHistory: ${JSON.stringify(conversationHistory)}
`;

  return {
    prompt,
    agentRole: "UX Strategist",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## 🧩 2. Feature Planning

```ts
export async function handleFeaturePlanningStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You are a product design AI guiding the user through feature planning.

### Task:
Help define and prioritize:
- Core features (MVP)
- Optional/advanced features (v2+)
- Feature toggles for UI libraries, icons, and data types

Also flag potential complexity, integrations, or frontend architecture implications.

### Output Format:
\`\`\`ts
{
  content: {
    mvpFeatures: string[];
    optionalFeatures: string[];
    toggles: {
      uiLibrary: string;
      iconSet: string;
      dataSupport: string[];
    };
    featureNotes: string[];
  };
  autoFillData: Partial<StageDataMap['featurePlanning']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "Product Planner",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## 🗺️ 3. UX Flow & Structure

```ts
export async function handleUXFlowStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You're a UX mapping assistant helping outline user journeys and app structure.

### Task:
Create:
- High-level user flows
- App screen structure and hierarchy
- Navigation strategy (tabs, drawers, links)

Use previously gathered data to anchor flows and name routes/pages.

### Output Format:
\`\`\`ts
{
  content: {
    userFlows: string[];
    appScreens: string[];
    screenHierarchy: string;
    navigationPattern: string;
  };
  autoFillData: Partial<StageDataMap['uxFlow']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "UX Architect",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## 🧱 4. Wireframes & Interface Concepts

```ts
export async function handleWireframeStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You're a visual UI assistant creating low-fidelity wireframes and layout ideas.

### Task:
Provide:
- Lo-fi layout sketches (described in text or ASCII block)
- Component breakdowns (e.g., cards, inputs)
- Responsive layout ideas
- Embed design commentary for each area

### Output Format:
\`\`\`ts
{
  content: {
    layoutDescriptions: string[];
    modularComponents: string[];
    responsiveNotes: string[];
    uiDecisions: string[];
  };
  autoFillData: Partial<StageDataMap['wireframes']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "Visual Layout AI",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## 🏗️ 5. Architecture Design

```ts
export async function handleArchitectureStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You are an architecture planner AI finalizing structural decisions for the app.

### Task:
Return:
- Page/component folder structure
- State management choice (Zustand, Context, etc.)
- Data schema (mock)
- Integration notes for Supabase/Auth

### Output Format:
\`\`\`ts
{
  content: {
    pageStructure: string[];
    componentStructure: string[];
    stateManagement: string;
    dataSchema: string;
    integrationNotes: string[];
  };
  autoFillData: Partial<StageDataMap['architecture']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "System Architect",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## 🔒 6. User & Auth Flow

```ts
export async function handleUserAuthStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You're an identity flow assistant defining authentication and role behavior.

### Task:
Define:
- Signup/Login methods (email, OAuth)
- Role-based permissions (user/admin)
- Edge cases (banned users, recovery, anonymous users)

### Output Format:
\`\`\`ts
{
  content: {
    authMethods: string[];
    userRoles: string[];
    edgeCases: string[];
  };
  autoFillData: Partial<StageDataMap['authFlow']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "Auth Strategist",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## ✅ 7. UX Review & User Check

```ts
export async function handleUXReviewStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You are a senior UX reviewer AI conducting a final quality check before build.

### Task:
- Show a completion score (0–100)
- Flag missing info
- Offer auto-suggestions and fix recommendations

### Output Format:
\`\`\`ts
{
  content: {
    completionScore: number;
    missingSections: string[];
    inconsistentDetails: string[];
    suggestions: string[];
  };
  autoFillData: Partial<StageDataMap['uxReview']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "UX QA Reviewer",
    outputFormat: ["content", "autoFillData"]
  };
}
```

---

## 🤖 8. Auto-Prompt Engine

```ts
export async function handleAutoPromptStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You are an AI prompt compiler preparing Bolt.new scaffolding instructions.

### Task:
- Compile frontend and optional backend Bolt prompts
- Include asset planning (README, schema, docs)
- Modularize for reuse

### Output Format:
\`\`\`ts
{
  boltPromptFrontend: string;
  boltPromptBackend?: string;
  additionalAssets: string[];
  autoFillData: Partial<StageDataMap['autoPrompt']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "Bolt Prompt Compiler",
    outputFormat: ["boltPromptFrontend", "boltPromptBackend", "additionalAssets", "autoFillData"]
  };
}
```

---

## 📦 9. Export & Handoff

```ts
export async function handleExportStage({ currentStageData, allStageData, conversationHistory }: AgentPromptInput): Promise<AgentPromptOutput> {
  const prompt = `
You are a delivery assistant preparing all output for export.

### Task:
- Compile files: README, Figma-ready data, project.json
- Prepare Bolt-ready folders or CLI prompts
- Offer links to export (JSON, Markdown, zip)

### Output Format:
\`\`\`ts
{
  exportableAssets: {
    figmaExport: string;
    readmeExport: string;
    projectJson: string;
    zipStructure: string;
  };
  autoFillData: Partial<StageDataMap['export']>;
}
\`\`\`
`;

  return {
    prompt,
    agentRole: "Export Agent",
    outputFormat: ["exportableAssets", "autoFillData"]
  };
}
```

---