import { SelectImageModal } from "@erikhermansson79/files.ui";

function SelectImage() {
  return (
      <SelectImageModal
          onClose={() => {
              
          }}
          onSelectImage={() => {

          }}
          initialPath="wiki"
      />
  );
}

export default SelectImage;