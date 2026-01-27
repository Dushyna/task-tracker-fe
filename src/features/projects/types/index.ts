export interface Project {
  id: string;
  title: string;
  description: string;
  owner: EmployeeDto;
  projectTeam: CollaboratorDto[];
}

// дто без id
export type CreateProjectDto = Omit<Project, "id" | "owner" | "projectTeam">;

export interface CollaboratorDto {
    userId: string;
    email: string;
    roles: ProjectRole[];
}

export interface EmployeeDto {
    id: string;
    email: string;
}


export interface ProjectsSliceState {
  projects: Project[];
  currentProject?: Project | null;
  createProjectErrorMessage?: string;
  inviteUserErrorMessage?: string;
  isLoading: boolean;
}

export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface InviteRequestDto {
    email: string;
    role: ProjectRole;
}



export interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: ProjectRole) => void;
    error?: string;
}

