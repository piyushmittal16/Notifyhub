import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { useProject } from '../../context/ProjectContext';

export const AppLayout = () => {
  const { isCreateModalOpen, closeCreateProject } = useProject();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans antialiased">
      {/* Top Navbar with Project Switcher */}
      <Navbar />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-6xl">
          <Outlet />
        </main>
      </div>

      {/* Global Centralized Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal onClose={closeCreateProject} />
      )}
    </div>
  );
};
