declare module "@srexi/purecounterjs" {
  export default class PureCounter {
    constructor(options?: Record<string, unknown>);
  }
}

declare module "imagesloaded" {
  interface ImagesLoaded {
    on(event: string, handler: () => void): void;
  }
  function imagesLoaded(
    elem: Element | string | null,
    callback?: () => void,
  ): ImagesLoaded;
  export default imagesLoaded;
}

declare module "isotope-layout" {
  export interface IsotopeOptions {
    itemSelector?: string;
    layoutMode?: string;
    filter?: string;
    sortBy?: string;
  }
  export default class Isotope {
    constructor(element: Element | null, options?: IsotopeOptions);
    layout(): void;
    arrange(options: { filter: string }): void;
    destroy(): void;
  }
}

declare module "glightbox" {
  export interface GLightboxOptions {
    selector?: string;
  }
  export interface GLightboxInstance {
    destroy(): void;
  }
  function GLightbox(options?: GLightboxOptions): GLightboxInstance;
  export default GLightbox;
}
