import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  MessagesSquare,
  CalendarDays,
  FileText,
  Settings,
  User,
  Sliders,
  DollarSign,
  Cpu,
  Video,
  FileSpreadsheet,
  Building2,
  FolderLock,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, companySettings } = useApp();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    hidden?: boolean;
  }

  const getNavItems = (): NavItem[] => {
    switch (currentUser.role) {
      case 'product_super_admin':
      case 'product_admin':
        return [
          { id: 'dashboard', label: 'Platform Overview', icon: LayoutDashboard },
          { id: 'demo_requests', label: 'Demo Requests', icon: FileSpreadsheet },
          { id: 'company_admins', label: 'Company Admins', icon: Building2 },
          { id: 'pricing', label: 'Pricing Plans', icon: DollarSign },
          { id: 'integrations', label: 'Integrations & Settings', icon: Sliders },
        ];

      case 'company_admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'clients_users', label: 'Clients & Users', icon: Users },
          { id: 'community', label: 'Team Community', icon: MessagesSquare },
          {
            id: 'chat',
            label: 'Team Chat',
            icon: MessageSquare,
            hidden: !companySettings.allowChatWithUsers,
          },
          { id: 'scheduling', label: 'Scheduling & Calls', icon: Video },
          { id: 'ai_transcripts', label: 'AI Summary & Transcripts', icon: Cpu },
          { id: 'calendar', label: 'Calendar & Attendance', icon: CalendarDays },
          { id: 'resources', label: 'Resources & Reports', icon: FileText },
          { id: 'settings', label: 'Company Settings', icon: Settings },
          { id: 'profile', label: 'Admin Profile', icon: User },
        ];

      case 'client':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'client_group', label: 'Client Group & Batch', icon: Building2 },
          { id: 'community', label: 'Team Community', icon: MessagesSquare },
          {
            id: 'chat',
            label: 'Chat',
            icon: MessageSquare,
            hidden: !companySettings.allowChatWithUsers,
          },
          { id: 'meetings', label: 'Meetings & Calls', icon: Video },
          { id: 'ai_transcripts', label: 'AI Summary & Transcript', icon: Cpu },
          { id: 'calendar', label: 'Attendance Calendar', icon: CalendarDays },
          { id: 'resources', label: 'Resources & Reviews', icon: FileText },
          { id: 'profile', label: 'Client Profile', icon: User },
        ];

      case 'work_user':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'groups', label: 'Assigned Groups', icon: Layers },
          { id: 'community', label: 'Team Community', icon: MessagesSquare },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare },
          { id: 'meetings', label: 'Scheduled Meetings', icon: Video },
          { id: 'ai_transcripts', label: 'AI Transcripts', icon: Cpu },
          { id: 'calendar', label: 'Attendance Log', icon: CalendarDays },
          { id: 'resources', label: 'Resources & Reports', icon: FileText },
          { id: 'profile', label: 'Employee Profile', icon: User },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems().filter((item) => !item.hidden);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full">
      <nav className="flex-1 px-3 pt-1.5 pb-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />
                <span className="truncate font-semibold">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <FolderLock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-medium">Role RBAC Active & Isolated</span>
        </div>
      </div>
    </aside>
  );
};
