import { Zap, FileText, UserPlus } from 'lucide-react';

export interface JobApplicationTemplate {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  icon: React.ComponentType<any>;
  steps: string[];
  nodes: any[];
  edges: any[];
  recommended?: boolean;
}

export const jobApplicationTemplates: JobApplicationTemplate[] = [
  {
    id: 'quick-apply-connect',
    name: 'Quick Apply & Connect',
    description: 'Apply to job, send connection, and follow up with LinkedIn message',
    bestFor: 'Users who want fast action with basic personalization.',
    icon: Zap,
    recommended: true,
    steps: ['Start Campaign', 'Apply to Job', 'Send Connection (Exec)', 'If No Reply: Follow Up Message'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 350, y: 0 },
        data: { label: 'Start Campaign', description: 'Begin job application sequence' },
      },
      {
        id: '2',
        type: 'enhanced',
        position: { x: 350, y: 120 },
        data: {
          label: 'Apply to Job',
          description: 'Submit job application',
          color: 'from-orange-400 to-amber-500',
          icon: 'FileText',
          originalType: 'apply-to-job',
          waitEnabled: false,
          execHiringManagerEnabled: true,
          peerEnabled: false,
          recruiterEnabled: false,
        },
      },
      {
        id: '3',
        type: 'enhanced',
        position: { x: 350, y: 240 },
        data: {
          label: 'Send Connection',
          description: 'Connect on LinkedIn',
          color: 'from-green-400 to-emerald-500',
          icon: 'UserPlus',
          originalType: 'connection-request',
          waitEnabled: true,
          waitPeriod: '1 day',
          noResponseEnabled: true,
          execHiringManagerEnabled: true,
          recruiterEnabled: false,
          peerEnabled: false,
        },
      },
      {
        id: '4',
        type: 'enhanced',
        position: { x: 120, y: 380 },
        data: {
          label: 'Notify Me',
          description: 'Get notified when triggered',
          color: 'from-pink-400 to-rose-500',
          icon: 'Bell',
          originalType: 'notify-me',
        },
      },
      {
        id: '5',
        type: 'enhanced',
        position: { x: 580, y: 380 },
        data: {
          label: 'Follow Up LinkedIn Message',
          description: 'LinkedIn message or InMail',
          color: 'from-indigo-400 to-purple-500',
          icon: 'Mail',
          originalType: 'send-message',
          waitEnabled: true,
          waitPeriod: '7 days',
          noResponseEnabled: false,
          messageType: 'message',
          execHiringManagerEnabled: true,
          peerEnabled: false,
          recruiterEnabled: false,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
      { id: 'e2-3', source: '2', target: '3', type: 'default' },
      { id: 'e3-4', source: '3', target: '4', sourceHandle: 'reply', type: 'default' },
      { id: 'e3-5', source: '3', target: '5', sourceHandle: 'no-reply', type: 'default' },
    ],
  },
  {
    id: 'just-apply',
    name: 'Just Apply',
    description: 'Simply apply to the job and get notified',
    bestFor: 'Users who prefer to apply first without immediate outreach.',
    icon: FileText,
    steps: ['Start Campaign', 'Apply to Job', 'Notify Me'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 350, y: 0 },
        data: { label: 'Start Campaign', description: 'Begin job application' },
      },
      {
        id: '2',
        type: 'enhanced',
        position: { x: 350, y: 120 },
        data: {
          label: 'Apply to Job',
          description: 'Submit job application',
          color: 'from-orange-400 to-amber-500',
          icon: 'FileText',
          originalType: 'apply-to-job',
          waitEnabled: false,
          execHiringManagerEnabled: true,
          peerEnabled: false,
          recruiterEnabled: false,
        },
      },
      {
        id: '3',
        type: 'enhanced',
        position: { x: 350, y: 240 },
        data: {
          label: 'Notify Me',
          description: 'Get notified when complete',
          color: 'from-pink-400 to-rose-500',
          icon: 'Bell',
          originalType: 'notify-me',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
      { id: 'e2-3', source: '2', target: '3', type: 'default' },
    ],
  },
  {
    id: 'just-connect',
    name: 'Just Connect',
    description: 'Connect on LinkedIn and follow up if no reply',
    bestFor: 'Users who want to build relationships without applying.',
    icon: UserPlus,
    steps: ['Start Campaign', 'Send Connection (Exec)', 'If No Reply: Follow Up Message'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 350, y: 0 },
        data: { label: 'Start Campaign', description: 'Begin connection sequence' },
      },
      {
        id: '2',
        type: 'enhanced',
        position: { x: 350, y: 120 },
        data: {
          label: 'Send Connection',
          description: 'Connect on LinkedIn',
          color: 'from-green-400 to-emerald-500',
          icon: 'UserPlus',
          originalType: 'connection-request',
          waitEnabled: true,
          waitPeriod: '1 day',
          noResponseEnabled: true,
          execHiringManagerEnabled: true,
          recruiterEnabled: false,
          peerEnabled: false,
        },
      },
      {
        id: '3',
        type: 'enhanced',
        position: { x: 120, y: 260 },
        data: {
          label: 'Notify Me',
          description: 'Get notified when accepted',
          color: 'from-pink-400 to-rose-500',
          icon: 'Bell',
          originalType: 'notify-me',
        },
      },
      {
        id: '4',
        type: 'enhanced',
        position: { x: 580, y: 260 },
        data: {
          label: 'Follow Up LinkedIn Message',
          description: 'LinkedIn message or InMail',
          color: 'from-indigo-400 to-purple-500',
          icon: 'Mail',
          originalType: 'send-message',
          waitEnabled: true,
          waitPeriod: '7 days',
          noResponseEnabled: false,
          messageType: 'message',
          execHiringManagerEnabled: true,
          peerEnabled: false,
          recruiterEnabled: false,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'default' },
      { id: 'e2-3', source: '2', target: '3', sourceHandle: 'reply', type: 'default' },
      { id: 'e2-4', source: '2', target: '4', sourceHandle: 'no-reply', type: 'default' },
    ],
  },
];