import { DrawInformation } from './Drawable';

class DrawableBuilder {
  private drawInformationBatch: DrawInformation[] = [];

  add(drawInformation: DrawInformation): DrawableBuilder {
    this.drawInformationBatch.push(drawInformation);
    return this;
  }

  build(): DrawInformation[] {
    return this.drawInformationBatch;
  }
}

export default DrawableBuilder;
