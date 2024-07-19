"use client";
import getFileType from "@/actions/file/getfiletype";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import { Fa6SolidCircleMinus, Fa6SolidCirclePlus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { file, user } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { capitalcase, handleNumberChange } from "@/utils/methods";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GetScannerFile from "@/actions/file/getscannerfile";
import updateFile from "@/actions/file/updatefile";
import UserProblemFile from "@/actions/problemfile/userproblem";
import updateStatus from "@/actions/problemfile/updatestatus";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import GetScannerFileCount from "@/actions/file/getscannerfilecount";

interface ScannerProps {
  id: any;
}
const Scanner = (props: ScannerProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<user | null>(null);
  const [searchData, setSearchData] = useState<file[]>([]);
  const [scannerFileData, setScannerFileData] = useState<file[]>([]);

  const [problemFile, setProblemFile] = useState<any[]>([]);

  const pageCountRef = useRef<HTMLInputElement>(null);
  const mapCountRef = useRef<HTMLInputElement>(null);

  const init = async () => {
    setLoading(true);
    const response = await GetUser({ id: parseInt(props.id) });
    if (response.status) {
      setUserData((val) => response.data);
    } else {
      toast.error(response.message);
    }

    const scanner_response = await GetScannerFile({ id: parseInt(props.id) });
    if (scanner_response.status) {
      setSearchData(scanner_response.data ?? []);
    }

    const scanner_file_response = await GetScannerFileCount({
      id: parseInt(props.id),
    });
    if (scanner_file_response.status) {
      setScannerFileData(scanner_file_response.data ?? []);
    }

    const probfile: any = await UserProblemFile({ id: props.id });
    if (probfile.status) {
      setProblemFile(probfile.data);
    }

    setLoading(false);
  };

  const forwarttoqc = async (id: string, status: string) => {
    const updatestatus = await updateStatus({
      status: status,
      id: parseInt(id),
      fileid: 0,
      toUserId: 0,
      fromUserId: 0,
    });
    if (updatestatus.status) {
      init();
      toast.success(updatestatus.message);
    } else {
      toast.error(updatestatus.message);
    }
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

  const updateStart = async (id: number) => {
    const response = await updateFile({
      id: id,
      startAt: new Date().toISOString(),
    });
    if (response.status) {
      init();
    } else {
      toast.error(response.message);
    }
  };

  const updateEnd = async (id: number) => {
    if (
      pageCountRef.current?.value == null ||
      pageCountRef.current?.value == undefined ||
      pageCountRef.current?.value == ""
    ) {
      return toast.error("Enter Page count");
    }
    if (
      mapCountRef.current?.value == null ||
      mapCountRef.current?.value == undefined ||
      mapCountRef.current?.value == ""
    ) {
      return toast.error("Enter Map count");
    }
    const response = await updateFile({
      id: id,
      endAt: new Date().toISOString(),
      pagecount: parseInt(pageCountRef.current?.value),
      mapcount: parseInt(mapCountRef.current?.value),
    });
    if (response.status) {
      init();
    } else {
      toast.error(response.message);
    }
  };

  const getFileCount = (): number => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const filteredData = scannerFileData.filter((val: file) => {
      const endDate = new Date(val.endAt!);
      return (
        endDate.getFullYear() === currentYear &&
        endDate.getMonth() === currentMonth &&
        endDate.getDate() === currentDay
      );
    });

    return filteredData.length;
  };

  const getPageCount = (): number => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const filteredData = scannerFileData.filter((val: file) => {
      const endDate = new Date(val.endAt!);
      return (
        endDate.getFullYear() === currentYear &&
        endDate.getMonth() === currentMonth &&
        endDate.getDate() === currentDay
      );
    });

    let count = 0;
    for (let i = 0; i < filteredData.length; i++) {
      count += filteredData[i].pagecount ?? 0;
    }

    return count;
  };
  const getMapCount = (): number => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const filteredData = scannerFileData.filter((val: file) => {
      const endDate = new Date(val.endAt!);
      return (
        endDate.getFullYear() === currentYear &&
        endDate.getMonth() === currentMonth &&
        endDate.getDate() === currentDay
      );
    });

    let count = 0;
    for (let i = 0; i < filteredData.length; i++) {
      count += filteredData[i].mapcount ?? 0;
    }

    return count;
  };

  if (isLoading)
    return (
      <div className="h-screen w-full grid place-items-center text-3xl text-gray-600 bg-gray-200">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen p-2 mx-auto w-5/6">
      <Card>
        <CardHeader className="py-2 px-4 flex flex-row items-center">
          <h1 className="text-xl">
            {userdata?.username}-{userdata!.role}
          </h1>
          <p className="text-2xl grow text-center">PDA Scanning</p>
          <Button onClick={logoutbtn}>Logout</Button>
        </CardHeader>
      </Card>
      <Card className="mt-4 px-4 py-2">
        <div className="flex items-center">
          <h1 className="text-xl">Scanner File Status</h1>
          <div className="grow"></div>
        </div>
        <div className="grid gap-4 grid-cols-4 mt-2">
          <Card className="h-full p-2 px-4">
            <h1>Pending File Count</h1>
            <p className="text-2xl">{searchData.length}</p>
          </Card>
          <Card className="h-full p-2 px-4">
            <h1>Today File Count</h1>
            <p className="text-2xl">{getFileCount()}</p>
          </Card>
          <Card className="h-full p-2 px-4">
            <h1>Today Page Count</h1>
            <p className="text-2xl">{getPageCount()}</p>
          </Card>
          <Card className="h-full p-2 px-4">
            <h1>Today Map Count</h1>
            <p className="text-2xl">{getMapCount()}</p>
          </Card>
        </div>
      </Card>
      <Card className="mt-6">
        <CardHeader className="py-2 px-4 flex flex-row items-center">
          <h1 className="text-xl">Assigned Result</h1>
          <div className="grow"></div>
          <p>Found: {searchData?.length}</p>
        </CardHeader>
        {searchData && searchData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">File Id</TableHead>
                  <TableHead>File No</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchData.map((val: any) => (
                  <TableRow
                    key={val.id}
                    className={
                      val.startAt != null && val.endAt == null
                        ? "bg-red-400 hover:bg-red-400 bg-opacity-30 hover:bg-opacity-40"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">{val.file_id}</TableCell>
                    <TableCell className="font-medium">{val.file_no}</TableCell>
                    <TableCell>{val.year}</TableCell>
                    <TableCell>{val.type.name}</TableCell>
                    <TableCell>
                      {val.startAt == null ? (
                        <Button onClick={() => updateStart(val.id)}>
                          Start Timer
                        </Button>
                      ) : (
                        new Date(val.startAt).toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      {val.endAt == null ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              disabled={
                                val.startAt == null || val.startAt == undefined
                              }
                            >
                              End Timer
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                  Add End Time
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Add data and processed
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="page">Page Count</Label>
                                  <Input
                                    ref={pageCountRef}
                                    id="page"
                                    name="page"
                                    className="col-span-2 h-8"
                                    onChange={handleNumberChange}
                                  />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <Label htmlFor="map">Map Count</Label>
                                  <Input
                                    id="map"
                                    className="col-span-2 h-8"
                                    name="page"
                                    ref={mapCountRef}
                                    onChange={handleNumberChange}
                                  />
                                </div>
                                <Button onClick={() => updateEnd(val.id)}>
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        new Date(val.endAt).toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/viewfile/${val.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p>No data found</p>
          </div>
        )}
      </Card>
      <Card className="mt-6">
        <CardHeader className="py-2 px-4 flex flex-row items-center">
          <h1 className="text-xl">Problem file</h1>
          <div className="grow"></div>
        </CardHeader>
        {problemFile && problemFile.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">File Id</TableHead>
                  <TableHead className="w-[100px]">File No</TableHead>
                  <TableHead className="w-[100px]">Pages</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problemFile.map((val: any) => {
                  return (
                    <TableRow key={val.id}>
                      <TableCell className="font-medium">
                        {val.file.file_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {val.fileId}
                      </TableCell>
                      <TableCell className="font-medium">{val.pages}</TableCell>
                      <TableCell>{val.scanneruser.username}</TableCell>
                      <TableCell>{val.status}</TableCell>
                      <TableCell className="flex gap-4">
                        {val.status === "PENDING" && (
                          <Button
                            onClick={async () =>
                              await forwarttoqc(val.id, "RESOLVED")
                            }
                          >
                            Resolved
                          </Button>
                        )}
                        <Button
                          onClick={() => router.push(`/viewfile/${val.fileId}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p>There is no problem file</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Scanner;

interface InputCardProps {
  title: string;
  values: string[];
  setvalue: React.Dispatch<React.SetStateAction<string[]>>;
}
const InputCard = (props: InputCardProps) => {
  return (
    <Card className="p-2 min-w-60 flex-1">
      <div className="flex items-center">
        <h1 className="text-center text-xl font-medium grow">{props.title}</h1>
        <Fa6SolidCirclePlus
          className="text-xl cursor-pointer text-green-500"
          onClick={() => {
            if (props.values.length > 10) {
              toast.error("You can add only 10 names");
              return;
            }

            if (props.values[props.values.length - 1] === "") {
              toast.error("Please fill the previous name");
              return;
            }
            props.setvalue((val) => [...val, ""]);
          }}
        />
      </div>
      <div className="flex flex-col mt-4 gap-2">
        {props.values.map((val, index) => (
          <div key={index} className="flex gap-2 text-center items-center">
            <Input
              value={val}
              onChange={(e) => {
                const temp = [...props.values];

                if (props.title == "Name") {
                  temp[index] = capitalcase(e.target.value);
                } else {
                  temp[index] = e.target.value;
                }
                props.setvalue((val) => temp);
              }}
              placeholder={props.title}
            />
            <Fa6SolidCircleMinus
              className="text-2xl text-rose-500 cursor-pointer"
              onClick={() => {
                const temp = [...props.values];
                temp.splice(index, 1);
                props.setvalue((val) => temp);
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
