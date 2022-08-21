import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@remix-run/react";
import supabaseClient from "~/services/supabase";
import Modal from "~/components/shared/Modal";

export default function View() {
  const params = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<string>();

  const handleClose = () => navigate("..");

  useEffect(() => {
    supabaseClient()
      .storage.from("videos")
      .createSignedUrl(`${params.id}.mp4`, 60)
      .then(({ data, error }) => {
        if (data) {
          setVideo(data.signedUrl);
        }
      });
  }, [params.id]);

  return (
    <Modal title="View Video" onClose={handleClose}>
      {video ? (
        <video controls autoPlay className="w-full bg-black my-4">
          <source src={video} type="video/mp4" />
          Sorry, your browser doesn't support embedded videos.
        </video>
      ) : (
        <div className="bg-black w-full h-[225px]">&nbsp;</div>
      )}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="border border-border px-8 py-2 hover:bg-red-400 hover:text-slate-300"
          onClick={handleClose}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
