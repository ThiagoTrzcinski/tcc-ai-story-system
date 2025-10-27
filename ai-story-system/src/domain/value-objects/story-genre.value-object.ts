export enum StoryGenre {
  FANTASY = 'fantasy',
  SCIENCE_FICTION = 'science_fiction',
  MYSTERY = 'mystery',
  THRILLER = 'thriller',
  ROMANCE = 'romance',
  HORROR = 'horror',
  ADVENTURE = 'adventure',
  DRAMA = 'drama',
  COMEDY = 'comedy',
  HISTORICAL = 'historical',
  WESTERN = 'western',
  CRIME = 'crime',
  SUPERNATURAL = 'supernatural',
  DYSTOPIAN = 'dystopian',
  STEAMPUNK = 'steampunk',
  CYBERPUNK = 'cyberpunk',
  URBAN_FANTASY = 'urban_fantasy',
  SLICE_OF_LIFE = 'slice_of_life',
  COMING_OF_AGE = 'coming_of_age',
  CUSTOM = 'custom',
}

export class StoryGenreVO {
  private constructor(
    private readonly value: StoryGenre,
    private readonly customName?: string,
  ) {}

  static create(genre: string, customName?: string): StoryGenreVO {
    if (!Object.values(StoryGenre).includes(genre as StoryGenre)) {
      throw new Error(`Invalid story genre: ${genre}`);
    }

    if (genre === StoryGenre.CUSTOM && !customName) {
      throw new Error('Custom genre requires a custom name');
    }

    return new StoryGenreVO(genre as StoryGenre, customName);
  }

  static fantasy(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.FANTASY);
  }

  static scienceFiction(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.SCIENCE_FICTION);
  }

  static mystery(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.MYSTERY);
  }

  static thriller(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.THRILLER);
  }

  static romance(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.ROMANCE);
  }

  static horror(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.HORROR);
  }

  static adventure(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.ADVENTURE);
  }

  static drama(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.DRAMA);
  }

  static comedy(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.COMEDY);
  }

  static historical(): StoryGenreVO {
    return new StoryGenreVO(StoryGenre.HISTORICAL);
  }

  static custom(customName: string): StoryGenreVO {
    if (!customName || customName.trim().length === 0) {
      throw new Error('Custom genre name cannot be empty');
    }
    return new StoryGenreVO(StoryGenre.CUSTOM, customName.trim());
  }

  getValue(): StoryGenre {
    return this.value;
  }

  getCustomName(): string | undefined {
    return this.customName;
  }

  toString(): string {
    return this.value;
  }

  equals(other: StoryGenreVO): boolean {
    return this.value === other.value && this.customName === other.customName;
  }

  getDisplayName(): string {
    if (this.value === StoryGenre.CUSTOM && this.customName) {
      return this.customName;
    }

    const displayNames: Record<StoryGenre, string> = {
      [StoryGenre.FANTASY]: 'Fantasy',
      [StoryGenre.SCIENCE_FICTION]: 'Science Fiction',
      [StoryGenre.MYSTERY]: 'Mystery',
      [StoryGenre.THRILLER]: 'Thriller',
      [StoryGenre.ROMANCE]: 'Romance',
      [StoryGenre.HORROR]: 'Horror',
      [StoryGenre.ADVENTURE]: 'Adventure',
      [StoryGenre.DRAMA]: 'Drama',
      [StoryGenre.COMEDY]: 'Comedy',
      [StoryGenre.HISTORICAL]: 'Historical',
      [StoryGenre.WESTERN]: 'Western',
      [StoryGenre.CRIME]: 'Crime',
      [StoryGenre.SUPERNATURAL]: 'Supernatural',
      [StoryGenre.DYSTOPIAN]: 'Dystopian',
      [StoryGenre.STEAMPUNK]: 'Steampunk',
      [StoryGenre.CYBERPUNK]: 'Cyberpunk',
      [StoryGenre.URBAN_FANTASY]: 'Urban Fantasy',
      [StoryGenre.SLICE_OF_LIFE]: 'Slice of Life',
      [StoryGenre.COMING_OF_AGE]: 'Coming of Age',
      [StoryGenre.CUSTOM]: 'Custom',
    };

    return displayNames[this.value];
  }

  getDescription(): string {
    const descriptions: Record<StoryGenre, string> = {
      [StoryGenre.FANTASY]: 'Stories featuring magical elements, mythical creatures, and imaginary worlds',
      [StoryGenre.SCIENCE_FICTION]: 'Stories exploring futuristic concepts, advanced technology, and space exploration',
      [StoryGenre.MYSTERY]: 'Stories involving puzzles, crimes, or unexplained events to be solved',
      [StoryGenre.THRILLER]: 'Fast-paced stories designed to create suspense and excitement',
      [StoryGenre.ROMANCE]: 'Stories focusing on love relationships and romantic entanglements',
      [StoryGenre.HORROR]: 'Stories intended to frighten, unsettle, or create suspense',
      [StoryGenre.ADVENTURE]: 'Stories featuring exciting journeys and daring exploits',
      [StoryGenre.DRAMA]: 'Stories focusing on realistic characters and emotional themes',
      [StoryGenre.COMEDY]: 'Stories intended to be humorous and entertaining',
      [StoryGenre.HISTORICAL]: 'Stories set in the past, often featuring historical events or figures',
      [StoryGenre.WESTERN]: 'Stories set in the American Old West',
      [StoryGenre.CRIME]: 'Stories involving criminal activity and law enforcement',
      [StoryGenre.SUPERNATURAL]: 'Stories involving paranormal or otherworldly elements',
      [StoryGenre.DYSTOPIAN]: 'Stories set in imaginary societies where something is terribly wrong',
      [StoryGenre.STEAMPUNK]: 'Stories featuring steam-powered technology in Victorian-era settings',
      [StoryGenre.CYBERPUNK]: 'Stories featuring high tech and low life in dystopian futures',
      [StoryGenre.URBAN_FANTASY]: 'Fantasy stories set in modern urban environments',
      [StoryGenre.SLICE_OF_LIFE]: 'Stories depicting everyday experiences and ordinary life',
      [StoryGenre.COMING_OF_AGE]: 'Stories about characters growing up and maturing',
      [StoryGenre.CUSTOM]: 'Custom genre defined by the user',
    };

    return descriptions[this.value];
  }

  isCustom(): boolean {
    return this.value === StoryGenre.CUSTOM;
  }
}
