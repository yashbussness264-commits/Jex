export const CREATION_TYPES = {
  website: {
    title: 'Website Creator',
    icon: 'globe-outline',
    description: 'Generate website layouts and source code from a text description.',
    placeholder: 'Describe the website: purpose, sections, colors, and any content you want included...',
    examples: [
      'A landing page for a neighborhood bakery with a hero, menu, and contact form',
      'Portfolio site for a freelance photographer with a gallery grid',
      'SaaS pricing page with three tiers and a monthly/yearly toggle',
    ],
    styles: ['Modern', 'Minimal', 'Bold', 'Playful', 'Corporate'],
    outputs: ['Single HTML file', 'HTML + CSS + JS', 'React components'],
  },
  app: {
    title: 'App UI Creator',
    icon: 'phone-portrait-outline',
    description: 'Create mobile app screen designs and starter code.',
    placeholder: 'Describe the app and the screens you need: navigation, key components, and user flows...',
    examples: [
      'Fitness tracker app with a dashboard, workout log, and profile screen',
      'Food delivery app home screen with categories and a cart summary',
      'Habit tracker with a daily checklist and streak statistics',
    ],
    styles: ['Material 3', 'Glassmorphism', 'Flat', 'Dark premium'],
    outputs: ['React Native screens', 'Flutter widgets', 'HTML mockup'],
  },
  content: {
    title: 'Content Creator',
    icon: 'create-outline',
    description: 'Generate website copy, social media posts, product descriptions, and video scripts.',
    placeholder: 'Describe what you need written, the audience, and the key points to cover...',
    examples: [
      'Homepage copy for an eco-friendly water bottle brand',
      'Three Instagram captions announcing a summer sale',
      'A 60-second product video script for a coffee subscription',
    ],
    styles: ['Friendly', 'Professional', 'Persuasive', 'Witty'],
    outputs: ['Website copy', 'Social media post', 'Product description', 'Video script'],
  },
};
