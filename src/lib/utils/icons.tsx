import * as LucideIcons from 'lucide-react'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { ACTION_LABELS } from '@/constants/categories'
import type { LucideIcon } from 'lucide-react'

// Map icon names to actual icon components
export const iconMap: Record<string, LucideIcon> = {
  // Category icons
  Home: LucideIcons.Home,
  GraduationCap: LucideIcons.GraduationCap,
  Bus: LucideIcons.Bus,
  Shield: LucideIcons.Shield,
  Heart: LucideIcons.Heart,
  Briefcase: LucideIcons.Briefcase,
  Leaf: LucideIcons.Leaf,
  Scale: LucideIcons.Scale,
  Building2: LucideIcons.Building2,
  DollarSign: LucideIcons.DollarSign,
  MapPin: LucideIcons.MapPin,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  
  // Action icons
  Eye: LucideIcons.Eye,
  Bookmark: LucideIcons.Bookmark,
  Plus: LucideIcons.Plus,
  Share2: LucideIcons.Share2,
  ThumbsUp: LucideIcons.ThumbsUp,
  Phone: LucideIcons.Phone,
  Calendar: LucideIcons.Calendar,
  Users: LucideIcons.Users,
  PenTool: LucideIcons.PenTool,
  Download: LucideIcons.Download,
  MessageCircle: LucideIcons.MessageCircle,
  AlertCircle: LucideIcons.AlertCircle,
  FileText: LucideIcons.FileText,
  HelpCircle: LucideIcons.HelpCircle,
}

export function getIconComponent(iconName: string): LucideIcon | null {
  return iconMap[iconName] || null
}

export function renderIcon(iconName: string, size: number = 16, className?: string) {
  const IconComponent = iconMap[iconName]
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in icon map`)
    return null
  }
  return <IconComponent size={size} className={className} />
}

// Helper to get category icon
export function getCategoryIcon(category: string, size: number = 16, className?: string) {
  const iconName = CIVIC_CATEGORIES.find(cat => cat.value === category)?.icon
  if (!iconName) return null
  
  const IconComponent = iconMap[iconName]
  if (!IconComponent) return null
  
  return <IconComponent size={size} className={className} />
}

// Helper to get action icon
export function getActionIcon(action: string, size: number = 16, className?: string) {
  const iconName = ACTION_LABELS[action as keyof typeof ACTION_LABELS]?.icon
  if (!iconName) return null
  
  const IconComponent = iconMap[iconName]
  if (!IconComponent) return null
  
  return <IconComponent size={size} className={className} />
}

// Re-export common icons for convenience
export {
  Home,
  GraduationCap,
  Bus,
  Shield,
  Heart,
  Briefcase,
  Leaf,
  Scale,
  Building2,
  DollarSign,
  MapPin,
  MoreHorizontal,
  Eye,
  Bookmark,
  Plus,
  Share2,
  ThumbsUp,
  Phone,
  Calendar,
  Users,
  PenTool,
  Download,
  MessageCircle,
  AlertCircle,
  FileText,
  HelpCircle,
} from 'lucide-react'