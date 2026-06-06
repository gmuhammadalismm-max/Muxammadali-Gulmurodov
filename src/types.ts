/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Skill {
  name: string;
  level: number; // 0-100
  info: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  skills: Skill[];
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  usersCount?: string;
  performanceMetric?: string;
  tech: string[];
  link?: string;
  imageUrl?: string;
  category: "ai" | "marketing" | "cyber" | "web";
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  highlights: string[];
  icon: string;
}

export interface ThreatEvent {
  id: string;
  time: string;
  source: string;
  target: string;
  attackType: string;
  severity: "high" | "medium" | "low";
  direction: "Inbound" | "Outbound";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface LogoBranding {
  initials: string;
  name: string;
  subtitle: string;
  accentColor: string;
  avatarUrl: string;
}

export interface AdminArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  coverUrl: string;
  author: string;
  publishDate: string;
  readTime: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  duration: string;
  uploadedAt: string;
}

export interface AdminImage {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface SEOSettings {
  keywords: string;
  metaDescription: string;
  isGoogleIndexed: boolean;
  sitemapUrl: string;
}

export interface AnalyticsMetric {
  views: number;
  clicks: number;
  conversion: number;
  consultationsBooked: number;
}

