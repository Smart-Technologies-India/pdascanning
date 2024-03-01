"use client";

import ProblemFile from "@/actions/problemfile/createupdateproblem";
import GetFile from "@/actions/file/getfile";
import getProblemFileFromFileId from "@/actions/problemfile/getproblemfile";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import verifyFile from "@/actions/file/verifyfile";
import { Fa6SolidArrowLeftLong } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Role, user } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import updateStatus from "@/actions/problemfile/updatestatus";
import Link from "next/link";

interface ViewFileProps {
  id: number;
  fileid: number;
}
const ViewFile = (props: ViewFileProps) => {
  const router = useRouter();

  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<any | null>(null);
  const [filedata, setFileData] = useState<any>(null);

  const [problemfile, setProblemfile] = useState<any>(null);

  const problem = useRef<HTMLTextAreaElement>(null);

  const init = async () => {
    setLoading(true);

    const responseuser = await GetUser({ id: props.id });
    if (responseuser.status) {
      setUserData((val: any) => responseuser.data);
    } else {
      toast.error(responseuser.message);
    }

    const response = await GetFile({ id: props.fileid });
    if (response.status) {
      setFileData((val: any) => response.data);
    } else {
      toast.error(response.message);
    }

    const problemfileresponse = await getProblemFileFromFileId({
      fileid: props.fileid.toString(),
    });
    if (problemfileresponse.status) {
      setProblemfile((val: any) => problemfileresponse.data);
      if (responseuser.data?.role == "QC") {
        if (problemfileresponse.data?.status == "COMPLETED") {
        } else {
          setTimeout(() => {
            problem.current!.value = problemfileresponse.data?.pages ?? "";
          }, 500);
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const logoutbtn = async () => {
    const response = await logout({});
    if (response.status) {
      router.push("/");
    } else {
      toast.error(response.message);
    }
  };

  const verifyfile = async () => {
    const response = await verifyFile({ id: props.fileid });
    if (response.status) {
      toast.success(response.message);
      init();
    } else {
      toast.error(response.message);
    }
  };

  const solved = async () => {
    const updatestatus = await updateStatus({
      status: "COMPLETED",
      id: problemfile == null ? 0 : parseInt(problemfile.id ?? "0"),
      fileid: props.fileid,
      fromUserId: props.id,
      toUserId: filedata.assignTo.id,
    });
    if (updatestatus.status) {
      init();
      toast.success(updatestatus.message);
    } else {
      toast.error(updatestatus.message);
    }
  };

  const addproblem = async () => {
    const response = await ProblemFile({
      pages: problem.current?.value!,
      fileid: props.fileid.toString(),
      fromUserId: props.id,
      toUserId: filedata.assignTo.id,
    });
    if (response.status) {
      toast.success(response.message);
      init();
    } else {
      toast.error(response.message);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen w-full grid place-items-center text-3xl text-gray-600 bg-gray-200">
        Loading...
      </div>
    );

  return (
    <>
      <div className="min-h-screen p-2 mx-auto w-5/6">
        <Card>
          <CardHeader className="py-2 px-4 flex flex-row items-center gap-4">
            <Fa6SolidArrowLeftLong
              className="text-2xl cursor-pointer"
              onClick={() => router.back()}
            />
            <h1 className="text-xl">
              {userdata?.username}-{userdata.role}
            </h1>
            <p className="text-2xl grow text-center">PDA Scanning</p>
            <Button onClick={logoutbtn}>Logout</Button>
          </CardHeader>
        </Card>

        <Card className=" h-full p-2 mt-4 px-6">
          <div className="flex">
            <h1 className="text-center text-2xl font-medium">
              Search File Details
            </h1>
            <div className="grow"></div>
            <Link
              className="text-white bg-black py-2 px-4 rounded-md"
              target="_blank"
              href={`/file/${filedata.file_id}`}
            >
              View File
            </Link>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File Id :
            </label>
            <p>{filedata.file_id}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File No :
            </label>
            <p>{filedata.file_no}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              File Type :
            </label>
            <p>{filedata.type.name}</p>
          </div>
          <div className="flex gap-2 items-center mt-4">
            <label htmlFor="fileid" className="w-60">
              Scanner :
            </label>
            <p>{filedata.assignTo.username}</p>
          </div>

          {filedata.startAt && (
            <div className="flex gap-2 items-start  mt-4">
              <label htmlFor="remark" className="w-60">
                Scanning Start At:
              </label>
              <p>{new Date(filedata.startAt).toLocaleString()}</p>
            </div>
          )}
          {filedata.endAt && (
            <div className="flex gap-2 items-start  mt-4">
              <label htmlFor="remark" className="w-60">
                Scanning End At:
              </label>
              <p>{new Date(filedata.endAt).toLocaleString()}</p>
            </div>
          )}

          {filedata.village && filedata.village.name && (
            <div className="flex gap-2 items-center mt-4">
              <label htmlFor="fileid" className="w-60">
                Village :
              </label>
              <p>{filedata.village.name}</p>
            </div>
          )}
          {filedata.applicant_name && (
            <div className="flex gap-2 items-center  mt-4">
              <label htmlFor="name" className="w-60">
                Applicant Name :
              </label>
              <p>{filedata.applicant_name}</p>
            </div>
          )}

          {filedata.applicant_address && (
            <div className="flex gap-2 items-center  mt-4">
              <label htmlFor="address" className="w-60">
                Applicant Address :
              </label>
              <p>{filedata.applicant_address}</p>
            </div>
          )}

          {filedata.survey_number && (
            <div className="flex gap-2 items-center  mt-4">
              <label htmlFor="survey" className="w-60">
                Survey Number :
              </label>
              <p>{filedata.survey_number}</p>
            </div>
          )}

          <div className="flex gap-2 items-center  mt-4">
            <label htmlFor="year" className="w-60">
              Year :
            </label>
            <p>{filedata.year}</p>
          </div>

          {filedata.aadhar && (
            <div className="flex gap-2 items-center mt-4">
              <label htmlFor="adhar" className="w-60">
                Aadhar/Pan/GST :
              </label>
              <p>{filedata.aadhar}</p>
            </div>
          )}

          {filedata.remarks && (
            <div className="flex gap-2 items-start  mt-4">
              <label htmlFor="remark" className="w-60">
                Remarks :
              </label>
              <p>{filedata.remarks}</p>
            </div>
          )}

          {filedata.verifiedAt && (
            <div className="flex gap-2 items-start  mt-4">
              <label htmlFor="remark" className="w-60">
                Verified At:
              </label>
              <p>{new Date(filedata.verifiedAt).toDateString()}</p>
            </div>
          )}

          {userdata!.role == Role.QC ? (
            <>
              {problemfile == null ? (
                <>
                  <div className="h-10"></div>
                  <Textarea
                    ref={problem}
                    placeholder="Type your problem page with , ex: 1,4,56,75"
                  />
                  <Button className="w-full mt-4" onClick={addproblem}>
                    Add Problem
                  </Button>
                  <Button className="w-full mt-4 bg-green-500" onClick={solved}>
                    Solved
                  </Button>
                </>
              ) : problemfile.status == "COMPLETED" ? (
                <></>
              ) : (
                <>
                  <div className="h-10"></div>
                  <Textarea
                    ref={problem}
                    placeholder="Type your problem page with , ex: 1,4,56,75"
                  />
                  <Button className="w-full mt-4" onClick={addproblem}>
                    Add Problem
                  </Button>
                  <Button className="w-full mt-4 bg-green-500" onClick={solved}>
                    Solved
                  </Button>
                </>
              )}
            </>
          ) : (
            <></>
          )}
        </Card>

        {userdata.role == "ENTRY" || userdata.role == "SCANNER" ? (
          <></>
        ) : (
          <div className="flex gap-4 mt-4 w-full flex-wrap">
            <Card className="p-2 min-w-60 flex-1">
              <h1 className="text-center text-xl font-semibold">Names</h1>
              {filedata.file_name.length > 0 ? (
                <div>
                  {filedata.file_name.map((val: any, index: number) => (
                    <h1 key={index}>
                      {index + 1}. {val.name}
                    </h1>
                  ))}
                </div>
              ) : (
                <h1 className="text-center mt-2">No File Name</h1>
              )}
            </Card>

            <Card className="p-2 min-w-60 flex-1">
              <h1 className="text-center text-xl font-semibold">File survey</h1>
              {filedata.file_survey.length > 0 ? (
                <div>
                  {filedata.file_survey.map((val: any, index: number) => (
                    <h1 key={index}>
                      {index + 1}. {val.survey_number}
                    </h1>
                  ))}
                </div>
              ) : (
                <h1 className="text-center mt-2">No File survey</h1>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewFile;
