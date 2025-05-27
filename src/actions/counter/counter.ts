"use server";

import { ApiResponseType } from "@/models/response";
import { errorToString, formateDate } from "@/utils/methods";
import prisma from "../../../prisma/database";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { file, Role } from "@prisma/client";

interface CounterPayload {}

interface DataResponse {
  date: string;
  filecount: number;
  pagecount: number;
  mapcount: number;
}

interface ResponseData {
  id: number;
  name: string;
  role: string;
  data: DataResponse[];
}

const Counter = async (
  payload: CounterPayload
): Promise<ApiResponseType<any>> => {
  try {
    const enddate = new Date();
    const startDate = subDays(enddate, 7);

    // scanner end date
    // meta and qc updated at
    // entry created at
    // verify verifyed at

    const metafileresponse = await prisma.file.findMany({
      where: {
        deletedAt: null,
        metaAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(enddate),
        },
      },
    });

    if (!metafileresponse) {
      return {
        status: false,
        data: null,
        message: "Unable to get files. Please try again.",
        functionname: "Counter",
      };
    }

    const qcfileresponse = await prisma.file.findMany({
      where: {
        deletedAt: null,
        updatedAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(enddate),
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
        deletedAt: null,
        endAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(enddate),
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
        deletedAt: null,
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(enddate),
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
    // const verifyfileresponse = await prisma.file.findMany({
    //   where: {
    //     verifiedAt: {
    //       gte: startOfDay(startDate),
    //       lte: endOfDay(enddate),
    //     },
    //   },
    // });

    // if (!verifyfileresponse) {
    //   return {
    //     status: false,
    //     data: null,
    //     message: "Unable to get files. Please try again.",
    //     functionname: "Counter",
    //   };
    // }

    const userresponse = await prisma.user.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
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

        let dataadd: DataResponse[] = [];

        for (let j = 0; j < userentryfile.length; j++) {
          //   const date = userentryfile[j].createdAt.toString().split("T")[0];
          const date = formateDate(
            new Date(userentryfile[j].createdAt ?? new Date().toISOString())
          );

          const existingEntry = dataadd.find((entry) => entry.date === date);
          if (existingEntry) {
            existingEntry.filecount += 1;
            existingEntry.pagecount += userentryfile[j].pagecount!;
            existingEntry.mapcount += userentryfile[j].mapcount!;
          } else {
            const data: DataResponse = {
              filecount: 1,
              pagecount: userentryfile[j].pagecount!,
              mapcount: userentryfile[j].mapcount!,
              date: date,
            };
            dataadd.push(data);
          }
        }

        const data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          data: dataadd,
        };
        responsedata.push(data);
      } else if (userresponse[i].role == Role.META) {
        const usermetafile = metafileresponse.filter(
          (val: file) => val.meta == userresponse[i].id
        );
        let dataadd: DataResponse[] = [];

        for (let j = 0; j < usermetafile.length; j++) {
          //   const date = usermetafile[j].metaAt!.toString().split("T")[0];
          const date = formateDate(
            new Date(usermetafile[j].metaAt ?? new Date().toISOString())
          );

          const existingEntry = dataadd.find((entry) => entry.date === date);
          if (existingEntry) {
            existingEntry.filecount += 1;
            existingEntry.pagecount += usermetafile[j].pagecount!;
            existingEntry.mapcount += usermetafile[j].mapcount!;
          } else {
            const data: DataResponse = {
              filecount: 1,
              pagecount: usermetafile[j].pagecount!,
              mapcount: usermetafile[j].mapcount!,
              date: date,
            };
            dataadd.push(data);
          }
        }

        const data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          data: dataadd,
        };
        responsedata.push(data);
      } else if (userresponse[i].role == Role.QC) {
        const userqcfile = qcfileresponse.filter(
          (val: file) => val.qc == userresponse[i].id
        );

        let dataadd: DataResponse[] = [];
        for (let j = 0; j < userqcfile.length; j++) {
          //   const date = userqcfile[j].updatedAt.toString().split("T")[0];
          const date = formateDate(
            new Date(userqcfile[j].updatedAt ?? new Date().toISOString())
          );

          const existingEntry = dataadd.find((entry) => entry.date === date);
          if (existingEntry) {
            existingEntry.filecount += 1;
            existingEntry.pagecount += userqcfile[j].pagecount!;
            existingEntry.mapcount += userqcfile[j].mapcount!;
          } else {
            const data: DataResponse = {
              filecount: 1,
              pagecount: userqcfile[j].pagecount!,
              mapcount: userqcfile[j].mapcount!,
              date: date,
            };
            dataadd.push(data);
          }
        }

        const data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          data: dataadd,
        };
        responsedata.push(data);
      } else if (userresponse[i].role == Role.SCANNER) {
        const userscannerfile = scannerfileresponse.filter(
          (val: file) => val.assign == userresponse[i].id
        );

        let dataadd: DataResponse[] = [];

        for (let j = 0; j < userscannerfile.length; j++) {
          const date = formateDate(
            new Date(userscannerfile[j].endAt ?? new Date().toISOString())
          );
          //   const date = userscannerfile[j].endAt!.toString().split("T")[0];

          const existingEntry = dataadd.find((entry) => entry.date === date);
          if (existingEntry) {
            existingEntry.filecount += 1;
            existingEntry.pagecount += userscannerfile[j].pagecount!;
            existingEntry.mapcount += userscannerfile[j].mapcount!;
          } else {
            const data: DataResponse = {
              filecount: 1,
              pagecount: userscannerfile[j].pagecount!,
              mapcount: userscannerfile[j].mapcount!,
              date: date,
            };
            dataadd.push(data);
          }
        }

        const data: ResponseData = {
          id: userresponse[i].id,
          name: userresponse[i].username,
          role: userresponse[i].role,
          data: dataadd,
        };
        responsedata.push(data);
      }
    }

    return {
      status: true,
      data: responsedata,
      message: "All count get.",
      functionname: "Counter",
    };
  } catch (e) {
    const response: ApiResponseType<null> = {
      status: false,
      data: null,
      message: errorToString(e),
      functionname: "Counter",
    };
    return response;
  }
};

export default Counter;
