import SegmentModel from '../models/audio-analysis/Segment';
import BeatModel from '../models/audio-analysis/Beat';
import BarModel from '../models/audio-analysis/Bar';
import { BeatListOrientation, BranchNavStatus } from './enums';
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
  queued: UIBeatType[];
  playing: UIBeatType;
  selected: UIBeatType;
  disabled: UIBeatType[];
  lastKnownScrollPosition?: number;
};

export interface UIBeatType {
  order: number;
  barOrder: number;
  timbreNormalized: number;
  loudnessNormalized: number;
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
}

export interface BranchNavState {
  status: BranchNavStatus;
  beatLists: {
    [key: string]: BeatListInfo;
  };
  beatPreviewTimer: NodeJS.Timeout;
  lastFocusedBeatList: BeatListOrientation | null;
  scrollLeftTarget: number;
  scrollPriorityBeatList: BeatListOrientation | null;
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
  queuedUIBeats: UIBeatType[];
  playingUIBeat: UIBeatType | null;
  disabledUIBeats: UIBeatType[];
  isHidden?: boolean;
  orientation: BeatListOrientation;
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

export type FYPEventPayload = {
  PlayingTrackChanged: {
    playingTrack: TrackModel;
    childTracks: TrackModel[];
  };
  PlayingTrackBranchesAnalyzed: {
    playingTrack: TrackModel;
    childTracks: TrackModel[];
    forwardAndBackwardBranches: ForwardAndBackwardBranches;
  };
  PlayingTrackRendered: {};
  NextBeatsRequested: {
    playingTrack: TrackModel;
    beatBatchCount: number;
    lastQueuedBeat: QueuedBeatModel | null;
  };
  BeatsReadyForQueueing: {
    beats: BeatModel[];
    nextBranch: BranchModel | null;
  };
  PlayingBeatBatch: {
    startPercentage: number,
    endPercentage: number,
    durationMs: number,
  };
};

export type ForwardAndBackwardBranch = [ForwardBranchModel, BackwardBranchModel];
export type ForwardAndBackwardBranches = [ForwardBranchModel[], BackwardBranchModel[]];
