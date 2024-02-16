import {
  Input,
  array,
  custom,
  forward,
  minLength,
  minValue,
  number,
  object,
  string,
} from "valibot";

const FileSchema = object(
  {
    file_no: string([minLength(1, "Please enter file number.")]),
    year: number([minValue(1, "Please enter file year.")]),
    typeId: number([minValue(1, "Select file type.")]),
    assignTo: number([minValue(1, "Select assign user.")]),
  },
  [
    forward(
      custom((input) => input.typeId != 0, "Select file type."),
      ["typeId"]
    ),
    forward(
      custom((input) => input.assignTo != 0, "Select assign user."),
      ["assignTo"]
    ),
  ]
);

type FileForm = Input<typeof FileSchema>;
export { FileSchema, type FileForm };
