import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { isAuthenticated } = useAuth();
    const toast = useToast();

    // 1. Fetch user's projects
    const fetchProjects = useCallback(async () => {
        if (!isAuthenticated) {
            setProjects([]);
            setSelectedProject(null);
            return;
        }

        setLoadingProjects(true);
        try {
            const res = await api.get('/projects');
            const projectList = res.data?.projects || [];
            setProjects(projectList);

            if (projectList.length > 0) {
                // Check if there was a previously selected project in localStorage
                const savedId = localStorage.getItem('selectedProjectId');
                const matched = projectList.find((p) => p._id === savedId);

                if (matched) {
                    setSelectedProject(matched);
                } else {
                    // Default to first project
                    setSelectedProject(projectList[0]);
                    localStorage.setItem('selectedProjectId', projectList[0]._id);
                }
            } else {
                setSelectedProject(null);
                localStorage.removeItem('selectedProjectId');
            }
        } catch (err) {
            console.error('Failed to load projects:', err);
        } finally {
            setLoadingProjects(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // 2. Switch Project
    const selectProject = (projectOrId) => {
        const proj =
            typeof projectOrId === 'string'
                ? projects.find((p) => p._id === projectOrId)
                : projectOrId;

        if (proj) {
            setSelectedProject(proj);
            localStorage.setItem('selectedProjectId', proj._id);
        }
    };

    // 3. Create Project (Returns raw API key for one-time modal display)
    const createProject = async ({ name, description }) => {
        try {
            const res = await api.post('/projects', { name, description });
            const newProject = res.data.project;
            const rawApiKey = res.data.apiKey; // 🔑 Only returned once!

            setProjects((prev) => [newProject, ...prev]);
            setSelectedProject(newProject);
            localStorage.setItem('selectedProjectId', newProject._id);

            toast.success('Project Created', `"${newProject.name}" is ready.`);
            return { project: newProject, apiKey: rawApiKey };
        } catch (err) {
            toast.error('Failed to create project', err.message);
            throw err;
        }
    };

    // 3.5 Update Project (Name / Description)
    const updateProject = async (projectId, { name, description }) => {
        try {
            const res = await api.patch(`/projects/${projectId}`, { name, description });
            const updated = res.data.project;

            setProjects((prev) =>
                prev.map((p) => (p._id === projectId ? { ...p, ...updated } : p))
            );

            if (selectedProject?._id === projectId) {
                setSelectedProject((prev) => ({ ...prev, ...updated }));
            }

            toast.success('Project Updated', `"${updated.name}" has been updated.`);
            return updated;
        } catch (err) {
            toast.error('Update failed', err.message);
            throw err;
        }
    };

    // 4. Toggle Project Status (Active / Inactive)
    const toggleProjectStatus = async (projectId, newStatus) => {
        try {
            const res = await api.patch(`/projects/${projectId}/status`, { status: newStatus });
            const updated = res.data.project;

            setProjects((prev) =>
                prev.map((p) => (p._id === projectId ? { ...p, status: newStatus } : p))
            );

            if (selectedProject?._id === projectId) {
                setSelectedProject((prev) => ({ ...prev, status: newStatus }));
            }

            toast.success('Status Updated', `Project marked as ${newStatus}.`);
            return updated;
        } catch (err) {
            toast.error('Status update failed', err.message);
            throw err;
        }
    };

    // 5. Regenerate API Key
    const regenerateApiKey = async (projectId) => {
        try {
            const res = await api.post(`/projects/${projectId}/api-key`);
            toast.info('API Key Regenerated', 'Copy and store your new key safely.');
            return res.data; // Contains new raw apiKey
        } catch (err) {
            toast.error('Key regeneration failed', err.message);
            throw err;
        }
    };

    // 6. Delete Project (Soft Delete)
    const deleteProject = async (projectId) => {
        try {
            await api.delete(`/projects/${projectId}`);
            const remaining = projects.filter((p) => p._id !== projectId);
            setProjects(remaining);

            if (selectedProject?._id === projectId) {
                const nextSelected = remaining.length > 0 ? remaining[0] : null;
                setSelectedProject(nextSelected);
                if (nextSelected) {
                    localStorage.setItem('selectedProjectId', nextSelected._id);
                } else {
                    localStorage.removeItem('selectedProjectId');
                }
            }

            toast.warn('Project Deleted', 'Project has been moved to trash.');
        } catch (err) {
            toast.error('Delete failed', err.message);
            throw err;
        }
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                selectedProject,
                loadingProjects,
                selectProject,
                createProject,
                updateProject,
                toggleProjectStatus,
                regenerateApiKey,
                deleteProject,
                isCreateModalOpen,
                openCreateProject: () => setIsCreateModalOpen(true),
                closeCreateProject: () => setIsCreateModalOpen(false),
                refreshProjects: fetchProjects,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};