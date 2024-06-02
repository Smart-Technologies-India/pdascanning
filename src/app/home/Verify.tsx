"use client";
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

interface VerifyProps {
  id: any;
}
const Verify = (props: VerifyProps) => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [userdata, setUserData] = useState<user | null>(null);

  const [isSearch, setSearch] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<file[] | null>(null);

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

    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const file_id = useRef<HTMLInputElement>(null);

  const search = async () => {
    const filesearch: ApiResponseType<file[] | null> = await fileSearch({
      file_id: file_id.current!.value,
    });

    console.log(filesearch);
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
            placeholder="Enter File No"
            id="fileid"
            name="fileid"
            ref={file_id}
          />
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
                  <TableHead>File No</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Scanner</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchData.map((val: any) => {
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
                          onClick={() => router.push(`/viewpage/${val.id}`)}
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
    </div>
  );
};

export default Verify;
