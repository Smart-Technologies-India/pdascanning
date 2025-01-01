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

const AddFileSchema = object(
  {
    map_count: string([minLength(1, "Please enter page count.")]),
    page_count: string([minLength(1, "Please enter map count.")]),
    file_no: string([minLength(1, "Please enter file number.")]),
    year: number([minValue(1, "Please enter file year.")]),
    typeId: number([minValue(1, "Select file type.")]),
    applicant_name: string([minLength(1, "Please enter applicant name.")]),
    survey_number: string([
      minLength(1, "Please enter your file survey number."),
    ]),
    villageId: number([minValue(1, "Select village.")]),
    names: array(string([minLength(1, "Please enter name.")])),
    surveyNumbers: array(string([minLength(1, "Please enter survey number.")])),
  },
  [
    forward(
      custom((input) => input.villageId != 0, "Select village."),
      ["villageId"]
    ),
    forward(
      custom((input) => input.page_count != "0", "Enter valid page count."),
      ["page_count"]
    ),
    forward(
      custom((input) => input.typeId != 0, "Select file type."),
      ["typeId"]
    ),
  ]
);

type AddFileForm = Input<typeof AddFileSchema>;
export { AddFileSchema, type AddFileForm };
