"use server";

import { ApiResponseType } from "@/models/response";
import { errorToString, formateDate } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { file, Role } from "@prisma/client";

interface DateCounterPayload {
  date: string;
}

interface ResponseData {
  id: number;
  name: string;
  role: string;
  filecount: number;
  pagecount: number;
  mapcount: number;
}

const DateCounter = async (
  payload: DateCounterPayload
): Promise<ApiResponseType<any>> => {
  try {
    // scanner end date
    // meta and qc updated at
    // entry created at
    // verify verifyed at

    const metafileresponse = await prisma.file.findMany({
      where: {
        metaAt: {
          gte: new Date(payload.date), // Start of the day
          lt: new Date(
            new Date(payload.date).setDate(new Date(payload.date).getDate() + 1)
          ), // Start of the next day
        },
      },
    });

    if (!metafileresponse) {
      return {
        status: false,
        data: null,
        message: "Unable to get files. Please try again.",
        functionname: "DateCounter",
      };
    }

    const qcfileresponse = await prisma.file.findMany({
      where: {
        updatedAt: {
          gte: new Date(payload.date), // Start of the day
          lt: new Date(
            new Date(payload.date).setDate(new Date(payload.date).getDate() + 1)
          ), // Start of the next day
        },
      },
    });

    if (!qcfileresponse) {
      return {
        status: false,
        data: null,
        message: "Unable to get files. Please try again.",
        functionname: "Counter",
      };
    }

    const scannerfileresponse = await prisma.file.findMany({
      where: {
        endAt: {
          gte: new Date(payload.date), // Start of the day
          lt: new Date(
            new Date(payload.date).setDate(new Date(payload.date).getDate() + 1)
          ), // Start of the next day
        },
      },
    });

    if (!scannerfileresponse) {
      return {
        status: false,
        data: null,
        message: "Unable to get files. Please try again.",
        functionname: "Counter",
      };
    }

    const entryfileresponse = await prisma.file.findMany({
      where: {
        createdAt: {
          gte: new Date(payload.date), // Start of the day
          lt: new Date(
            new Date(payload.date).setDate(new Date(payload.date).getDate() + 1)
          ), // Start of the next day
        },
      },
    });

    if (!entryfileresponse) {
      return {
        status: false,
        data: null,
        message: "Unable to get files. Please try again.",
        functionname: "Counter",
      };
    }

    const userresponse = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [
          {
            role: "ENTRY",
          },
          {
            role: "META",
          },
          {
            role: "QC",
          },
          {
            role: "SCANNER",
          },
        ],
      },
    });
    if (!userresponse) {
      return {
        status: false,
        data: null,
        message: "Unable to get users. Please try again.",
        functionname: "Counter",
      };
    }

    let responsedata: ResponseData[] = [];

    for (let i = 0; i < userresponse.length; i++) {
      if (userresponse[i].role == Role.ENTRY) {
        const userentryfile = entryfileresponse.filter(
          (val: file) => val.userId == userresponse[i].id
        );

        let data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          filecount: 0,
          pagecount: 0,
          mapcount: 0,
        };
        for (let j = 0; j < userentryfile.length; j++) {
          data.filecount += 1;
          data.pagecount += userentryfile[j].pagecount!;
          data.mapcount += userentryfile[j].mapcount!;
        }

        responsedata.push(data);
      } else if (userresponse[i].role == Role.META) {
        const usermetafile = metafileresponse.filter(
          (val: file) => val.meta == userresponse[i].id
        );
        let data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          filecount: 0,
          pagecount: 0,
          mapcount: 0,
        };
        for (let j = 0; j < usermetafile.length; j++) {
          data.filecount += 1;
          data.pagecount += usermetafile[j].pagecount!;
          data.mapcount += usermetafile[j].mapcount!;
        }

        responsedata.push(data);
      } else if (userresponse[i].role == Role.QC) {
        const userqcfile = qcfileresponse.filter(
          (val: file) => val.qc == userresponse[i].id
        );

        let data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          filecount: 0,
          pagecount: 0,
          mapcount: 0,
        };
        for (let j = 0; j < userqcfile.length; j++) {
          data.filecount += 1;
          data.pagecount += userqcfile[j].pagecount!;
          data.mapcount += userqcfile[j].mapcount!;
        }

        responsedata.push(data);
      } else if (userresponse[i].role == Role.SCANNER) {
        const userscannerfile = scannerfileresponse.filter(
          (val: file) => val.assign == userresponse[i].id
        );

        let data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          filecount: 0,
          pagecount: 0,
          mapcount: 0,
        };
        for (let j = 0; j < userscannerfile.length; j++) {
          data.filecount += 1;
          data.pagecount += userscannerfile[j].pagecount!;
          data.mapcount += userscannerfile[j].mapcount!;
        }

        responsedata.push(data);
      }
    }

    return {
      status: true,
      data: responsedata,
      message: "All count get.",
      functionname: "DateCounter",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "DateCounter",
    };
    return response;
  }
};

export default DateCounter;
