"use server";

import { errorToString } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { ApiResponseType } from "@/models/response";
import { file } from "@prisma/client";

interface AddFilePayload {
  id: number;
  applicant_name: string;
  survey_number: string;
  aadhar?: string;
  remarks?: string;
  villageId: number;
  names: string[];
  surveyNumbers: string[];
  meta: number;
  file_no: string;
  year: number;
  typeId: number;
  location: number;
}

const AddFile = async (
  payload: AddFilePayload
): Promise<ApiResponseType<file | null>> => {
  try {
    const file_ressponse = await prisma.file.findFirst({
      where: { id: parseInt(payload.id.toString()) },
    });

    if (!file_ressponse)
      return {
        status: false,
        data: null,
        message: "Invalid file id. Please try again.",
        functionname: "AddFile",
      };

    let data_to_update: any = {
      applicant_name: payload.applicant_name,
      survey_number: payload.survey_number,
      villageId: payload.villageId,
      meta: payload.meta,
      physicalFileLocationId: payload.location,
      file_no: payload.file_no,
      year: payload.year,
      typeId: payload.typeId,
    };

    if (payload.aadhar) {
      data_to_update["aadhar"] = payload.aadhar;
    }

    if (payload.remarks) {
      data_to_update["remarks"] = payload.remarks;
    }

    const file_update_response = await prisma.file.update({
      where: { id: parseInt(payload.id.toString()) },
      data: { metaAt: new Date(), ...data_to_update },
    });

    if (!file_update_response)
      return {
        status: false,
        data: null,
        message: "Error while updating file. Please try again.",
        functionname: "AddFile",
      };

    await prisma.file_name.createMany({
      data: payload.names.map((name) => ({
        fileId: file_ressponse.id,
        name,
      })),
    });
    await prisma.file_survey.createMany({
      data: payload.surveyNumbers.map((surveyNumber) => ({
        fileId: file_ressponse.id,
        survey_number: surveyNumber,
        villageId: payload.villageId,
      })),
    });

    return {
      status: true,
      data: file_update_response,
      message: "File details updated successfully.",
      functionname: "AddFile",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "GetFile",
    };
    return response;
  }
};

export default AddFile;
