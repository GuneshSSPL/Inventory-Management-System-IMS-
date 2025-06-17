import { pool, sql, poolConnect } from '../config/db.js';

// Placeholder functions for Workspace CRUD operations

import db from '../models/index.js'; // Import db

export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required.' });
    }
    const workspace = await db.Workspace.create({ name, description });
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Error creating workspace', error: error.message });
  }
};

export const getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await db.Workspace.findAll();
    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Error fetching workspaces', error: error.message });
  }
};

export const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await db.Workspace.findByPk(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }
    res.status(200).json(workspace);
  } catch (error) {
    console.error('Error fetching workspace by ID:', error);
    res.status(500).json({ message: 'Error fetching workspace', error: error.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const workspace = await db.Workspace.findByPk(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }
    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();
    res.status(200).json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ message: 'Error updating workspace', error: error.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await db.Workspace.findByPk(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }
    await workspace.destroy();
    res.status(200).json({ message: 'Workspace deleted successfully.' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ message: 'Error deleting workspace', error: error.message });
  }
};