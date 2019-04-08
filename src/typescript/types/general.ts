import SegmentModel from '../models/audio-analysis/Segment';
import BeatModel from '../models/audio-analysis/Beat';
import BarModel from '../models/audio-analysis/Bar';
import { BeatListOrientation, BranchNavStatus, NeedleType } from './enums';
import TrackModel from '../models/audio-analysis/Track';
import BranchModel from '../models/branches/Branch';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';
import QueuedBeatModel from '../models/web-audio/QueuedBeat';

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
  beatPreviewTimer: NodeJS.Timeout;
  lastFocusedBeatList: BeatListOrientation | null;
  scrollLeftTarget: number;
  mouseOverBeatList: BeatListOrientation | null;
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

export interface SettingsPanelProps {
  onToggleBranchNavClick: () => void;
  isBranchNavHidden: boolean;
  isBranchNavDisabled: boolean;
}

export type FYPEventPayload = {
  PlayingTrackChanged: {
    playingTrack: TrackModel;
    childTracks: TrackModel[];
  };
  PlayingTrackBranchesAnalyzed: {
    playingTrack: TrackModel | null;
    childTracks: TrackModel[] | null;
  };
  PlayingTrackBranchAdded: {
    branchesAdded: BranchModel[];
  };
  PlayingTrackRendered: {};
  NextBeatsRequested: {
    playingTrack: TrackModel;
    beatBatchCount: number;
    nextBranch: BranchModel | null; // Not present when previewing through BranchNav
  };
  BeatsReadyForQueueing: {
    beatBatch: BeatBatch;
  };
  PlayingBeatBatch: {
    source: NeedleType;
    nextBranch: BranchModel;
    startPercentage: number;
    endPercentage: number;
    durationMs: number;
  };
  PlayingBeatBatchStopped: {
    resetPercentage: number | null; // Where to move NeedleType.PLAYING after stopping
  };
};

export type BeatBatch = {
  beatsToBranchOrigin: BeatModel[], // Beats up to, but not including, the originBeat of the branch
  branch: BranchModel,
};

export type QueuedBeatBatch = {
  queuedBeatsToBranchOrigin: QueuedBeatModel[],
  branch: BranchModel,
};

export type ForwardAndBackwardBranch = [ForwardBranchModel, BackwardBranchModel];
export type ForwardAndBackwardBranches = [ForwardBranchModel[], BackwardBranchModel[]];
