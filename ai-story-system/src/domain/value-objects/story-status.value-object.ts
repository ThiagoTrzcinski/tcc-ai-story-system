export enum StoryStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export class StoryStatusVO {
  private constructor(private readonly value: StoryStatus) {}

  static create(status: string): StoryStatusVO {
    if (!Object.values(StoryStatus).includes(status as StoryStatus)) {
      throw new Error(`Invalid story status: ${status}`);
    }
    return new StoryStatusVO(status as StoryStatus);
  }

  static draft(): StoryStatusVO {
    return new StoryStatusVO(StoryStatus.DRAFT);
  }

  static inProgress(): StoryStatusVO {
    return new StoryStatusVO(StoryStatus.IN_PROGRESS);
  }

  static completed(): StoryStatusVO {
    return new StoryStatusVO(StoryStatus.COMPLETED);
  }

  static published(): StoryStatusVO {
    return new StoryStatusVO(StoryStatus.PUBLISHED);
  }

  static archived(): StoryStatusVO {
    return new StoryStatusVO(StoryStatus.ARCHIVED);
  }

  static deleted(): StoryStatusVO {
    return new StoryStatusVO(StoryStatus.DELETED);
  }

  getValue(): StoryStatus {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: StoryStatusVO): boolean {
    return this.value === other.value;
  }

  isDraft(): boolean {
    return this.value === StoryStatus.DRAFT;
  }

  isInProgress(): boolean {
    return this.value === StoryStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.value === StoryStatus.COMPLETED;
  }

  isPublished(): boolean {
    return this.value === StoryStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this.value === StoryStatus.ARCHIVED;
  }

  isDeleted(): boolean {
    return this.value === StoryStatus.DELETED;
  }

  canTransitionTo(newStatus: StoryStatus): boolean {
    const transitions: Record<StoryStatus, StoryStatus[]> = {
      [StoryStatus.DRAFT]: [StoryStatus.IN_PROGRESS, StoryStatus.DELETED],
      [StoryStatus.IN_PROGRESS]: [StoryStatus.COMPLETED, StoryStatus.DRAFT, StoryStatus.DELETED],
      [StoryStatus.COMPLETED]: [StoryStatus.PUBLISHED, StoryStatus.ARCHIVED, StoryStatus.IN_PROGRESS],
      [StoryStatus.PUBLISHED]: [StoryStatus.ARCHIVED],
      [StoryStatus.ARCHIVED]: [StoryStatus.PUBLISHED, StoryStatus.DELETED],
      [StoryStatus.DELETED]: [], // No transitions from deleted
    };

    return transitions[this.value]?.includes(newStatus) || false;
  }

  getDisplayName(): string {
    const displayNames: Record<StoryStatus, string> = {
      [StoryStatus.DRAFT]: 'Draft',
      [StoryStatus.IN_PROGRESS]: 'In Progress',
      [StoryStatus.COMPLETED]: 'Completed',
      [StoryStatus.PUBLISHED]: 'Published',
      [StoryStatus.ARCHIVED]: 'Archived',
      [StoryStatus.DELETED]: 'Deleted',
    };

    return displayNames[this.value];
  }
}
