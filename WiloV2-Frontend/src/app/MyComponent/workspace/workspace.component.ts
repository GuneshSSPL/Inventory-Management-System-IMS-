import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { PermissionDirective } from '../../directives/permission.directive'; // Import PermissionDirective
import { WorkspaceService } from '../workspace.service'; // Import WorkspaceService

@Component({
  selector: 'app-workspace',
  standalone: true, // Add standalone: true
  imports: [CommonModule, FormsModule, PermissionDirective], // Add CommonModule, FormsModule, and PermissionDirective to imports
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit {
  workspaces: any[] = [];

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.workspaceService.getAllWorkspaces().subscribe(
      (data) => {
        this.workspaces = data;
      },
      (error) => {
        console.error('Error fetching workspaces:', error);
      }
    );
  }

  newWorkspace = { name: '', description: '' };

  createWorkspace(): void {
    this.workspaceService.createWorkspace(this.newWorkspace).subscribe(
      (data) => {
        console.log('Workspace created:', data);
        this.loadWorkspaces(); // Refresh the list after creating a new workspace
        this.newWorkspace = { name: '', description: '' }; // Clear the form
      },
      (error) => {
        console.error('Error creating workspace:', error);
      }
    );
  }

  editingWorkspace: any = null;
  updatedWorkspace = { name: '', description: '' };

  editWorkspace(workspace: any): void {
    this.editingWorkspace = workspace;
    this.updatedWorkspace = { ...workspace }; // Create a copy for editing
  }

  saveWorkspace(): void {
    if (this.editingWorkspace) {
      this.workspaceService.updateWorkspace(this.editingWorkspace.id, this.updatedWorkspace).subscribe(
        (data) => {
          console.log('Workspace updated:', data);
          this.loadWorkspaces(); // Refresh the list
          this.cancelEdit(); // Exit editing mode
        },
        (error) => {
          console.error('Error updating workspace:', error);
        }
      );
    }
  }

  cancelEdit(): void {
    this.editingWorkspace = null;
    this.updatedWorkspace = { name: '', description: '' };
  }

  deleteWorkspace(id: number): void {
    if (confirm('Are you sure you want to delete this workspace?')) {
      this.workspaceService.deleteWorkspace(id).subscribe(
        (data) => {
          console.log('Workspace deleted:', data);
          this.loadWorkspaces(); // Refresh the list
        },
        (error) => {
          console.error('Error deleting workspace:', error);
        }
      );
    }
  }
}
