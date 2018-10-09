import { DrawInformation } from './Drawable';

class DrawableBuilder {
  private drawInformationBatch: DrawInformation[] = [];

  add(drawInformationBatch: DrawInformation[]): DrawableBuilder {
    this.drawInformationBatch.push(...drawInformationBatch);
    return this;
  }

  build(): DrawInformation[] {
    return this.drawInformationBatch;
  }
}

export default DrawableBuilder;
