import { ChoiceType } from '../value-objects/choice-type.value-object';

export class StoryChoice {
  constructor(
    public readonly id: string,
    public readonly storyId: string,
    public readonly parentContentId: string,
    public readonly text: string,
    public readonly description: string,
    public readonly type: ChoiceType,
    public readonly sequence: number,
    public readonly createdAt: Date,
    public readonly isAvailable: boolean = true,
    public readonly isSelected: boolean = false,
    public readonly selectedAt?: Date,
  ) {}

  /**
   * Creates a new story choice
   */
  static create(
    id: string,
    storyId: string,
    parentContentId: string,
    text: string,
    description: string,
    type: ChoiceType,
    sequence: number,
  ): StoryChoice {
    return new StoryChoice(
      id,
      storyId,
      parentContentId,
      text,
      description,
      type,
      sequence,
      new Date(),
      true,
      false,
      undefined,
    );
  }

  /**
   * Selects this choice
   */
  select(): StoryChoice {
    if (!this.isAvailable) {
      throw new Error('Cannot select an unavailable choice');
    }

    if (this.isSelected) {
      throw new Error('Choice is already selected');
    }

    return new StoryChoice(
      this.id,
      this.storyId,
      this.parentContentId,
      this.text,
      this.description,
      this.type,
      this.sequence,
      this.createdAt,
      this.isAvailable,
      true,
      new Date(),
    );
  }

  /**
   * Makes the choice unavailable
   */
  makeUnavailable(): StoryChoice {
    return new StoryChoice(
      this.id,
      this.storyId,
      this.parentContentId,
      this.text,
      this.description,
      this.type,
      this.sequence,
      this.createdAt,
      false,
      this.isSelected,
      this.selectedAt,
    );
  }

  /**
   * Makes the choice available again
   */
  makeAvailable(): StoryChoice {
    return new StoryChoice(
      this.id,
      this.storyId,
      this.parentContentId,
      this.text,
      this.description,
      this.type,
      this.sequence,
      this.createdAt,
      true,
      this.isSelected,
      this.selectedAt,
    );
  }

  /**
   * Gets the display text for the choice
   */
  get displayText(): string {
    return this.text;
  }

  /**
   * Checks if the choice is selectable
   */
  get isSelectable(): boolean {
    return this.isAvailable && !this.isSelected;
  }
}
