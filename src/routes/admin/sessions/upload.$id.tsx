import { useState } from "react";
import { useNavigate, useParams } from "@remix-run/react";
import supabaseClient from "~/services/supabase";
import Modal from "~/components/shared/Modal";
import { FileArrowUp, CircleNotchAnimated } from "~/components/shared/Icons";
import Button from "~/components/shared/Button";
import { useUser } from "~/context/user";

export default function Upload() {
  const params = useParams();
  const [operation, setOperation] = useState<{
    file: File | null;
    uploading: boolean;
  }>({ file: null, uploading: false });
  const navigate = useNavigate();
  const { supabaseClient } = useUser();

  const handleClose = () => {
    if (operation.uploading) return;

    navigate("..");
  };

  const handleUpload = () => {
    if (operation.file) {
      if (supabaseClient) {
        setOperation((prev) => ({ ...prev, uploading: true }));
        supabaseClient.storage
          .from("videos")
          .upload(`${params.id}.mp4`, operation.file)
          .then(() => {
            navigate("..");
          });
      }
    }
  };

  return (
    <Modal title="Upload Video" onClose={handleClose}>
      <div className="my-2">
        <p className="text-sm text-gray-500">
          Choose a video file to upload for this session.
        </p>
      </div>
      <label className="disabled:opacity-50">
        <div className="border border-border px-8 py-2 hover:bg-red-400 hover:text-slate-300 flex space-x-2 justify-center items-center">
          {operation.uploading ? <CircleNotchAnimated /> : <FileArrowUp />}
          <span>{operation.file ? operation.file.name : "Choose a file"}</span>
        </div>
        <input
          type="file"
          className="hidden"
          disabled={operation.uploading}
          onChange={(event) => {
            setOperation({
              ...operation,
              file: event.target.files && event.target.files[0],
            });
          }}
        />
      </label>
      <div className="mt-4 flex justify-end space-x-4">
        <Button
          type="button"
          onClick={handleClose}
          disabled={operation.uploading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={operation.uploading || operation.file === null}
        >
          {operation.uploading ? "Uploading" : "Upload"}
        </Button>
      </div>
    </Modal>
  );
}
