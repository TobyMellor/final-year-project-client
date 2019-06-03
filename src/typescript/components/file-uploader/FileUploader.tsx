import * as React from 'react';
type FileUploaderProps = {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
};

const FileUploader = (props: FileUploaderProps) => (
  <button className="btn btn-outline-primary file-uploader" disabled={props.disabled}>
    Upload Track
    <input
      type="file"
      id="upload-track"
      onChange={props.handleFileChange}
      disabled={props.disabled}
      accept=".mp3,audio/*"
    />
  </button>
);

export default FileUploader;
