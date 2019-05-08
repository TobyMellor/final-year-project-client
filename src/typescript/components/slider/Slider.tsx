import * as React from 'react';
import { SliderProps, SliderState } from '../../types/general';

class Slider extends React.Component<SliderProps, SliderState> {
  constructor(props: SliderProps) {
    super(props);

    this.state = {
      value: props.initialValue,
    };
  }

  render() {
    const { label, min, max, step } = this.props;
    const value = this.state.value;

    return (
      <div className="input-group">
        <div className="form-group">
          <label>{label}</label>
          <input type="range"
                 className="form-control-range"
                 min={min}
                 max={max}
                 step={step}
                 value={value}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)} />
        </div>
      </div>
    );
  }

  private handleChange({ target }: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(target.value);

    this.props.onSlide(value);
    this.setState({
      value,
    });
  }
}

export default Slider;
