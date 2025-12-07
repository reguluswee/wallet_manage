import {
    LayoutDashboard,
    Users,
    Building2,
    Banknote,
    FileText,
    Shield,
    Server,
    Settings
} from 'lucide-react';

// Infer LucideIcon type from the icon components
type LucideIcon = typeof LayoutDashboard;

// Map icon names from backend to Lucide React components
export const iconMap: Record<string, LucideIcon> = {
    'LayoutDashboard': LayoutDashboard,
    'Users': Users,
    'Building2': Building2,
    'Banknote': Banknote,
    'FileText': FileText,
    'Shield': Shield,
    'Server': Server,
    'Settings': Settings,
};

export const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || LayoutDashboard;
};
