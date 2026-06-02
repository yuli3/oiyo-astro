"use client";

import {
  Anchor,
  Award,
  Book,
  Brain,
  Calendar,
  Cloud,
  Clover,
  Compass,
  Crown,
  Droplet,
  Eye,
  Flame,
  Gem,
  Gift,
  Heart,
  Infinity,
  Key,
  LayoutGrid,
  Moon,
  Mountain,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Sun,
  Sword,
  Target,
  TreePine,
  TrendingUp,
  User,
  Users,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import React from "react";

// SSOT Icon mapping from manifest icon names to Lucide React components
const iconMap: Record<string, React.ComponentType<any>> = {
  achievement: Award,
  anchor: Anchor,
  award: Award,
  balance: Heart,
  book: Book,
  brain: Brain,
  calendar: Calendar,
  celebration: Gift,
  cloud: Cloud,
  // Direct matches
  clover: Clover,
  compass: Compass,
  crown: Crown,
  crystal: Gem,
  diamond: Gem,
  direction: Compass,
  droplet: Droplet,
  energy: Zap,
  eye: Eye,
  fire: Flame,
  flame: Flame,
  gem: Gem,
  gift: Gift,
  goal: Target,
  grid: LayoutGrid,
  growth: TrendingUp,
  guidance: Compass,
  harmony: Heart,
  heart: Heart,
  infinite: Infinity,
  infinity: Infinity,
  journey: Rocket,
  key: Key,
  knowledge: Book,
  // Common aliases
  layout: LayoutGrid,

  "layout-grid": LayoutGrid,
  magic: Sparkles,
  mind: Brain,
  moon: Moon,
  mountain: Mountain,
  nature: TreePine,
  ocean: Waves,
  palm: TreePine,
  person: User,
  power: Zap,
  premium: Crown,
  progress: TrendingUp,
  protection: Shield,
  reward: Award,
  rocket: Rocket,
  security: Shield,
  shield: Shield,
  sparkles: Sparkles,
  spiritual: Sparkles,
  stability: Anchor,
  star: Star,
  success: Award,
  sun: Sun,
  sword: Sword,
  target: Target,
  team: Users,
  tree: TreePine,
  "tree-pine": TreePine,
  "trending-up": TrendingUp,
  user: User,
  users: Users,
  vision: Eye,
  water: Droplet,
  waves: Waves,
  weapon: Sword,
  wind: Wind,
  wisdom: Book,
  zap: Zap,
};

interface DynamicIconProps {
  className?: string;
  name: string;
  size?: number | string;
}

export function DynamicIcon({ className, name, size = 24 }: DynamicIconProps) {
  // Safe handling for when name might be passed as undefined/null at runtime despite types
  const iconKey = (typeof name === "string" ? name : "").toLowerCase();
  const IconComponent = iconMap[iconKey];

  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }

  // Fallback to sparkles for unknown icons or invalid inputs
  return <Sparkles className={className} size={size} />;
}

export default DynamicIcon;
