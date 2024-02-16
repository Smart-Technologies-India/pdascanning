"use client";
import getFileType from "@/actions/file/getfiletype";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import { Fa6SolidCircleMinus, Fa6SolidCirclePlus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { file, file_type, problem_file, user } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { default as MulSelect } from "react-select";
import { capitalcase } from "@/utils/methods";
import GetScanners from "@/actions/user/getscanner";
import { ApiResponseType } from "@/models/response";
import fileSearch from "@/actions/file/searchfile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import QCProblemFile from "@/actions/problemfile/qcproblemfile";

interface QcProps {
  id: any;
}
const Qc = (props: QcProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<user | null>(null);
  const [assigns, setAssigns] = useState<user[]>([]);
  const [fileTypes, setFileTypes] = useState<file_type[]>([]);

  const [isSearch, setSearch] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<file[] | null>(null);
  const [problemFile, setProblemFile] = useState<any[] | null>(null);

  const init = async () => {
    setLoading(true);
    const response = await GetUser({ id: parseInt(props.id) });
    if (response.status) {
      setUserData((val) => response.data);
    } else {
      toast.error(response.message);
    }

    const scanner_response = await GetScanners({});
    if (scanner_response.status) {
      setAssigns(scanner_response.data!);
    }

    const file_type_response = await getFileType({});
    if (file_type_response.status) {
      setFileTypes(file_type_response.data!);
    }

    const probfile: any = await QCProblemFile({ id: props.id });
    if (probfile.status) {
      console.log(probfile.data![0].scanneruser.username);
      setProblemFile(probfile.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const [year, setYear] = useState<string | null>(null);

  const [fileType, setFileType] = useState<number>(0);
  const [assign, setAssign] = useState<number>(0);

  const file_no = useRef<HTMLInputElement>(null);

  const search = async () => {
    const filesearch: ApiResponseType<file[] | null> = await fileSearch({
      file_no: file_no.current!.value,
      year: year == null || year == undefined ? undefined : parseInt(year),
      typeId: fileType,
      assign: assign,
    });

    if (filesearch.status) {
      setSearchData(filesearch.data);
      setSearch(true);
      toast.success("File search completed");
    } else {
      toast.error(filesearch.message);
    }
  };

  const logoutbtn = async () => {
    const response = await logout({});
    if (response.status) {
      router.push("/");
    } else {
      toast.error(response.message);
    }
  };

  type YearProps = {
    value: string;
    label: string;
  };
  const options: YearProps[] = Array.from({ length: 63 }, (_, i) => ({
    value: (i + 1960).toString(),
    label: (i + 1960).toString(),
  }));

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
          <h1 className="text-xl">{userdata?.username}</h1>
          <p className="text-2xl grow text-center">PDA Scanning</p>
          <Button onClick={logoutbtn}>Logout</Button>
        </CardHeader>
      </Card>
      <Card className=" h-full p-2 mt-4 px-6">
        <h1 className="text-center text-2xl font-medium">File Details</h1>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File No :
          </label>
          <Input
            placeholder="Enter File No"
            id="fileno"
            name="fileno"
            ref={file_no}
          />
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File Type :
          </label>
          <Select
            onValueChange={(val) => {
              setFileType(parseInt(val));
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>File Type</SelectLabel>
                {fileTypes.map((val) => (
                  <SelectItem key={val.id} value={val.id.toString()}>
                    {val.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center  mt-4">
          <label htmlFor="year" className="w-60">
            Year :
          </label>
          <MulSelect
            isMulti={false}
            options={options}
            className="w-full accent-slate-900"
            onChange={(val) => {
              if (!val) return;
              setYear(val.value);
            }}
          />
        </div>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            Assign To :
          </label>
          <Select
            onValueChange={(val) => {
              setAssign(parseInt(val));
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Users</SelectLabel>
                {assigns.map((val: user) => (
                  <SelectItem key={val.id} value={val.id.toString()}>
                    {val.username}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </Card>
      <Button className="w-full mt-4" onClick={search}>
        Search
      </Button>
      <Card className="mt-6">
        <CardHeader className="py-2 px-4 flex flex-row items-center">
          <h1 className="text-xl">Search Result</h1>
          <div className="grow"></div>
        </CardHeader>
        {isSearch && searchData && searchData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">File Id</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchData.map((val: any) => {
                  if (val.endAt == null) return null;
                  return (
                    <TableRow key={val.id}>
                      <TableCell className="font-medium">{val.id}</TableCell>
                      <TableCell>{val.year}</TableCell>
                      <TableCell>{val.type.name}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => router.push(`/viewfile/${val.id}`)}
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
                  <TableHead className="w-[100px]">Id</TableHead>
                  <TableHead className="w-[100px]">File Id</TableHead>
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
                      <TableCell className="font-medium">{val.id}</TableCell>
                      <TableCell className="font-medium">
                        {val.fileId}
                      </TableCell>
                      <TableCell className="font-medium">{val.pages}</TableCell>
                      <TableCell>{val.scanneruser.username}</TableCell>
                      <TableCell>{val.status}</TableCell>
                      <TableCell>
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

export default Qc;

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
