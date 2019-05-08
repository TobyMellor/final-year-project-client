import SegmentModel from '../models/audio-analysis/Segment';
import BeatModel from '../models/audio-analysis/Beat';
import BarModel from '../models/audio-analysis/Bar';
import { BeatListOrientation, BranchNavStatus, NeedleType, TransitionType, ButtonColour } from './enums';
import TrackModel from '../models/audio-analysis/Track';
import BranchModel from '../models/branches/Branch';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';
import SongTransitionModel from '../models/SongTransition';
import ActionModel from '../models/Action';
import QueuedSampleModel from '../models/web-audio/QueuedBeat';
import WorldPoint from '../services/canvas/drawables/utils/WorldPoint';
import SongCircle from '../services/canvas/drawables/SongCircle';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import { Drawable } from '../services/canvas/drawables/Scene';

export type TimeIdentifier = {
  ms: number;
  secs: number;
};

export interface CreateBarsBeatsAndSegments {
  bars: BarModel[];
  beats: BeatModel[];
  segments: SegmentModel[];
}

export type BeatListInfo = {
  initiallyCentered?: UIBeatType;
  queued: UIBeatType[];
  playing: UIBeatType;
  selected: UIBeatType;
  disabled: UIBeatType[];
  lastKnownScrollLeft?: number;
};

export interface UIBeatType {
  order: number;
  barOrder: number;
  timbreNormalized: number;
  loudnessNormalized: number;
  startMs: number;
  durationMs: number;
}

export interface UIBarType {
  order: number;
  beats: UIBeatType[];
}

export interface QueuedUIBeat extends UIBeatType {
  orientation: string;
}

export interface BranchNavProps {
  UIBars: UIBarType[];
  isHidden?: boolean;
  onRequestClose: (status: BranchNavStatus) => void;
}

export interface BranchNavState {
  status: BranchNavStatus;
  beatLists: {
    [key: string]: BeatListInfo;
  };
  lastFocusedBeatList: BeatListOrientation | null;
  scrollLeftTarget: number;
  mouseOverBeatList: BeatListOrientation | null;
  beatPreviewTimer: NodeJS.Timeout;
  beatPathTimer: NodeJS.Timeout;
}

export interface BranchNavFooterProps {
  status: BranchNavStatus;
  onPreviewClick: () => void;
  onPreviewingBackClick: () => void;
  onPreviewingCreateBranchClick: () => void;
}

export interface BeatListProps {
  UIBars: UIBarType[];
  initiallyCenteredUIBeat?: UIBeatType;
  queuedUIBeats: UIBeatType[];
  playingUIBeat: UIBeatType | null;
  disabledUIBeats: UIBeatType[];
  isHidden?: boolean;
  orientation: BeatListOrientation;
  initialScrollLeft?: number;
  onBeatClick: (
    beatListOrientation: BeatListOrientation,
    UIBeat: UIBeatType,
  ) => void;
  onBeatListScroll: (
    beatListOrientation: BeatListOrientation,
    currentTarget: Element,
  ) => void;
}

export interface BeatListState {
  selectedUIBeat: UIBeatType;
  scrollCallbackFn: () => void;
}

export interface BeatProps {
  UIBeat: UIBeatType;
  isInitiallyCentered: boolean;
  isQueued: boolean;
  isPlaying: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  zIndex: number;
  onBeatClick: (UIBeat: UIBeatType, scrollCallbackFn: () => void) => void;
  onBeatMouseEnter: () => void;
}

export interface BeatState {
  hoverCount?: number;
  scrollReturnTimer: NodeJS.Timeout | null;
}

export interface BarProps {
  UIBar: UIBarType;
  initiallyCenteredBeatOrder: number;
  queuedBeatOrders: number[];
  playingBeatOrder: number;
  selectedBeatOrder: number;
  disabledBeatOrders: number[];
  onBeatClick: (
    UIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) => void;
}

export interface BarState {
  zIndexes: number[];
}

export interface DropdownProps {
  options: {
    ID: string,
    text: string,
  }[];
  label: string;
  disabled?: boolean;
  onClick: (ID: string) => void;
}

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onSlide: (value: number) => void;
}

export interface SliderState {
  value: number;
}

export interface OptionsPanelProps {
  toggles: {
    buttons: ButtonProps[],
    dropdowns: DropdownProps[],
    sliders: SliderProps[],
  };
  isDebugPanel?: boolean;
}

export interface OptionsPanelState {}

export interface ButtonProps {
  colourClassName?: ButtonColour;
  onClick: () => void;
  label: string;
  shouldFadeIn?: boolean;
  shouldHide?: boolean;
  disabled?: boolean;
}

export interface ButtonState {
  hasFadeFinished: boolean;
  fadeTimer: NodeJS.Timeout;
}

export type FYPEventPayload = {
  TrackChangeRequested: {
    track: TrackModel;
  };
  BranchesAnalyzed: {
    track: TrackModel;
    branches: BranchModel[];
  };
  TransitionsAnalyzed: {
    track: TrackModel;
    transitions: SongTransitionModel[],
  };
  PlayingTrackBranchAdded: {
    branch: BranchModel;
  };
  TrackChanged: {
    track: TrackModel;
  };
  TrackChangeReady: {
    track: TrackModel;
  };
  TrackChanging: {
    destinationTrack: TrackModel;
    transitionDurationMs: number;
    transitionOutStartMs: number;
    transitionOutDurationMs: number;
    transitionInStartMs: number;
    transitionInDurationMs: number;
  };
  BeatBatchRequested: {
    track: TrackModel;
    fromMs: number;
    action: ActionModel | null;
    beatBatchCount: number;
  };
  BeatBatchReady: {
    beatBatch: BeatBatch;
  };
  BeatBatchPlaying: {
    source: NeedleType;
    nextAction: ActionModel; // Not present when previewing through BranchNav
    startPercentage: number;
    endPercentage: number;
    durationMs: number;
  };
  BeatBatchStopped: {
    resetPercentage: number | null; // Where to move NeedleType.PLAYING after stopping
  };
  SeekRequested: {
    percentage: number,
  },
};

export type BeatBatch = {
  track: TrackModel,
  originTrackBeats: BeatModel[], // Beats up to, but not including, the originBeat of the branch or transition
  originTrackTransitionOutBeats?: BeatModel[], // Beats after the originBeat of the transition, up to transition out
  destinationTrackTransitionInBeats?: BeatModel[], // Beats from the transition in point, to the destinationBeat
  destinationTrackEntryOffset?: TimeIdentifier, // Time from originTrackBeats[0] to destinationTrackBeats[0]
  action: ActionModel,
};

export type QueuedSampleBatch = {
  queuedSamplesToNextOriginBeat: QueuedSampleModel[],
  action: ActionModel,
};

export type ForwardAndBackwardBranch = [ForwardBranchModel, BackwardBranchModel];
export type ForwardAndBackwardBranches = [ForwardBranchModel[], BackwardBranchModel[]];

export type RGB = [number, number, number];

export interface Sample {
  queuedSample: QueuedSampleModel;
  onStartedTimer: NodeJS.Timer;
  source: AudioBufferSourceNode;
}
