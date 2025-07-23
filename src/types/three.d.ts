declare module 'three/examples/jsm/loaders/MTLLoader' {
  import { Loader, LoadingManager, Material } from 'three';

  export interface MaterialCreatorOptions {
    side?: import('three').Side;
    wrap?: import('three').Wrapping;
    normalizeRGB?: boolean;
    ignoreZeroRGBs?: boolean;
    invertTrProperty?: boolean;
  }

  export class MaterialCreator {
    constructor(baseUrl?: string, options?: MaterialCreatorOptions);
    baseUrl: string;
    options: MaterialCreatorOptions;
    materials: { [key: string]: Material };
    preload(): void;
    create(materialName: string): Material;
    getIndex(materialName: string): Material | undefined;
  }

  export class MTLLoader extends Loader<MaterialCreator> {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (materials: MaterialCreator) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(text: string, path: string): MaterialCreator;
    setCrossOrigin(value: string): this;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
  import { Loader, LoadingManager, Group } from 'three';
  import { MaterialCreator } from 'three/examples/jsm/loaders/MTLLoader';

  export class OBJLoader extends Loader<Group> {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (object: Group) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(data: string): Group;
    setMaterials(materials: MaterialCreator): void;
  }
}