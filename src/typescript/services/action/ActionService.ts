import TrackModel from '../../models/audio-analysis/Track';
import ActionModel from '../../models/Action';

abstract class ActionService {
  protected async generateAndDispatchActions(track: TrackModel) {
    const actions = await this.generateActions(track);
    this.dispatchActions(track, actions);
  }

  protected abstract async generateActions(track: TrackModel): Promise<ActionModel[]>;
  protected abstract dispatchActions(track: TrackModel, actions: ActionModel[]): void;
  public abstract getNext(track: TrackModel, fromMs: number): ActionModel;
}

export default ActionService;
