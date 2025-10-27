export enum ChoiceType {
  NARRATIVE = 'narrative',
  DIALOGUE = 'dialogue',
  ACTION = 'action',
  MORAL = 'moral',
  STRATEGIC = 'strategic',
  EXPLORATION = 'exploration',
  RELATIONSHIP = 'relationship',
  SKILL_CHECK = 'skill_check',
  INVENTORY = 'inventory',
  ENDING = 'ending',
}

export class ChoiceTypeVO {
  private constructor(private readonly value: ChoiceType) {}

  static create(type: string): ChoiceTypeVO {
    if (!Object.values(ChoiceType).includes(type as ChoiceType)) {
      throw new Error(`Invalid choice type: ${type}`);
    }
    return new ChoiceTypeVO(type as ChoiceType);
  }

  static narrative(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.NARRATIVE);
  }

  static dialogue(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.DIALOGUE);
  }

  static action(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.ACTION);
  }

  static moral(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.MORAL);
  }

  static strategic(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.STRATEGIC);
  }

  static exploration(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.EXPLORATION);
  }

  static relationship(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.RELATIONSHIP);
  }

  static skillCheck(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.SKILL_CHECK);
  }

  static inventory(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.INVENTORY);
  }

  static ending(): ChoiceTypeVO {
    return new ChoiceTypeVO(ChoiceType.ENDING);
  }

  getValue(): ChoiceType {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ChoiceTypeVO): boolean {
    return this.value === other.value;
  }

  isNarrative(): boolean {
    return this.value === ChoiceType.NARRATIVE;
  }

  isDialogue(): boolean {
    return this.value === ChoiceType.DIALOGUE;
  }

  isAction(): boolean {
    return this.value === ChoiceType.ACTION;
  }

  isMoral(): boolean {
    return this.value === ChoiceType.MORAL;
  }

  isStrategic(): boolean {
    return this.value === ChoiceType.STRATEGIC;
  }

  isExploration(): boolean {
    return this.value === ChoiceType.EXPLORATION;
  }

  isRelationship(): boolean {
    return this.value === ChoiceType.RELATIONSHIP;
  }

  isSkillCheck(): boolean {
    return this.value === ChoiceType.SKILL_CHECK;
  }

  isInventory(): boolean {
    return this.value === ChoiceType.INVENTORY;
  }

  isEnding(): boolean {
    return this.value === ChoiceType.ENDING;
  }

  getDisplayName(): string {
    const displayNames: Record<ChoiceType, string> = {
      [ChoiceType.NARRATIVE]: 'Narrative',
      [ChoiceType.DIALOGUE]: 'Dialogue',
      [ChoiceType.ACTION]: 'Action',
      [ChoiceType.MORAL]: 'Moral',
      [ChoiceType.STRATEGIC]: 'Strategic',
      [ChoiceType.EXPLORATION]: 'Exploration',
      [ChoiceType.RELATIONSHIP]: 'Relationship',
      [ChoiceType.SKILL_CHECK]: 'Skill Check',
      [ChoiceType.INVENTORY]: 'Inventory',
      [ChoiceType.ENDING]: 'Ending',
    };

    return displayNames[this.value];
  }

  getDescription(): string {
    const descriptions: Record<ChoiceType, string> = {
      [ChoiceType.NARRATIVE]: 'Choices that advance the main story narrative',
      [ChoiceType.DIALOGUE]: 'Choices involving character conversations and responses',
      [ChoiceType.ACTION]: 'Choices involving physical actions or activities',
      [ChoiceType.MORAL]: 'Choices involving ethical decisions and moral dilemmas',
      [ChoiceType.STRATEGIC]: 'Choices requiring tactical thinking and planning',
      [ChoiceType.EXPLORATION]: 'Choices involving discovery and investigation',
      [ChoiceType.RELATIONSHIP]: 'Choices affecting character relationships and social dynamics',
      [ChoiceType.SKILL_CHECK]: 'Choices requiring specific skills or abilities',
      [ChoiceType.INVENTORY]: 'Choices involving items, resources, or equipment',
      [ChoiceType.ENDING]: 'Choices that lead to story conclusions or endings',
    };

    return descriptions[this.value];
  }

  getIcon(): string {
    const icons: Record<ChoiceType, string> = {
      [ChoiceType.NARRATIVE]: '📖',
      [ChoiceType.DIALOGUE]: '💬',
      [ChoiceType.ACTION]: '⚡',
      [ChoiceType.MORAL]: '⚖️',
      [ChoiceType.STRATEGIC]: '🎯',
      [ChoiceType.EXPLORATION]: '🔍',
      [ChoiceType.RELATIONSHIP]: '❤️',
      [ChoiceType.SKILL_CHECK]: '🎲',
      [ChoiceType.INVENTORY]: '🎒',
      [ChoiceType.ENDING]: '🏁',
    };

    return icons[this.value];
  }

  getColor(): string {
    const colors: Record<ChoiceType, string> = {
      [ChoiceType.NARRATIVE]: '#3B82F6', // Blue
      [ChoiceType.DIALOGUE]: '#10B981', // Green
      [ChoiceType.ACTION]: '#F59E0B', // Yellow
      [ChoiceType.MORAL]: '#8B5CF6', // Purple
      [ChoiceType.STRATEGIC]: '#EF4444', // Red
      [ChoiceType.EXPLORATION]: '#06B6D4', // Cyan
      [ChoiceType.RELATIONSHIP]: '#EC4899', // Pink
      [ChoiceType.SKILL_CHECK]: '#84CC16', // Lime
      [ChoiceType.INVENTORY]: '#6B7280', // Gray
      [ChoiceType.ENDING]: '#F97316', // Orange
    };

    return colors[this.value];
  }

  getPriority(): number {
    const priorities: Record<ChoiceType, number> = {
      [ChoiceType.ENDING]: 10,
      [ChoiceType.MORAL]: 9,
      [ChoiceType.STRATEGIC]: 8,
      [ChoiceType.NARRATIVE]: 7,
      [ChoiceType.RELATIONSHIP]: 6,
      [ChoiceType.ACTION]: 5,
      [ChoiceType.DIALOGUE]: 4,
      [ChoiceType.SKILL_CHECK]: 3,
      [ChoiceType.EXPLORATION]: 2,
      [ChoiceType.INVENTORY]: 1,
    };

    return priorities[this.value];
  }
}
