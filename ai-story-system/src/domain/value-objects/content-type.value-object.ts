export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  COMBINED = 'combined',
}

export class ContentTypeVO {
  private constructor(private readonly value: ContentType) {}

  static create(type: string): ContentTypeVO {
    if (!Object.values(ContentType).includes(type as ContentType)) {
      throw new Error(`Invalid content type: ${type}`);
    }
    return new ContentTypeVO(type as ContentType);
  }

  static text(): ContentTypeVO {
    return new ContentTypeVO(ContentType.TEXT);
  }

  static image(): ContentTypeVO {
    return new ContentTypeVO(ContentType.IMAGE);
  }

  static audio(): ContentTypeVO {
    return new ContentTypeVO(ContentType.AUDIO);
  }

  static combined(): ContentTypeVO {
    return new ContentTypeVO(ContentType.COMBINED);
  }

  getValue(): ContentType {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ContentTypeVO): boolean {
    return this.value === other.value;
  }

  isText(): boolean {
    return this.value === ContentType.TEXT;
  }

  isImage(): boolean {
    return this.value === ContentType.IMAGE;
  }

  isAudio(): boolean {
    return this.value === ContentType.AUDIO;
  }

  isCombined(): boolean {
    return this.value === ContentType.COMBINED;
  }

  isMediaType(): boolean {
    return this.value === ContentType.IMAGE || this.value === ContentType.AUDIO;
  }

  getDisplayName(): string {
    const displayNames: Record<ContentType, string> = {
      [ContentType.TEXT]: 'Text',
      [ContentType.IMAGE]: 'Image',
      [ContentType.AUDIO]: 'Audio',
      [ContentType.COMBINED]: 'Combined',
    };

    return displayNames[this.value];
  }

  getDescription(): string {
    const descriptions: Record<ContentType, string> = {
      [ContentType.TEXT]: 'Text-based story content',
      [ContentType.IMAGE]: 'Visual illustration for the story',
      [ContentType.AUDIO]: 'Audio narration or sound effects',
      [ContentType.COMBINED]: 'Content combining text, image, and/or audio',
    };

    return descriptions[this.value];
  }

  getMimeTypes(): string[] {
    const mimeTypes: Record<ContentType, string[]> = {
      [ContentType.TEXT]: ['text/plain', 'text/html', 'text/markdown'],
      [ContentType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [ContentType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      [ContentType.COMBINED]: [], // Combined doesn't have specific mime types
    };

    return mimeTypes[this.value];
  }

  getFileExtensions(): string[] {
    const extensions: Record<ContentType, string[]> = {
      [ContentType.TEXT]: ['.txt', '.html', '.md'],
      [ContentType.IMAGE]: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      [ContentType.AUDIO]: ['.mp3', '.wav', '.ogg', '.m4a'],
      [ContentType.COMBINED]: [], // Combined doesn't have specific extensions
    };

    return extensions[this.value];
  }
}
