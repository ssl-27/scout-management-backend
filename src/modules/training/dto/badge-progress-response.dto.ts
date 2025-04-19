export class TrainingItemProgressDto {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedDate?: Date;
}

export class PrerequisiteBadgeProgressDto {
  id: string;
  title: string;
  isCompleted: boolean;
}

export class BadgeProgressResponseDto {
  badgeId: string;
  badgeTitle: string;
  badgeDescription: string;
  scoutId: string;
  scoutName: string;
  badgeType: string;
  badgeSection: string;
  // Is the badge officially completed (approved by a leader)
  isCompleted: boolean;
  // Date when the badge was officially completed
  completedDate?: Date;
  // Leader who approved the badge
  approvedBy?: string;
  // Progress percentage based on completed training items
  progressPercentage: number;
  // Are all requirements met (even if not yet approved)
  requirementsMet: boolean;
  // Individual training item progress
  trainingItems: TrainingItemProgressDto[];
  // Prerequisite badge information
  prerequisiteBadges: PrerequisiteBadgeProgressDto[];
  // Are all prerequisites met
  prerequisitesMet: boolean;
  // Any notes from the approving leader
  notes?: string;
}