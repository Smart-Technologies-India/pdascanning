"use client";
import getFileType from "@/actions/file/getfiletype";
import GetUser from "@/actions/user/getuser";
import logout from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { file, user } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

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
import GetMetaFile from "@/actions/file/getmetafile";
import { Fa6SolidArrowLeftLong } from "@/components/icons";

interface MetaProps {
  id: any;
}
const MetaPage = (props: MetaProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<user | null>(null);
  // const [assigns, setAssigns] = useState<user[]>([]);
  // const [fileTypes, setFileTypes] = useState<file_type[]>([]);

  const [isSearch, setSearch] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<file[] | null>(null);

  const [scanned, setScanned] = useState<file[] | null>(null);

  const init = async () => {
    setLoading(true);
    const response = await GetUser({ id: parseInt(props.id) });
    if (response.status) {
      setUserData((val) => response.data);
    } else {
      toast.error(response.message);
    }

    // const scanner_response = await GetScanners({});
    // if (scanner_response.status) {
    //   setAssigns(scanner_response.data!);
    // }

    // const file_type_response = await getFileType({});
    // if (file_type_response.status) {
    //   setFileTypes(file_type_response.data!);
    // }

    const scannedfile = await GetMetaFile({ id: parseInt(props.id) });
    if (scannedfile.status) {
      setScanned(scannedfile.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  // const [year, setYear] = useState<string | null>(null);

  // const [fileType, setFileType] = useState<number>(0);
  // const [assign, setAssign] = useState<number>(0);

  const file_id = useRef<HTMLInputElement>(null);
  const file_no = useRef<HTMLInputElement>(null);

  const search = async () => {
    const filesearch: ApiResponseType<file[] | null> = await fileSearch({
      file_id: file_id.current!.value,
      file_no: file_no.current!.value,
    });

    if (filesearch.status) {
      if (filesearch.data!.length > 0) {
        const finaldata = filesearch.data!.filter((val) => val.endAt != null);
        if (finaldata.length > 0) {
          setSearchData(finaldata);
          setSearch(true);
          toast.success("File search completed");
        } else {
          setSearchData(null);
          setSearch(false);
          toast.error("No data found");
        }
      } else {
        setSearchData(null);
        setSearch(false);
        toast.error("No data found");
      }
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

  // type YearProps = {
  //   value: string;
  //   label: string;
  // };
  // const options: YearProps[] = Array.from({ length: 65 }, (_, i) => ({
  //   value: (i + 1960).toString(),
  //   label: (i + 1960).toString(),
  // }));

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
            {userdata?.username}-{userdata?.role}
          </h1>
          <p className="text-2xl grow text-center">PDA Scanning</p>
          <Button onClick={logoutbtn}>Logout</Button>
        </CardHeader>
      </Card>
      <Card className=" h-full p-2 mt-4 px-6">
        <h1 className="text-center text-2xl font-medium">File Details</h1>
        <div className="flex gap-2 items-center mt-4">
          <label htmlFor="fileid" className="w-60">
            File Id :
          </label>
          <Input
            placeholder="Enter File Id"
            id="fileid"
            name="fileid"
            ref={file_id}
          />
        </div>
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
        {/* <div className="flex gap-2 items-center mt-4">
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
        </div> */}
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
                  <TableHead>File No</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Scanner</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchData.map((val: any) => {
                  if (val.endAt == null) return null;
                  return (
                    <TableRow key={val.id}>
                      <TableCell className="font-medium">
                        {val.file_id}
                      </TableCell>
                      <TableCell>{val.file_no}</TableCell>
                      <TableCell>{val.year}</TableCell>
                      <TableCell>{val.type.name}</TableCell>
                      <TableCell>{val.assignTo.username}</TableCell>
                      <TableCell>
                        {val.village == null || val.village == undefined ? (
                          <Button
                            onClick={() =>
                              router.push(`/home/adddata/${val.id}`)
                            }
                          >
                            Add
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push(`/viewfile/${val.id}`)}
                          >
                            View
                          </Button>
                        )}
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
          <h1 className="text-xl">Scanner Completed</h1>
          <div className="grow"></div>
        </CardHeader>
        {scanned && scanned.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">File Id</TableHead>
                  <TableHead>File No.</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Scanner</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanned.map((val: any) => {
                  if (val.endAt == null) return null;
                  return (
                    <TableRow key={val.id}>
                      <TableCell className="font-medium">
                        {val.file_id}
                      </TableCell>
                      <TableCell>{val.file_no}</TableCell>
                      <TableCell>{val.year}</TableCell>
                      <TableCell>{val.type.name}</TableCell>
                      <TableCell>{val.assignTo.username}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => router.push(`/home/adddata/${val.id}`)}
                        >
                          Add
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
    </div>
  );
};

export default MetaPage;
